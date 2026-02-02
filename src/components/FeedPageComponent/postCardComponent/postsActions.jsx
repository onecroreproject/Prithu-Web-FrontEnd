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
import PostOptionsMenu from "../PostOptionsMenu";

const PostActions = ({
  isLiked,
  likesCount = 0,
  shareCount = 0,
  downloadCount = 0,
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
  feedId,
  tempUser,
  token,
  onHideFromUI,
  onNotInterested,
  categoryId,
}) => {
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  const [localSharesCount, setLocalSharesCount] = useState(shareCount);
  const [localDownloadCount, setLocalDownloadCount] = useState(downloadCount);
  const [localSaved, setLocalSaved] = useState(isSaved);

  useEffect(() => {
    setLocalLiked(isLiked);
    setLocalLikesCount(likesCount);
    setLocalSharesCount(shareCount);
    setLocalDownloadCount(downloadCount);
    setLocalSaved(isSaved);
  }, [isLiked, likesCount, shareCount, downloadCount, isSaved]);

  const instantLike = async () => {
    const optimistic = !localLiked;

    setLocalLiked(optimistic);
    setLocalLikesCount((prev) =>
      optimistic ? prev + 1 : Math.max(prev - 1, 0)
    );

    try {
      await handleLikeFeed();
    } catch (err) {
      setLocalLiked(!optimistic);
      setLocalLikesCount((prev) => (optimistic ? prev - 1 : prev + 1));
    }
  };

  const instantShare = async () => {
    const currentCount = localSharesCount;
    setLocalSharesCount(currentCount + 1);

    try {
      await handleShare();
    } catch (err) {
      setLocalSharesCount(currentCount);
    }
  };

  const instantSave = async () => {
    const optimistic = !localSaved;
    setLocalSaved(optimistic);
    try {
      await handleSave();
    } catch (err) {
      setLocalSaved(!optimistic);
    }
  };

  const instantDownload = async () => {
    const currentCount = localDownloadCount;
    setLocalDownloadCount(currentCount + 1);
    try {
      await handleDownload();
    } catch (error) {
      console.error("Download failed:", error);
      setLocalDownloadCount(currentCount);
    }
  };

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
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

          {/* Comment icon hidden per user request */}

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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button
              onClick={instantDownload}
              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
              aria-label="Download"
              title="Download"
            >
              <Download style={{ fontSize: 22 }} />
            </button>
            {localDownloadCount > 0 && (
              <span className="text-sm font-semibold text-gray-800 min-w-[20px]">
                {localDownloadCount > 999
                  ? `${(localDownloadCount / 1000).toFixed(1)}k`
                  : localDownloadCount}
              </span>
            )}
          </div>

          <PostOptionsMenu
            feedId={feedId}
            categoryId={categoryId}
            authUserId={tempUser?._id}
            token={token}
            onHideFromUI={onHideFromUI}
            onNotInterested={onNotInterested}
          />
        </div>
      </div>

      {caption && (
        <div className="mb-2">
          <p className="text-sm text-gray-900">
            <span className="font-semibold mr-2">{userName}</span>
            {caption}
          </p>
        </div>
      )}

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
