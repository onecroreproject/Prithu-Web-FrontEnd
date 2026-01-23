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

  // NEW LIKE & SHARE CALLBACKS
  onLike,
  onShare,
  likesCount,
  isLikedState,
  totalViews,
  totalShare,
}) => {
  const [isPaused, setIsPaused] = useState(false);
  const wheelTimeoutRef = useRef(null);

  /* ------------------------
      CLEANUP on UNMOUNT
  ------------------------- */
  useEffect(() => {
    return () => {
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
        wheelTimeoutRef.current = null;
      }
    };
  }, []);

  /* ------------------------
     Disable body scroll on hover
  ------------------------- */
  useEffect(() => {
    document.body.style.overflow = isHovering ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isHovering]);

  /* ------------------------
      Sync PLAY / PAUSE
  ------------------------- */
  useEffect(() => {
    const vid = videoRef?.current;
    if (!vid) return;

    if (isPaused) {
      if (!vid.paused) vid.pause();
    } else {
      if (vid.paused && !vid.ended) {
        const playPromise = vid.play();
        if (playPromise?.catch) {
          playPromise.catch(() => {});
        }
      }
    }
  }, [isPaused, videoRef]);

  /* ------------------------
        TAP / TOUCH
  ------------------------- */
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

      // center area
      setIsPaused((prev) => !prev);
    },
    [navigateFeed]
  );

  /* ------------------------
          WHEEL
  ------------------------- */
  const handleWheel = (e) => {
    e.stopPropagation();

    if (wheelTimeoutRef.current) return;

    wheelTimeoutRef.current = setTimeout(() => {
      wheelTimeoutRef.current = null;
    }, 500);

    navigateFeed(e.deltaY < 0 ? "prev" : "next");
  };

  /* ------------------------
        ACTION HANDLERS
  ------------------------- */

  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (onLike) onLike();
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (onShare) onShare();
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
      {/* CLOSE BUTTON */}
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

      {/* NAV ARROWS */}
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
            controls={false}
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

      {/* SIDE ACTIONS */}
      <div className="absolute right-4 bottom-20 z-20 flex flex-col gap-4">

        {/* LIKE */}
        <button
          type="button"
          onClick={handleLikeClick}
          className="flex flex-col items-center gap-1 text-white hover:scale-110"
        >
          <div
            className={`p-2 rounded-full ${
              isLikedState ? "bg-red-500" : "bg-black/40"
            }`}
          >
            <FiHeart size={24} />
          </div>
          <span className="text-xs">{likesCount}</span>
        </button>

        {/* VIEWS */}
        <button
          type="button"
          className="flex flex-col items-center gap-1 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-2 rounded-full bg-black/40">
            <FiEye size={24} />
          </div>
          <span className="text-xs">{totalViews || 0}</span>
        </button>

        {/* SHARE */}
        <button
          type="button"
          onClick={handleShareClick}
          className="flex flex-col items-center gap-1 text-white hover:scale-110"
        >
          <div className="p-2 rounded-full bg-black/40 hover:bg-blue-500/80">
            <FiShare2 size={24} />
          </div>
          <span className="text-xs">{totalShare||0}</span>
        </button>
      </div>


      {/* HOVER TIP */}
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
