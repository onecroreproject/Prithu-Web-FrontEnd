import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ModernPostHeader = ({ post }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const descriptionRef = useRef(null);
  const navigate = useNavigate();

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Check if description needs truncation
  useEffect(() => {
    if (post?.description && descriptionRef.current) {
      const element = descriptionRef.current;
      // Adjust line clamp based on screen size
      const lineHeight = parseInt(getComputedStyle(element).lineHeight);
      const maxHeight = isMobile ? lineHeight * 3 : lineHeight * 4;
      const needsTruncate = element.scrollHeight > maxHeight;
      setNeedsTruncation(needsTruncate);
    }
  }, [post?.description, showFullDescription, isMobile]);

  // Process description for hashtags
  const processedDescription = useMemo(() => {
    if (!post?.description) return null;

    const hashtagRegex = /(#[a-zA-Z0-9_]+)/g;
    const parts = post.description.split(hashtagRegex);

    return parts.map((part, index) => {
      const isHashtag = hashtagRegex.test(part);

      if (isHashtag) {
        const clean = part.replace("#", "");
        return (
          <span
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/hashtag/${clean}`);
            }}
            className="text-blue-600 font-semibold cursor-pointer hover:underline hover:bg-blue-50 px-1 rounded transition-colors duration-200 inline break-words"
          >
            {part}
          </span>
        );
      }

      return (
        <span key={index} className="inline whitespace-pre-wrap break-words">
          {part}
        </span>
      );
    });
  }, [post?.description, navigate]);

  // Avatar size based on screen
  const avatarSize = isMobile ? "w-10 h-10" : "w-11 h-11";

  return (
    <div className="p-4 sm:p-5 bg-white">
      <div className="flex flex-col items-start w-full">
        {/* Responsive Header Layout */}
        <div className="flex items-start gap-3 w-full">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img
              onClick={() => navigate(`/user/profile/${post.userId}`)}
              src={post?.profileAvatar}
              alt="Profile"
              className={`${avatarSize} rounded-full border-2 border-gray-100 shadow-sm object-cover cursor-pointer transition-transform hover:scale-105`}
            />
          </div>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Responsive Header Info */}
            <div className="flex flex-col mb-2 sm:mb-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="text-sm sm:text-base font-bold text-gray-900 leading-tight break-words">
                  {post?.userName || "Unknown User"}
                </span>
                {!isMobile && (
                  <span className="hidden sm:inline text-gray-400">•</span>
                )}
                <span className="text-xs sm:text-sm text-gray-500 leading-tight mt-0.5 sm:mt-0">
                  {post?.timeAgo || "Just now"}
                </span>
              </div>
              
              {/* Additional user info for larger screens */}
              {!isMobile && post?.userTitle && (
                <span className="text-xs text-gray-600 mt-0.5">
                  {post.userTitle}
                </span>
              )}
            </div>

            {/* Smart Description - Responsive */}
            {post?.description && (
              <div className="leading-relaxed mt-2 w-full">
                <div
                  ref={descriptionRef}
                  className={`
                    text-sm sm:text-base text-gray-900 font-normal 
                    break-words whitespace-pre-wrap
                    transition-all duration-300 ease-in-out
                    ${showFullDescription ? "" : 
                      isMobile ? "line-clamp-3" : "line-clamp-4"
                    }
                  `}
                  style={{
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word'
                  }}
                >
                  {processedDescription}
                </div>

                {/* Show More/Less Toggle - Responsive */}
                {needsTruncation && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className={`
                      text-sm font-medium text-gray-500 cursor-pointer 
                      hover:text-gray-700 hover:underline transition-colors 
                      duration-200 inline-block mt-1 px-1 rounded
                      ${isMobile ? 'text-xs' : 'text-sm'}
                    `}
                  >
                    {showFullDescription ? 
                      "Show less" : 
                      `Show more${isMobile ? '' : '...'}`
                    }
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Additional Metadata for Larger Screens */}
        {!isMobile && post?.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3 w-full">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => navigate(`/tag/${tag}`)}
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Mobile-only additional actions */}
        {isMobile && (
          <div className="flex items-center justify-between w-full mt-3 pt-3 border-t border-gray-100">
            {post?.location && (
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {post.location}
              </span>
            )}
            
            {post?.visibility && (
              <span className="text-xs text-gray-500">
                {post.visibility}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernPostHeader;