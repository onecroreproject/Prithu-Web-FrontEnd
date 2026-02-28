import React, { useEffect, useCallback, useRef, useState, forwardRef, useImperativeHandle } from "react";


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
const MediaWrapper = forwardRef(({
  children,
  naturalAspectRatio,
  viewMode,
  overlaySlot,
  footerSlot,
  fullFrameOverlaySlot, // Add this for absolute frame parity
  onClick,
  isTemplate = false, // Explicitly handle template/editor mode
  containerRef // Added to anchor overlays precisely
}, ref) => {
  const mediaRef = useRef(null);
  const [mediaWidth, setMediaWidth] = useState(null);

  // Expose the internal mediaRef to the parent through the forwarded ref
  useImperativeHandle(ref, () => mediaRef.current);

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
  const containerWidth = '100%'; // Always 100% to fill its given container (e.g. 320px card)

  return (
    <div className="relative z-10 flex flex-col w-full h-full max-w-full max-h-full items-center justify-center pointer-events-none">
      <div
        className="relative flex flex-col items-center transition-all duration-300 pointer-events-auto cursor-pointer shadow-2xl "
        onClick={onClick}
        style={{
          width: containerWidth,
          height: 'fit-content',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        <div
          ref={(el) => {
            mediaRef.current = el;
          }}
          className="relative flex-1 min-h-0 w-full flex items-center justify-start p-0 m-0 overflow-hidden"
        >
          {children}
          {overlaySlot}

          {/* Hybrid-Centric Overlay Anchor: Full-Width (for Frame-X), Snug-Height (for Media-Y) */}
          <div
            ref={(el) => {
              if (containerRef) {
                if (typeof containerRef === 'function') containerRef(el);
                else containerRef.current = el;
              }
            }}
            className="absolute pointer-events-none z-30"
            style={{
              width: '100%',
              height: '100%',
              aspectRatio: naturalAspectRatio || '1/1',
              top: '0',
              left: '50%',
              transform: 'translateX(-50%)',
              maxHeight: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {fullFrameOverlaySlot}
          </div>
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
});

const PostMedia = forwardRef(({
  type = "image",
  contentUrl = "",
  videoRef,
  isMuted,
  isPlaying,
  togglePlayPause,
  toggleMute,
  onDoubleTap,
  preloadNext,
  onVideoPlay,
  onVideoPause,
  onVideoEnded,
  aspectRatio = "1:1",
  editMetadata = {},
  isTemplate = false,
  overlaySlot,
  fullFrameOverlaySlot, // Passed to MediaWrapper
  footerSlot,
  viewMode = "list",
  containerRef: passedContainerRef, // Renamed to avoid shadowed variable
  onTimeUpdate,
  onLoadedMetadata
}, ref) => {
  const outerContainerRef = useRef(null);
  const lastTap = useRef(0);

  // ✅ Immediate "Best Guess" Color to avoid initial black flicker
  const getInitialColor = (url) => {
    if (!url) return "#1a1a1a";
    let hash = 0;
    for (let i = 0; i < url.length; i++) {
      hash = url.charCodeAt(i) + ((hash << 5) - hash);
    }
    const r = (hash & 0xff0000) >> 16;
    const g = (hash & 0x00ff00) >> 8;
    const b = hash & 0x0000ff;
    return `rgb(${Math.abs(r % 120 + 20)}, ${Math.abs(g % 120 + 20)}, ${Math.abs(b % 120 + 20)})`;
  };

  const [dominantColor, setDominantColor] = useState(() => getInitialColor(contentUrl));

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

  // Ensure media content correctly fits its adaptive container
  const objectFitClass = "object-contain";

  const extractColor = useCallback((element) => {
    if (!element) return false;
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = 10;
      canvas.height = 10;
      ctx.drawImage(element, 0, 0, 10, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      if (count > 0) {
        const avgR = r / count;
        const avgG = g / count;
        const avgB = b / count;

        // Detection: If it's pure black or extremely dark, it's likely a fade-in or empty frame
        const isTooDark = avgR < 15 && avgG < 15 && avgB < 15;

        const rgb = `rgb(${Math.round(avgR)}, ${Math.round(avgG)}, ${Math.round(avgB)})`;
        setDominantColor(rgb);
        editMetadata?.onColorExtract?.(rgb);

        return !isTooDark; // Return true if we got a valid "content" color
      }
      return false;
    } catch (e) {
      console.warn("Dominant color extraction failed:", e);
      return false;
    }
  }, [editMetadata]);

  // Use a ref to track if we've found a "good" color for this specific video source
  const hasGoodColor = useRef(false);
  const extractionTimeoutRef = useRef(null);

  const runExtractionWithRetry = useCallback((element, attempt = 1) => {
    if (hasGoodColor.current || attempt > 4) return;

    const success = extractColor(element);
    if (!success) {
      // Retry with increasing delays
      const nextDelay = attempt === 1 ? 800 : (attempt === 2 ? 1500 : 3000);
      extractionTimeoutRef.current = setTimeout(() => {
        runExtractionWithRetry(element, attempt + 1);
      }, nextDelay);
    } else {
      hasGoodColor.current = true;
    }
  }, [extractColor]);

  useEffect(() => {
    // Reset color status when content changes
    hasGoodColor.current = false;
    if (extractionTimeoutRef.current) clearTimeout(extractionTimeoutRef.current);

    // Immediately set a fresh "guess" color for the new content to avoid flicker
    setDominantColor(getInitialColor(contentUrl));

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

  // For video, extract when it starts playing or when metadata is ready
  const handleVideoMetadata = useCallback((e) => {
    const video = e.target;
    // Attempt 1: Just as metadata arrives
    runExtractionWithRetry(video, 1);

    // Detect natural aspect ratio
    if (video.videoWidth && video.videoHeight) {
      setNaturalAspectRatio(video.videoWidth / video.videoHeight);
    }
    onLoadedMetadata?.(e);
  }, [runExtractionWithRetry, onLoadedMetadata]);

  // Additional trigger: When video actually starts playing
  const handleVideoPlaying = useCallback((e) => {
    if (!hasGoodColor.current) {
      runExtractionWithRetry(e.target, 1);
    }
  }, [runExtractionWithRetry]);

  // ✅ Sync muted property directly to DOM element (React's muted attribute only sets defaultMuted)
  useEffect(() => {
    if (videoRef && videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, videoRef]);


  const handleTap = (e) => {
    const now = Date.now();

    if (now - lastTap.current < 300) {
      if (onDoubleTap) {
        // Pass coordinates if event is available
        if (e && e.clientX !== undefined) {
          onDoubleTap(e.clientX, e.clientY);
        } else {
          onDoubleTap();
        }
      }
    }
    lastTap.current = now;
  };

  const handleClick = (e) => {
    // 🛑 CRITICAL: If the click originated from an interactive overlay item, 
    // stop it immediately to prevent background play/pause toggle.
    if (e && e.target && e.target.closest('.overlay-item-interactive')) {
      console.log("🛠️ [PostMedia] Click ignored: Originated from OverlayItem");
      return;
    }

    if (e) e.stopPropagation();
    if (type === "video") {
      togglePlayPause();
    }
  };

  const ColorBackground = ({ isImage, contentUrl, viewMode }) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const isMobileList = viewMode === 'list' && isMobile;

    return (
      <div
        className="absolute inset-0 z-0 transition-colors duration-1000 ease-in-out"
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
      <div onClick={handleClick} className="w-full flex-1 min-h-0 flex items-center justify-center">
        <div
          ref={outerContainerRef}
          onClick={(e) => {
            e.stopPropagation();
            handleTap(e);
          }}
          className="relative w-full h-full flex items-center justify-center "
        >
          <ColorBackground isImage={true} contentUrl={contentUrl} viewMode={viewMode} />

          <MediaWrapper
            ref={ref}
            naturalAspectRatio={naturalAspectRatio}
            viewMode={viewMode}
            overlaySlot={overlaySlot}
            fullFrameOverlaySlot={fullFrameOverlaySlot}
            footerSlot={footerSlot}
            containerRef={passedContainerRef}
          >
            <img
              src={contentUrl || null}
              crossOrigin="anonymous"
              className={`w-full h-full block ${objectFitClass}`}
              alt=""
              style={{
                filter: filterStyle,
                transform: `scale(${zoomLevel})`
              }}
            />
          </MediaWrapper>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={outerContainerRef}
      onClick={handleClick}
      className="relative w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden cursor-pointer"
    >
      <ColorBackground viewMode={viewMode} />

      <MediaWrapper
        ref={ref}
        naturalAspectRatio={naturalAspectRatio}
        viewMode={viewMode}
        overlaySlot={overlaySlot}
        fullFrameOverlaySlot={fullFrameOverlaySlot}
        footerSlot={footerSlot}
        containerRef={passedContainerRef}
        isTemplate={isTemplate}
        onClick={(e) => {
          e.stopPropagation();
          handleClick(e);
        }}
      >
        <video
          ref={videoRef}
          src={contentUrl || null}
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
          onPlaying={handleVideoPlaying}
          onPlay={() => onVideoPlay?.()}
          onPause={() => onVideoPause?.()}
          onEnded={() => onVideoEnded?.()}
          onTimeUpdate={onTimeUpdate}
          onDoubleClick={(e) => {
            e.stopPropagation();
            handleTap(e);
          }}
        />
        {/* Play/Pause Overlay should be absolute relative to this video-containing div */}
        {type === "video" && !isPlaying && !isTemplate && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="bg-black/40 p-4 rounded-full backdrop-blur-sm transform transition-all duration-300 scale-110">
              <svg className="w-10 h-10 text-white fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </MediaWrapper>
    </div>
  );
});

export default PostMedia;
