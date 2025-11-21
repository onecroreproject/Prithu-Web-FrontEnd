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
  onHideFromUI,
  onNotInterested,
  isFollowing: initialFollowState,
  onFollow,
  onUnfollow,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [isSaved, setIsSaved] = useState(toggleSaved);

  const descRef = useRef(null);

  const currentUser = localStorage.getItem("userId");
  const isOwner = currentUser === userId;  // ✔ user is the owner

  /* ------------------------------------------------------------
      FOLLOW/UNFOLLOW
  ------------------------------------------------------------ */
  const handleToggleFollow = async () => {
    if (isOwner) return; // prevent own follow

    const optimistic = !isFollowing;
    setIsFollowing(optimistic);

    try {
      optimistic ? await onFollow() : await onUnfollow();
    } catch (err) {
      setIsFollowing(!optimistic);
    }
  };

  /* ------------------------------------------------------------
      SAVE/UNSAVE — NOT ALLOWED FOR OWN POST
  ------------------------------------------------------------ */
  const handleToggleSave = async () => {
    if (isOwner) return;

    const optimistic = !isSaved;
    setIsSaved(optimistic);

    try {
      await api.post(
        "/api/user/feed/save",
        { feedId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      setIsSaved(!optimistic);
    }
  };

  /* ------------------------------------------------------------
      DESCRIPTION COLLAPSE LOGIC
  ------------------------------------------------------------ */
  useEffect(() => {
    if (descRef.current) {
      const maxHeight = 20 * 4;
      if (descRef.current.scrollHeight > maxHeight) {
        setIsOverflowing(true);
      }
    }
  }, [dec]);

  return (
    <div className="flex flex-col p-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        
        {/* Avatar + Name */}
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

          {/* ✔ SAVE BUTTON hidden for own post */}
          {!isOwner && (
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
          )}

          {/* ✔ FOLLOW BUTTON hidden for own post */}
          {!isOwner && (
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

          {/* ❌ OPTIONS MENU removed for owner */}
          {!isOwner && (
            <PostOptionsMenu
              feedId={feedId}
              authUserId={tempUser._id}
              token={token}
              onHidePost={onHidePost}
              onHideFromUI={onHideFromUI}
              onNotInterested={onNotInterested}
            />
          )}
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
