import React, { useState, useEffect } from "react";
import {
  FavoriteOutlined,
  ThumbUpOutlined,
  ThumbUp,
  ChatBubbleOutlineOutlined,
  ShareOutlined,
  DownloadOutlined,
} from "@mui/icons-material";

const PostActions = ({
  isLiked,
  likesCount = 0,
  shareCount = 0,
  handleLikeFeed,
  handleShare,
  handleDownload,
  post,
  commentCount,
  onCommentsClick,
}) => {
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);

  const [localSharesCount, setLocalSharesCount] = useState(post.shareCount || 0);
  const [localDownloadsCount, setLocalDownloadsCount] = useState(
    post.downloadsCount || 0
  );

  useEffect(() => {
    setLocalLiked(isLiked);
    setLocalLikesCount(likesCount);
    setLocalSharesCount(post.shareCount || 0);
    setLocalDownloadsCount(post.downloadsCount || 0);
  }, [isLiked, likesCount, post.sharesCount, post.downloadsCount]);

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
    setLocalSharesCount((p) => p + 1);
    try {
      await handleShare();
    } catch {
      setLocalSharesCount((p) => Math.max(p - 1, 0));
    }
  };

  const instantDownload = async () => {
    setLocalDownloadsCount((p) => p + 1);
    try {
      await handleDownload();
    } catch {
      setLocalDownloadsCount((p) => Math.max(p - 1, 0));
    }
  };

  return (
    <div className="bg-white rounded-b-lg border-t border-gray-200 pb-3">

      {/* Top Stats Row */}
      <div className="flex justify-between items-center px-4 py-2">

        {/* Likes */}
        <div className="flex items-center space-x-1">
          <FavoriteOutlined className="text-red-500" style={{ fontSize: 16 }} />
          <span className="text-sm text-gray-600">
            {localLikesCount.toLocaleString()}
          </span>
        </div>

        {/* Comments / Shares / Downloads */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{commentCount} comments</span>
          <span>{localSharesCount} shares</span>
          <span>{localDownloadsCount} downloads</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-around items-center py-1">

        {/* LIKE */}
        <button
          onClick={instantLike}
          className={`flex items-center justify-center flex-1 py-2 transition duration-200 ${
            localLiked ? "text-[#1877F2]" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {localLiked ? (
            <ThumbUp className="mr-0 sm:mr-2" style={{ fontSize: 22 }} />
          ) : (
            <ThumbUpOutlined className="mr-0 sm:mr-2" style={{ fontSize: 22 }} />
          )}

          {/* Show label only on sm+ screens */}
          <span className="hidden sm:inline text-sm font-bold">Like</span>
        </button>

        {/* COMMENT */}
        <button
          onClick={onCommentsClick}
          className="flex items-center justify-center flex-1 py-2 text-gray-600 hover:bg-gray-100 transition duration-200"
        >
          <ChatBubbleOutlineOutlined
            className="mr-0 sm:mr-2"
            style={{ fontSize: 22 }}
          />
          <span className="hidden sm:inline text-sm font-bold">Comment</span>
        </button>

        {/* SHARE */}
        <button
          onClick={instantShare}
          className="flex items-center justify-center flex-1 py-2 text-gray-600 hover:bg-gray-100 transition duration-200"
        >
          <ShareOutlined className="mr-0 sm:mr-2" style={{ fontSize: 22 }} />
          <span className="hidden sm:inline text-sm font-bold">Share</span>
        </button>

        {/* DOWNLOAD */}
        <button
          onClick={instantDownload}
          className="flex items-center justify-center flex-1 py-2 text-gray-600 hover:bg-gray-100 transition duration-200"
        >
          <DownloadOutlined className="mr-0 sm:mr-2" style={{ fontSize: 22 }} />
          <span className="hidden sm:inline text-sm font-bold">Download</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
