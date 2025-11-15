import React from 'react';
import { FiPlay, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';

const StoriesPlayer = ({
  feed,
  videoRef,
  progress,
  isPaused,
  isHovering,
  setIsPaused,
  navigateFeed,
  setSelectedFeedIndex,
  setIsPaused: setIsPausedProp,
  setShowComments,
  fetchComments,
}) => {
  return (
    <div className="relative w-[450px] h-full bg-black flex flex-col cursor-pointer">
      {/* Close */}
      <button
        onClick={() => {
          setSelectedFeedIndex(null);
          setIsPausedProp(false);
          setShowComments(false);
        }}
        className="absolute top-4 right-4 z-30 text-white bg-black/50 p-2 rounded-full"
      >
        <FiX />
      </button>

      {/* Progress */}
      <div className="absolute top-4 left-4 right-4 z-20">
        <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
          <div
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* User Info */}
      <div className="absolute top-16 left-4 z-20 flex items-center gap-3">
        <img
          src={feed.createdByProfile?.profileAvatar || 'https://default-avatar.example.com/default.png'}
          alt="avatar"
          className="w-10 h-10 rounded-full border-2 border-white object-cover"
        />
        <div className="text-white">
          <div className="font-semibold text-sm">
            {feed.createdByProfile?.userName || 'Unknown User'}
          </div>
          <div className="text-xs text-white/80">
            {feed.location || ''}
          </div>
        </div>
      </div>

      {/* Pause overlay */}
      {isPaused && (
        <button
          onClick={() => setIsPaused(false)}
          className="absolute inset-0 m-auto w-16 h-16 bg-black/50 text-white rounded-full z-20 flex items-center justify-center"
        >
          <FiPlay />
        </button>
      )}

      {/* Hover nav arrows */}
      {isHovering && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed('prev');
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 p-3 rounded-full text-white"
          >
            <FiChevronLeft />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigateFeed('next');
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 p-3 rounded-full text-white"
          >
            <FiChevronRight />
          </button>
        </>
      )}

      {/* Media */}
      <div
        className="flex-1 flex items-center justify-center relative"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const clickX = e.clientX - rect.left;
          const width = rect.width;
          if (clickX < width / 3) {
            navigateFeed('prev');
          } else if (clickX > (2 * width) / 3) {
            navigateFeed('next');
          } else {
            setIsPaused((p) => !p);
          }
        }}
      >
        {feed.type === 'video' ? (
          <video
            ref={videoRef}
            src={feed.contentUrl}
            className="w-full h-full object-contain"
            onTimeUpdate={() => {
              if (videoRef.current && videoRef.current.duration) {
                // Progress handled by parent
              }
            }}
            onLoadedMetadata={() => {
              if (!isPaused) videoRef.current?.play().catch(() => setIsPaused(true));
            }}
            onEnded={() => {
              navigateFeed('next');
            }}
            playsInline
            muted
            autoPlay
          />
        ) : (
          <img
            src={feed.contentUrl}
            alt="Feed content"
            className="w-full h-full object-contain"
          />
        )}
      </div>
    </div>
  );
};

export default StoriesPlayer;