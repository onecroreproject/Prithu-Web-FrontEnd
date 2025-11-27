import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ModernPostHeader = ({ post }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [needsTruncation, setNeedsTruncation] = useState(false);
  const descriptionRef = useRef(null);
  const navigate = useNavigate();

  // Check if description needs truncation
  useEffect(() => {
    if (post?.description && descriptionRef.current) {
      const element = descriptionRef.current;
      // Check if content exceeds 4 lines
      const needsTruncate = element.scrollHeight > element.clientHeight;
      setNeedsTruncation(needsTruncate);
    }
  }, [post?.description, showFullDescription]);

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
            className="text-blue-600 font-semibold cursor-pointer hover:underline hover:bg-blue-100 px-0.5 mx-0.5 rounded inline-block"
          >
            {part}
          </span>
        );
      }

      return (
        <span key={index} className="inline whitespace-pre-wrap">
          {part}
        </span>
      );
    });
  }, [post?.description, navigate]);

  return (
    <div className="p-5 bg-white">
      <div className="flex flex-col items-start">
        {/* Modern Avatar */}
        <div className="flex items-center gap-2 w-full">
          <img
            onClick={() => navigate(`/user/profile/${post.userId}`)}
            src={post?.profileAvatar}
            alt="Profile"
            className="w-11 h-11 rounded-full border-2 border-gray-50 shadow-sm object-cover cursor-pointer"
          />

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            {/* Compact Header */}
            <div className="flex flex-col mb-1">
              <span className="text-sm font-bold text-gray-900 leading-tight">
                {post?.userName || "Unknown User"}
              </span>
              <span className="text-xs text-gray-500 leading-tight">
                {post?.timeAgo || "Just now"}
              </span>
            </div>
          </div>
        </div>

        {/* Smart Description */}
        {post?.description && (
          <div className="leading-relaxed mt-2 w-full">
            <div
              ref={descriptionRef}
              className={`
                text-sm text-gray-900 font-normal 
                break-words whitespace-pre-wrap
                transition-all duration-200
                ${showFullDescription ? "" : "line-clamp-4"}
              `}
            >
              {processedDescription}
            </div>

            {/* Show More/Less Toggle */}
            {needsTruncation && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm font-semibold text-gray-500 cursor-pointer hover:text-gray-900 hover:underline inline-block mt-1"
              >
                {showFullDescription ? "Show less" : "Show more..."}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernPostHeader;