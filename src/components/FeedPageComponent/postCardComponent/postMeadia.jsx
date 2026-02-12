import React, { useEffect, useCallback, useRef, useState } from "react";


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

/**
 * Pixel-Perfect Adaptive Wrapper:
 * 1. Package (Unit): Uses fit-content to hug the media dimensions while ensuring visibility.
 * 2. Media Area (Anchor): Driving width via aspect-ratio. 
 * 3. Footer (Follower): Forced mirroring via w-0 min-w-full.
 */
const MediaWrapper = ({
  children,
  naturalAspectRatio,
  viewMode,
  overlaySlot,
  footerSlot,
  onClick
}) => {
  const mediaRef = useRef(null);
  const [mediaWidth, setMediaWidth] = useState(null);

  useEffect(() => {
    if (!mediaRef.current) return;

    const updateWidth = () => {
      if (mediaRef.current) {
        const width = mediaRef.current.offsetWidth;
        setMediaWidth(width);
      }
    };

    // Initial measurement
    updateWidth();

    // Observe size changes
    const resizeObserver = new ResizeObserver(updateWidth);
    resizeObserver.observe(mediaRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Determine width based on view mode and screen size
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const containerWidth = (viewMode === 'list' && isMobile) ? '75%' : '100%';

  return (
    <div className="relative z-10 flex flex-col w-full h-full max-w-full max-h-full items-center justify-center pointer-events-none">
      <div
        className="relative flex flex-col transition-all duration-300 pointer-events-auto cursor-pointer shadow-2xl "
        onClick={onClick}
        style={{
          width: containerWidth,
          height: 'fit-content',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <div
          ref={mediaRef}
          className="relative flex  items-center justify-center flex-1 min-h-0"
          style={{
            aspectRatio: naturalAspectRatio ? `${naturalAspectRatio}` : undefined,
            width: 'auto',
            maxWidth: '100%',
            maxHeight: '100%',
            height: 'auto',
          }}
        >
          {children}
          {overlaySlot}
        </div>

        {/* Footer with dynamically measured width */}
        {footerSlot && (
          <div
            className="relative shrink-0"
            style={{
              width: mediaWidth ? `${mediaWidth}px` : '100%',
              boxSizing: 'border-box'
            }}
          >
            {footerSlot}
          </div>
        )}
      </div>
    </div>
  );
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
  overlaySlot,
  footerSlot,
  viewMode = "list"
}) {
  const containerRef = useRef(null);
  const [showHeart, setShowHeart] = useState(false);
  const [dominantColor, setDominantColor] = useState("#222");

  // Natural ratio detection for perfect width-matching and adaptive scaling
  const [naturalAspectRatio, setNaturalAspectRatio] = useState(() => {
    if (aspectRatio && typeof aspectRatio === 'string' && aspectRatio.includes(":")) {
      const [w, h] = aspectRatio.split(":").map(Number);
      if (w && h) return w / h;
    }
    return null;
  });

  const filterPreset = editMetadata?.filters?.preset || 'original';
  const filterStyle = FILTER_STYLES[filterPreset] || '';
  const zoomLevel = editMetadata?.crop?.zoomLevel || 1;

  // Always use object-contain to prevent cropping
  // MediaWrapper handles width matching between media and footer
  const objectFitClass = "fit-content";

  const lastTap = useRef(0);

  const extractColor = useCallback((element) => {
    if (!element) return;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 10; // Small size for faster processing
      canvas.height = 10;
      ctx.drawImage(element, 0, 0, 10, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue; // Skip semi-transparent pixels
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      if (count > 0) {
        const rgb = `rgb(${Math.round(r / count)}, ${Math.round(g / count)}, ${Math.round(b / count)})`;
        setDominantColor(rgb);
        editMetadata?.onColorExtract?.(rgb);
      }
    } catch (e) {
      console.warn("Dominant color extraction failed:", e);
    }
  }, [editMetadata]);

  useEffect(() => {
    if (type === "image" && contentUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        extractColor(img);
        if (img.naturalWidth && img.naturalHeight) {
          setNaturalAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      };
      img.src = contentUrl;
    }
  }, [type, contentUrl, extractColor]);

  // For video, extract when it starts playing
  const handleVideoMetadata = useCallback((e) => {
    // Extract color from first frame
    setTimeout(() => extractColor(e.target), 500);
    // Detect natural aspect ratio
    if (e.target.videoWidth && e.target.videoHeight) {
      setNaturalAspectRatio(e.target.videoWidth / e.target.videoHeight);
    }
  }, [extractColor]);



  const handleTap = () => {
    const now = Date.now();

    if (now - lastTap.current < 250) {
      setShowHeart(true);
      onDoubleTap?.();
      setTimeout(() => setShowHeart(false), 600);
    }
    lastTap.current = now;
  };

  const handleClick = (e) => {
    if (type === "video") {
      togglePlayPause();
    } else {
      onCommentsClick?.();
    }
  };

  const ColorBackground = ({ isImage, contentUrl, viewMode }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isMobileList = viewMode === 'list' && isMobile;

    return (
      <div
        className="absolute inset-0 z-0"
        style={{
          background: isMobileList
            ? 'transparent'
            : isImage
              ? `url(${contentUrl})`
              : `radial-gradient(circle, ${dominantColor}55, ${dominantColor}EE)`,
          backgroundSize: isImage && !isMobileList ? 'cover' : undefined,
          backgroundPosition: isImage && !isMobileList ? 'center' : undefined,
          filter: isMobileList ? 'none' : (isImage ? "blur(50px)" : "blur(40px)"),
          transform: isMobileList ? 'none' : "scale(1.25)",
        }}
      />
    );
  };

  if (type === "image") {
    return (
      <div onClick={onCommentsClick} className="w-full flex-1 min-h-0 flex items-center justify-center">
        <div
          ref={containerRef}
          onClick={handleTap}
          className="relative w-full h-full flex items-center justify-center "
        >
          <ColorBackground isImage={true} contentUrl={contentUrl} viewMode={viewMode} />

          <MediaWrapper
            naturalAspectRatio={naturalAspectRatio}
            viewMode={viewMode}
            footerSlot={footerSlot}
            onClick={onCommentsClick}
          >
            <img
              src={contentUrl}
              crossOrigin="anonymous"
              className={`w-full h-full block ${objectFitClass}`}
              alt=""
              style={{
                filter: filterStyle,
                transform: `scale(${zoomLevel})`
              }}
            />
          </MediaWrapper>

          {showHeart && <HeartAnimation />}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden cursor-pointer"
    >
      <ColorBackground viewMode={viewMode} />

      <MediaWrapper
        naturalAspectRatio={naturalAspectRatio}
        viewMode={viewMode}
        overlaySlot={overlaySlot}
        footerSlot={footerSlot}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
      >
        <video
          ref={videoRef}
          src={contentUrl}
          crossOrigin="anonymous"
          muted={isMuted}
          playsInline
          preload="metadata"
          className={`w-full h-full block ${objectFitClass}`}
          style={{
            filter: filterStyle,
            transform: `scale(${zoomLevel})`
          }}
          onLoadedMetadata={handleVideoMetadata}
          onPlay={() => onVideoPlay?.()}
          onPause={() => onVideoPause?.()}
          onEnded={() => onVideoEnded?.()}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleTap();
          }}
        />
        {/* Play/Pause Overlay should be absolute relative to this video-containing div */}
        {type === "video" && !isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm transform transition-all duration-300 scale-110">
              <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </MediaWrapper>

      {showHeart && <HeartAnimation />}
    </div>
  );
}

const HeartAnimation = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
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
