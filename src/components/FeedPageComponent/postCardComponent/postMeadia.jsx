// PostMedia with URL-based Dominant Color + Blurred Background + Native Controls
import React, { useEffect, useRef, useState } from "react";

export default function PostMedia({
  type = "image",
  contentUrl = "",
  videoRef,
  isMuted,
  isPlaying,
  togglePlayPause,
  toggleMute,
  onDoubleTap,
  onCommentsClick,
  preloadNext,
}) {
  const containerRef = useRef(null);
  const [showHeart, setShowHeart] = useState(false);
  const [dominantColor, setDominantColor] = useState("#222");

  // 🔥 KEY FIX: Detect autoplay vs manual play
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const lastTap = useRef(0);

  /* --------------------------------------------------------------
      SAFE DOMINANT COLOR (NO CORS)
  -------------------------------------------------------------- */
  const extractColorFromURL = (url) => {
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = url.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;
    return `rgb(${Math.abs(r)}, ${Math.abs(g)}, ${Math.abs(b)})`;
  };

  useEffect(() => {
    if (contentUrl) {
      setDominantColor(extractColorFromURL(contentUrl));
    }
  }, [contentUrl]);

  /* --------------------------------------------------------------
      AUTO PLAY WHEN VISIBLE, PAUSE WHEN OUTSIDE VIEW
  -------------------------------------------------------------- */
  useEffect(() => {
    if (type !== "video" || !videoRef.current) return;

    const vid = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;

        if (visible) {
          // Autoplay mode
          setIsAutoPlaying(true);
          vid.play().catch(() => { });
        } else {
          // Exit autoplay mode
          setIsAutoPlaying(false);
          vid.pause();
        }
      },
      { threshold: 0.65 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [type, videoRef]);

  /* --------------------------------------------------------------
      DOUBLE TAP LIKE
  -------------------------------------------------------------- */
  const handleTap = () => {
    const now = Date.now();

    if (now - lastTap.current < 250) {
      setShowHeart(true);
      onDoubleTap?.();
      setTimeout(() => setShowHeart(false), 600);
    }
    lastTap.current = now;
  };

  /* --------------------------------------------------------------
      BLURRED BACKGROUND
  -------------------------------------------------------------- */
  const ColorBackground = () => (
    <div
      className="absolute inset-0 z-0"
      style={{
        background: `radial-gradient(circle, ${dominantColor}55, ${dominantColor}EE)`,
        filter: "blur(40px)",
        transform: "scale(1.25)",
      }}
    />
  );

  /* --------------------------------------------------------------
      IMAGE
  -------------------------------------------------------------- */
  if (type === "image") {
    return (
      <>
        <div onClick={onCommentsClick}>
          <div
            ref={containerRef}
            onClick={handleTap}
            className="relative w-full flex items-center justify-center overflow-hidden"
            style={{ height: "min(80vh, 520px)" }}
          >
            <ColorBackground />
            <img
              src={contentUrl}
              className="absolute inset-0 w-full h-full object-contain z-10"
              alt=""
            />

            {showHeart && <HeartAnimation />}
          </div>
        </div>
      </>
    );
  }

  /* --------------------------------------------------------------
      VIDEO WITH NATIVE CONTROLS
  -------------------------------------------------------------- */
  return (

    <>
      <div
        ref={containerRef}
        onClick={onCommentsClick}
        className="relative w-full flex items-center justify-center overflow-hidden"
        style={{ height: "min(80vh, 520px)" }}
      >
        <ColorBackground />

        {/* VIDEO WITH NATIVE CONTROLS */}
        <video
          ref={videoRef}
          src={contentUrl}
          muted={isMuted}
          playsInline
          preload="metadata"
          controls
          className="absolute inset-0 w-full h-full object-contain z-10"
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleTap();
          }}
        />

        {showHeart && <HeartAnimation />}
      </div>
    </>
  );
}

/* --------------------------------------------------------------
 ❤️ Heart Animation
-------------------------------------------------------------- */
const HeartAnimation = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
    <div className="text-white text-6xl animate-pop-heart">❤️</div>
    <style>{`
      .animate-pop-heart {
        animation: popHeart 0.6s ease forwards;
      }
      @keyframes popHeart {
        0% { transform: scale(0.4); opacity: 0.6; }
        60% { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 0; }
      }
    `}</style>
  </div>
);
