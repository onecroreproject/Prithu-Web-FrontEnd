import React from 'react';
import { FiPlay,FiChevronRight,FiChevronLeft  } from 'react-icons/fi';

const StoriesThumbnails = ({
  feeds,
  loading,
  thumbnails,
  setSelectedFeedIndex,
  fetchComments,
  setProgress,
  setIsPaused,
  setShowComments,
  scrollContainerRef,
  showLeftArrow,
  showRightArrow,
  showArrows,
  setShowLeftArrow,
  setShowRightArrow,
}) => {
  return (
    <>
      {showLeftArrow && (
        <button
          onClick={() => {
            if (scrollContainerRef.current)
              scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
          }}
          className={`absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-full p-2 transition-all duration-200 border border-gray-200 ${
            showArrows ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <FiChevronLeft className="text-gray-700 text-xl" />
        </button>
      )}

      {showRightArrow && (
        <button
          onClick={() => {
            if (scrollContainerRef.current)
              scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
          }}
          className={`absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 shadow-lg rounded-full p-2 transition-all duration-200 border border-gray-200 ${
            showArrows ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <FiChevronRight className="text-gray-700 text-xl" />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={() => {
          const el = scrollContainerRef.current;
          if (!el) return;
          setShowLeftArrow(el.scrollLeft > 0);
          setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
        }}
      >
        <div className="flex gap-4 no-scrollbar">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-32 h-52">
                  <div className="relative rounded-xl overflow-hidden h-40 w-28 bg-gray-200 animate-pulse" />
                  <div className="mt-2 h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse" />
                </div>
              ))
            : feeds.map((feed, index) => (
                <div
                  key={feed._id}
                  className="flex-shrink-0 w-32 cursor-pointer"
                  onClick={() => {
                    setSelectedFeedIndex(index);
                    setProgress(0);
                    setIsPaused(false);
                    setShowComments(false);
                    fetchComments(feed._id);
                  }}
                >
                  <div className="relative rounded-xl overflow-hidden h-40 w-30 bg-gray-200 flex items-center justify-center">
                    {feed.type === 'video' ? (
                      <>
                        <img
                          src={thumbnails[feed._id] || feed.thumbnail}
                          alt="video"
                          className="object-cover h-full w-full"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <FiPlay className="text-white text-3xl" />
                        </div>
                      </>
                    ) : (
                      <img
                        src={feed.contentUrl}
                        alt={feed.caption || 'Feed'}
                        className="object-cover h-full w-full"
                      />
                    )}
                    <img
                      src={
                        feed.createdByProfile?.profileAvatar ||
                        'https://default-avatar.example.com/default.png'
                      }
                      alt="avatar"
                      className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                  <div className="mt-2 text-center text-[15px] font-medium truncate">
                    {feed.createdByProfile?.userName || 'Unknown User'}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </>
  );
};

export default StoriesThumbnails;