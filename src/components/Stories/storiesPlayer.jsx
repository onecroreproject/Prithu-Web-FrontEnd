import React from "react";
import { FiPlay, FiPause, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

const StoriesPlayer = ({
  feed,
  videoRef,
  progress,
  setProgress,
  isPaused,
  setIsPaused,
  isHovering,
  setIsHovering,
  navigateFeed,
  setSelectedFeedIndex,
  setShowComments,
  handleVideoTimeUpdate,
}) => {

  /* -------------------------
       TAP / CLICK HANDLER
     ------------------------- */
  const handleTap = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width * 0.33) {
      // LEFT – PREVIOUS
      navigateFeed("prev");
      return;
    }

    if (x > width * 0.66) {
      // RIGHT – NEXT
      navigateFeed("next");
      return;
    }

    // CENTER – TOGGLE PLAY/PAUSE
    handlePlayPause();
  };

  /* -------------------------
       PLAY/PAUSE HANDLER
     ------------------------- */
  const handlePlayPause = () => {
    const newPaused = !isPaused;
    setIsPaused(newPaused);
console.log(feed)
    if (videoRef?.current && feed?.type === 'video') {
      const video = videoRef.current;
      if (newPaused) {
        video.pause();
      } else {
        video.play().catch(() => { });
      }
    }
  };

  /* -------------------------
       HOVER HANDLER (NO AUTO-PAUSE)
     ------------------------- */
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      className="relative w-[450px] h-full bg-black flex flex-col cursor-pointer"
      onClick={handleTap}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFeedIndex(null);
          setIsPaused(false);
          setShowComments(false);
        }}
        className="absolute top-4 right-4 z-30 text-white bg-black/50 p-2 rounded-full hover:bg-black/70 transition-colors"
        aria-label="Close stories"
      >
        <FiX size={20} />
      </button>

      {/* Progress Bar */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress indicator for videos */}
        {feed?.type === 'video' && (
          <div className="absolute -bottom-4 right-0 text-xs text-gray-400">
            {isPaused ? (
              <span className="flex items-center gap-1">
                <FiPause size={12} />
                Paused
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <FiPlay size={12} />
                Playing
              </span>
            )}
          </div>
        )}

        {/* Progress indicator for images */}
        {feed?.type === 'image' && (
          <div className="absolute -bottom-4 right-0 text-xs text-gray-400">
            {isPaused ? (
              <span className="flex items-center gap-1">
                <FiPause size={12} />
                Paused
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <FiPlay size={12} />
                Auto-play
              </span>
            )}
          </div>
        )}
      </div>

      {/* Hover Navigation Arrows (desktop only) */}
      {isHovering && (
        <>
          {/* Previous Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed("prev");
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 p-3 rounded-full text-white hover:bg-black/60 transition-colors"
            aria-label="Previous story"
          >
            <FiChevronLeft size={24} />
          </button>

          {/* Next Arrow */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed("next");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 p-3 rounded-full text-white hover:bg-black/60 transition-colors"
            aria-label="Next story"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* Play/Pause Overlay */}
      {isPaused && (
        <div
          className="absolute inset-0 flex items-center justify-center z-30 bg-black/30 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            handlePlayPause();
          }}
        >
          <div className="bg-black/50 p-4 rounded-full">
            <FiPlay className="text-white" size={42} />
          </div>
        </div>
      )}

      {/* Media Content */}
      <div className="flex-1 flex items-center justify-center select-none">
        {feed?.type === "video" ? (
          <video
            ref={videoRef}
            src={feed.contentUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={() => {
              if (!isPaused) {
                videoRef.current?.play()?.catch(() => { });
              }
            }}
            onEnded={() => navigateFeed("next")}
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
            playsInline
            muted
            autoPlay
          />
        ) : (
          <img
            src={feed.contentUrl}
            alt="story"
            className="w-full h-full object-contain"
            draggable="false"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPause();
            }}
          />
        )}
      </div>

      {/* Media Type Indicator */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black/50 px-2 py-1 rounded text-xs text-white">
          {feed?.type === 'video' ? (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              Video
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Photo
            </span>
          )}
        </div>
      </div>

      {/* Progress Time Indicator for Videos */}
      {feed?.type === 'video' && videoRef.current && (
        <div className="absolute bottom-4 right-4 z-20">
          <div className="bg-black/50 px-2 py-1 rounded text-xs text-white">
            {Math.floor(videoRef.current.currentTime || 0)}s / {Math.floor(videoRef.current.duration || 0)}s
          </div>
        </div>
      )}

      {/* Touch/Hover Instructions (only show on hover for mobile-like devices) */}
      {isHovering && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-black/70 px-3 py-1 rounded text-xs text-white text-center">
            <div>Tap left/right to navigate</div>
            <div>Tap center to {isPaused ? 'play' : 'pause'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesPlayer;