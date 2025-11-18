import React from "react";
import { FiPlay, FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

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
    setIsPaused((p) => !p);
    if (videoRef?.current) {
      if (isPaused) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
  };

  return (
    <div
      className="relative w-[450px] h-full bg-black flex flex-col cursor-pointer"
      onClick={handleTap}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Close */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFeedIndex(null);
          setIsPaused(false);
          setShowComments(false);
        }}
        className="absolute top-4 right-4 z-30 text-white bg-black/50 p-2 rounded-full"
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
      </div>

      {/* Hover previous/next arrows (desktop only) */}
      {isHovering && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed("prev");
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 p-3 rounded-full text-white"
          >
            <FiChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed("next");
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 p-3 rounded-full text-white"
          >
            <FiChevronRight size={24} />
          </button>
        </>
      )}

      {/* PAUSE OVERLAY (center icon) */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/30">
          <FiPlay className="text-white" size={42} />
        </div>
      )}

      {/* MEDIA */}
      <div className="flex-1 flex items-center justify-center select-none">
        {feed.type === "video" ? (
          <video
            ref={videoRef}
            src={feed.contentUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={handleVideoTimeUpdate}
            onLoadedMetadata={() => {
              if (!isPaused) videoRef.current?.play()?.catch(() => {});
            }}
            onEnded={() => navigateFeed("next")}
            playsInline
            muted
            autoPlay
          />
        ) : (
          <img
            src={feed.contentUrl}
            alt="story-img"
            className="w-full h-full object-contain"
            draggable="false"
          />
        )}
      </div>
    </div>
  );
};

export default StoriesPlayer;
