import React, { useState, useRef, useEffect } from "react";
import PostOptionsMenu from "../PostOptionsMenu";
import api from "../../../api/axios";
import { Bookmark, BookmarkCheck } from "lucide-react";

const PostHeader = ({
  userId,
  userName,
  profileAvatar,
  timeAgo,
  navigate,
  feedId,
  tempUser,
  toggleSaved,
  dec,
  token,
  onHidePost,
  onNotInterested,
  isFollowing: initialFollowState,
  onFollow,
  onUnfollow,
   // <-- Add this prop if needed
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [isSaved, setIsSaved] = useState(toggleSaved); // 🔥 NEW: save state

  const currentUser = localStorage.getItem("userId");

  const descRef = useRef(null);

  // Update following state if prop changes
  useEffect(() => {
    setIsFollowing(initialFollowState);
  }, [initialFollowState]);

  // Update saved state if prop changes
  useEffect(() => {
    setIsSaved(isSaved);
  }, [isSaved]);

  // =============== FOLLOW / UNFOLLOW ==================
  const handleToggleFollow = async () => {
    const optimistic = !isFollowing;
    setIsFollowing(optimistic);

    try {
      optimistic ? await onFollow() : await onUnfollow();
    } catch (err) {
      setIsFollowing(!optimistic);
    }
  };

  // =============== SAVE / UNSAVE FEED =================
  const handleToggleSave = async () => {
    const optimistic = !isSaved;
    setIsSaved(optimistic); // instant UI

    try {
      await api.post(
        "/api/user/feed/save",
        { feedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Save failed:", err);
      setIsSaved(!optimistic); // rollback
    }
  };

  // Handle description overflow detection
  useEffect(() => {
    if (descRef.current) {
      const lineHeight = 20;
      const maxHeight = lineHeight * 4;
      if (descRef.current.scrollHeight > maxHeight) {
        setIsOverflowing(true);
      }
    }
  }, [dec]);

  return (
    <div className="flex flex-col p-4">

      {/* Header row */}
      <div className="flex items-center justify-between">

        {/* Avatar & Name */}
        <div
          onClick={() => navigate(`/user/profile/${userId}`)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={profileAvatar}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold text-gray-900 dark:text-white">
              {userName}
            </p>
            <p className="text-xs text-gray-500">{timeAgo || "Recently"}</p>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">

          {/* SAVE BUTTON (bookmark) */}
          <button
            onClick={handleToggleSave}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            title={isSaved ? "Unsave" : "Save"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-blue-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-700" />
            )}
          </button>

          {/* FOLLOW BUTTON */}
          {userId !== currentUser && (
            <button
              onClick={handleToggleFollow}
              className={`px-3 py-1 rounded-full text-sm font-medium border transition ${
                isFollowing
                  ? "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
                  : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
              }`}
            >
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}

          {/* Post options (hide, not interested, report, etc) */}
          <PostOptionsMenu
            feedId={feedId}
            authUserId={tempUser._id}
            token={token}
            onHidePost={onHidePost}
            onNotInterested={onNotInterested}
          />
        </div>
      </div>

      {/* Description */}
      {dec && (
        <div className="mt-2">
          <div
            ref={descRef}
            className={`text-sm text-gray-700 dark:text-gray-300 overflow-hidden transition-all duration-200 ${
              expanded ? "max-h-none" : "max-h-[80px] line-clamp-4"
            }`}
            dangerouslySetInnerHTML={{ __html: dec }}
          />

          {!expanded && isOverflowing && (
            <button
              onClick={() => setExpanded(true)}
              className="text-xs text-blue-600 font-medium mt-1"
            >
              Show more...
            </button>
          )}

          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-blue-600 font-medium mt-1"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PostHeader;
