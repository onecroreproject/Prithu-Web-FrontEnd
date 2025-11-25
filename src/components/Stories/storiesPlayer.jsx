import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  FiChevronUp,
  FiChevronDown,
  FiX,
  FiHeart,
  FiShare2,
  FiEye,
} from "react-icons/fi";

const StoriesPlayer = ({
  feed,
  videoRef,
  isHovering,
  setIsHovering,
  navigateFeed,
  setSelectedFeedIndex,
  setShowComments,
  likeFeedAction,
  shareFeedAction,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const wheelTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = null;
      }
    };
  }, []);


  useEffect(() => {
  if (isHovering) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isHovering]);


  // Sync play/pause state with video element
  useEffect(() => {
    const vid = videoRef?.current;
    if (!vid) return;

    if (isPaused) {
      if (!vid.paused) vid.pause();
    } else {
      if (vid.paused && !vid.ended) {
        const playPromise = vid.play();
        if (playPromise?.catch) playPromise.catch(() => {});
      }
    }
  }, [isPaused, videoRef]);

  /* ------------------------------
    TAP / CLICK / TOUCH HANDLER
  ------------------------------- */
  const handleTap = useCallback(
    (e) => {
      e.stopPropagation();

      let clientY = e.clientY;
      if (!clientY && e.changedTouches?.length) {
        clientY = e.changedTouches[0].clientY;
      }
      if (!clientY) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const y = clientY - rect.top;

      if (y < rect.height * 0.33) return navigateFeed("prev");
      if (y > rect.height * 0.66) return navigateFeed("next");

      // Center → toggle play/pause
      setIsPaused((prev) => !prev);
    },
    [navigateFeed]
  );

  /* ------------------------------
      WHEEL HANDLER (DEBOUNCED)
  ------------------------------- */
const handleWheel = (e) => {
  e.stopPropagation();

  if (wheelTimeoutRef.current) return;

  wheelTimeoutRef.current = setTimeout(() => {
    wheelTimeoutRef.current = null;
  }, 500);

  navigateFeed(e.deltaY < 0 ? "prev" : "next");
};

  /* ------------------------------
      ACTION HANDLERS
  ------------------------------- */
  const handleLike = (e) => {
    e.stopPropagation();
    likeFeedAction?.();
  };

  const handleShare = (e) => {
    e.stopPropagation();
    shareFeedAction?.();
  };

  return (
    <div
      className="relative w-[450px] h-full bg-black flex flex-col cursor-pointer"
      onClick={handleTap}
      onTouchEnd={handleTap}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onWheel={handleWheel}
      tabIndex={0}
    >
      {/* Close Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setSelectedFeedIndex(null);
          setShowComments(false);
        }}
        className="absolute top-4 right-4 z-30 text-white bg-black/50 p-2 rounded-full hover:bg-black/70"
      >
        <FiX size={20} />
      </button>

      {/* Hover Arrows */}
      {isHovering && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed("prev");
            }}
            className="absolute right-4 top-1/3 -translate-y-1/2 z-20 bg-black/40 p-2 rounded-full text-white hover:bg-black/60"
          >
            <FiChevronUp size={16} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed("next");
            }}
            className="absolute right-4 top-2/3 -translate-y-1/2 z-20 bg-black/40 p-2 rounded-full text-white hover:bg-black/60"
          >
            <FiChevronDown size={16} />
          </button>
        </>
      )}

      {/* MEDIA VIEW */}
      <div className="flex-1 flex items-center justify-center select-none">
        {feed?.type === "video" ? (
          <video
            ref={videoRef}
            src={feed.contentUrl}
            className="max-w-full max-h-full"
            onEnded={() => navigateFeed("next")}
            playsInline
            controls
            autoPlay={!isPaused}
          />
        ) : (
          <img
            src={feed.contentUrl}
            className="max-w-full max-h-full"
            draggable="false"
            alt="story"
          />
        )}
      </div>

      {/* RIGHT-SIDE ACTIONS */}
      <div className="absolute right-4 bottom-20 z-20 flex flex-col gap-4">
        {/* Like */}
        <button
          type="button"
          onClick={handleLike}
          className="flex flex-col items-center gap-1 text-white hover:scale-110"
        >
          <div
            className={`p-2 rounded-full ${
              feed?.isLiked ? "bg-red-500" : "bg-black/40"
            }`}
          >
            <FiHeart size={24} />
          </div>
          <span className="text-xs">{feed?.likesCount || 0}</span>
        </button>

        {/* Views */}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className="p-2 rounded-full bg-black/40">
            <FiEye size={24} />
          </div>
          <span className="text-xs">{feed?.viewsCount || 0}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white hover:scale-110"
        >
          <div className="p-2 rounded-full bg-black/40 hover:bg-blue-500/80">
            <FiShare2 size={24} />
          </div>
          <span className="text-xs">Share</span>
        </button>
      </div>

      {/* MEDIA TYPE BADGE */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black/50 px-2 py-1 rounded text-xs text-white">
          {feed?.type === "video" ? (
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

      {/* HOVER INFO */}
      {isHovering && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black/70 px-3 py-1 rounded text-xs text-white text-center">
            Scroll or use arrows to navigate
          </div>
        </div>
      )}
    </div>
  );
};

export default StoriesPlayer;
