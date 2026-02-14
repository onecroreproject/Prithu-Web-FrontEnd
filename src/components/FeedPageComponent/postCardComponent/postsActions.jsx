import React, { useState, useEffect } from "react";
import {
  FavoriteBorder,
  Favorite,
  ChatBubbleOutline,
  SendOutlined,
  BookmarkBorder,
  Bookmark,
  Download,
  Visibility,
} from "@mui/icons-material";
import PostOptionsMenu from "../PostOptionsMenu";

const PostActions = ({
  isLiked,
  likesCount = 0,
  shareCount = 0,
  downloadCount = 0,
  viewsCount = 0,
  handleLikeFeed,
  handleShare,
  handleSave,
  handleDownload,
  post,
  caption = "",
  userName = "",
  isSaved = false,
  feedId,
  tempUser,
  token,
  onHideFromUI,
  onNotInterested,
  categoryId,
  viewMode = "list",
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
    try {
      await handleDownload();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <div className={viewMode === 'grid' ? "px-3 py-2" : "px-4 py-3"}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <button
              onClick={instantLike}
              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
              aria-label={localLiked ? "Unlike" : "Like"}
            >
              {localLiked ? (
                <Favorite className="text-red-500" style={{ fontSize: viewMode === 'grid' ? 20 : 26 }} />
              ) : (
                <FavoriteBorder style={{ fontSize: viewMode === 'grid' ? 20 : 26 }} />
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
              <SendOutlined style={{ fontSize: viewMode === 'grid' ? 18 : 24 }} />
            </button>
            {localSharesCount > 0 && (
              <span className="text-sm font-semibold text-gray-800 min-w-[20px]">
                {localSharesCount > 1000
                  ? `${(localSharesCount / 1000).toFixed(1)}k`
                  : localSharesCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Eye Icon for Views Count */}
          <div className="flex items-center gap-1">
            <button
              className="p-1 focus:outline-none hover:opacity-70 transition-opacity cursor-default"
              aria-label="Views"
            >
              <Visibility style={{ fontSize: viewMode === 'grid' ? 18 : 22, color: "#666" }} />
            </button>
            <span className="text-sm font-semibold text-gray-800 min-w-[20px]">
              {viewsCount > 1000
                ? `${(viewsCount / 1000).toFixed(1)}k`
                : viewsCount}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={instantDownload}
              className="p-1 focus:outline-none hover:opacity-70 transition-opacity"
              aria-label="Download"
              title="Download"
            >
              <Download style={{ fontSize: viewMode === 'grid' ? 18 : 22 }} />
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

     


    </div>
  );
};

export default PostActions;
