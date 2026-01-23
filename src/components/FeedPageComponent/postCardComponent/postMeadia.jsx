import React, { useEffect, useRef, useState } from "react";

const FILTER_STYLES = {
  original: '',
  aden: 'hue-rotate(-20deg) contrast(0.9) saturate(0.85) brightness(1.2)',
  clarendon: 'contrast(1.2) saturate(1.35)',
  crema: 'sepia(0.5) contrast(1.2) saturate(0.9) hue-rotate(-20deg)',
  gingham: 'hue-rotate(150deg) sepia(0.2) contrast(0.9)',
  juno: 'saturate(1.2) contrast(1.1) brightness(1.1)',
  lark: 'contrast(0.9)',
  ludwig: 'saturate(1.1) contrast(1.1)',
  moon: 'grayscale(1) contrast(1.1) brightness(1.1)',
  perpetua: 'saturate(1.1)',
  reyes: 'sepia(0.22) brightness(1.1) contrast(0.85) saturate(0.75)',
  slumber: 'saturate(0.6) brightness(1.05)'
};

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
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  aspectRatio = "1:1",
  editMetadata = {},
  isTemplate = false,
}) {
  const containerRef = useRef(null);
  const [showHeart, setShowHeart] = useState(false);
  const [dominantColor, setDominantColor] = useState("#222");
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const filterPreset = editMetadata?.filters?.preset || 'original';
  const filterStyle = FILTER_STYLES[filterPreset] || '';
  const zoomLevel = editMetadata?.crop?.zoomLevel || 1;
  const objectFitClass = isTemplate ? "object-contain" : "object-contain";

  const lastTap = useRef(0);

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

  useEffect(() => {
    if (type !== "video" || !videoRef.current) return;

    const vid = videoRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries[0].isIntersecting;

        if (visible) {
          setIsAutoPlaying(true);
          vid.play().catch(() => { });
        } else {
          setIsAutoPlaying(false);
          vid.pause();
        }
      },
      { threshold: 0.65 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [type, videoRef]);

  const handleTap = () => {
    const now = Date.now();

    if (now - lastTap.current < 250) {
      setShowHeart(true);
      onDoubleTap?.();
      setTimeout(() => setShowHeart(false), 600);
    }
    lastTap.current = now;
  };

  const ColorBackground = ({ isImage, contentUrl }) => (
    <div
      className="absolute inset-0 z-0"
      style={{
        background: isImage
          ? `url(${contentUrl})`
          : `radial-gradient(circle, ${dominantColor}55, ${dominantColor}EE)`,
        backgroundSize: isImage ? 'cover' : undefined,
        backgroundPosition: isImage ? 'center' : undefined,
        filter: isImage ? "blur(50px)" : "blur(40px)",
        transform: "scale(1.25)",
      }}
    />
  );

  if (type === "image") {
    return (
      <div onClick={onCommentsClick} className="w-full h-full">
        <div
          ref={containerRef}
          onClick={handleTap}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
        >
          <ColorBackground isImage={true} contentUrl={contentUrl} />
          <img
            src={contentUrl}
            crossOrigin="anonymous"
            className={`absolute inset-0 w-full h-full ${objectFitClass} z-10`}
            alt=""
            style={{
              filter: filterStyle,
              transform: `scale(${zoomLevel})`
            }}
          />

          {showHeart && <HeartAnimation />}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={onCommentsClick}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <ColorBackground />

      <video
        ref={videoRef}
        src={contentUrl}
        crossOrigin="anonymous"
        muted={isMuted}
        playsInline
        preload="metadata"
        controls
        className={`absolute inset-0 w-full h-full ${objectFitClass} z-10`}
        style={{
          filter: filterStyle,
          transform: `scale(${zoomLevel})`
        }}
        onPlay={() => onVideoPlay?.()}
        onPause={() => onVideoPause?.()}
        onEnded={() => onVideoEnded?.()}
        onDoubleClick={(e) => {
          e.stopPropagation();
          handleTap();
        }}
      />

      {showHeart && <HeartAnimation />}
    </div>
  );
}

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
