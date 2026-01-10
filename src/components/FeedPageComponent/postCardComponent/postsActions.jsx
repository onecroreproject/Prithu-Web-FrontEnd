// ✅ src/components/FeedPageComponent/postCardComponent/postsActions.jsx
import React, { useState, useEffect } from "react";
import {
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  SendOutlined,
  BookmarkBorder,
  Bookmark,
  Download,
} from "@mui/icons-material";

const PostActions = ({
  isLiked,
  likesCount = 0,
  shareCount = 0,
  handleLikeFeed,
  handleShare,
  handleSave,
  handleDownload,
  post,
  commentCount,
  onCommentsClick,
  caption = "",
  userName = "",
  isSaved = false,
}) => {
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  const [localSharesCount, setLocalSharesCount] = useState(shareCount);
  const [localSaved, setLocalSaved] = useState(isSaved);

  useEffect(() => {
    setLocalLiked(isLiked);
    setLocalLikesCount(likesCount);
    setLocalSharesCount(shareCount);
    setLocalSaved(isSaved);
  }, [isLiked, likesCount, shareCount, isSaved]);

  const instantLike = async () => {
    const optimistic = !localLiked;

    setLocalLiked(optimistic);
    setLocalLikesCount((prev) =>
      optimistic ? prev + 1 : Math.max(prev - 1, 0)
    );

    try {
      await handleLikeFeed();
    } catch {
      setLocalLiked(!optimistic);
      setLocalLikesCount((prev) => (optimistic ? prev - 1 : prev + 1));
    }
  };

  const instantShare = async () => {
    const currentCount = localSharesCount;
    // Optimistically update UI immediately
    setLocalSharesCount(currentCount + 1);
    
    try {
      // Call the actual share handler
      await handleShare();
    } catch {
      // Revert if the API call fails
      setLocalSharesCount(currentCount);
    }
  };

  const instantSave = async () => {
    const optimistic = !localSaved;
    setLocalSaved(optimistic);
    try {
      await handleSave();
    } catch {
      setLocalSaved(!optimistic);
    }
  };

  const instantDownload = async () => {
    try {
      await handleDownload();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className="px-4 py-3">
      {/* Action Buttons Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          {/* Like Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={instantLike}
              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
              aria-label={localLiked ? "Unlike" : "Like"}
            >
              {localLiked ? (
                <Favorite className="text-red-500" style={{ fontSize: 26 }} />
              ) : (
                <FavoriteBorder style={{ fontSize: 26 }} />
              )}
            </button>
            {localLikesCount > 0 && (
              <span className="text-sm font-semibold text-gray-800 min-w-[20px]">
                {localLikesCount > 999 
                  ? `${(localLikesCount / 1000).toFixed(1)}k` 
                  : localLikesCount}
              </span>
            )}
          </div>

          {/* Comment Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={onCommentsClick}
              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
              aria-label="Comment"
            >
              <ChatBubbleOutline style={{ fontSize: 24 }} />
            </button>
            {commentCount > 0 && (
              <span className="text-sm font-semibold text-gray-800 min-w-[20px]">
                {commentCount > 999 
                  ? `${(commentCount / 1000).toFixed(1)}k` 
                  : commentCount}
              </span>
            )}
          </div>

          {/* Share Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={instantShare}
              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
              aria-label="Share"
            >
              <SendOutlined style={{ fontSize: 24 }} />
            </button>
            {localSharesCount > 0 && (
              <span className="text-sm font-semibold text-gray-800 min-w-[20px]">
                {localSharesCount > 999 
                  ? `${(localSharesCount / 1000).toFixed(1)}k` 
                  : localSharesCount}
              </span>
            )}
          </div>
        </div>

        {/* Right side: Save Button (Instagram style) */}
        <div className="flex items-center gap-3">
          {/* Download Button (Optional - Instagram doesn't have this, but you can keep it) */}
          <button
            onClick={instantDownload}
            className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
            aria-label="Download"
            title="Download"
          >
            <Download style={{ fontSize: 22 }} />
          </button>
          
          {/* Save Button */}
          <button
            onClick={instantSave}
            className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
            aria-label={localSaved ? "Unsave" : "Save"}
          >
            {localSaved ? (
              <Bookmark className="text-black" style={{ fontSize: 24 }} />
            ) : (
              <BookmarkBorder style={{ fontSize: 24 }} />
            )}
          </button>
        </div>
      </div>

      {/* Caption Section */}
      {caption && (
        <div className="mb-2">
          <p className="text-sm text-gray-900">
            <span className="font-semibold mr-2">{userName}</span>
            {caption}
          </p>
        </div>
      )}

      {/* View Comments */}
      {commentCount > 0 && (
        <button
          onClick={onCommentsClick}
          className="mb-2"
        >
          <span className="text-sm text-gray-500">
            View all {commentCount} comments
          </span>
        </button>
      )}

   
    </div>
  );
};

export default PostActions;