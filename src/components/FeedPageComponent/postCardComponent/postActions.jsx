import React from "react";
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
  commentsCount = 0,
  sharesCount = 0,
  downloadsCount = 0,
  handleLikeFeed,
  handleShare,
  handleDownload,
  onCommentsClick,
}) => {
  return (
    <div className="bg-white rounded-b-lg border-t border-gray-200 pb-3">
      {/* 🔹 Top Stats Row */}
      <div className="flex justify-between items-center px-4 py-2">
        {/* ❤️ Likes */}
        <div className="flex items-center space-x-1">
          <FavoriteOutlined className="text-red-500" style={{ fontSize: 16 }} />
          <span className="text-sm text-gray-600">
            {likesCount.toLocaleString()}
          </span>
        </div>

        {/* 💬 Comments + Shares + Downloads */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{commentsCount} comments</span>
          <span>{sharesCount} shares</span>
          <span>{downloadsCount} downloads</span>
        </div>
      </div>

      {/* 🔹 Action Buttons Row */}
      <div className="flex justify-around items-center py-1">
        {/* ❤️ Like */}
        <button
          onClick={handleLikeFeed}
          className={`flex items-center justify-center flex-1 py-2 transition duration-200 ${
            isLiked ? "text-[#1877F2]" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {isLiked ? (
            <ThumbUp className="text-[#1877F2] mr-2" style={{ fontSize: 20 }} />
          ) : (
            <ThumbUpOutlined className="mr-2" style={{ fontSize: 20 }} />
          )}
          <span className="text-sm font-bold">Like</span>
        </button>

        {/* 💬 Comment */}
        <button
          onClick={onCommentsClick}
          className="flex items-center justify-center flex-1 py-2 text-gray-600 hover:bg-gray-100 transition duration-200"
        >
          <ChatBubbleOutlineOutlined className="mr-2" style={{ fontSize: 20 }} />
          <span className="text-sm font-bold">Comment</span>
        </button>

        {/* 🔄 Share */}
        <button
          onClick={handleShare}
          className="flex items-center justify-center flex-1 py-2 text-gray-600 hover:bg-gray-100 transition duration-200"
        >
          <ShareOutlined className="mr-2" style={{ fontSize: 20 }} />
          <span className="text-sm font-bold">Share</span>
        </button>

        {/* ⬇️ Download */}
        <button
          onClick={handleDownload}
          className="flex items-center justify-center flex-1 py-2 text-gray-600 hover:bg-gray-100 transition duration-200"
        >
          <DownloadOutlined className="mr-2" style={{ fontSize: 20 }} />
          <span className="text-sm font-bold">Download</span>
        </button>
      </div>
    </div>
  );
};

export default PostActions;
