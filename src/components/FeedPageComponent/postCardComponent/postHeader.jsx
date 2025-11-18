import React, { useState, useRef, useEffect } from "react";
import PostOptionsMenu from "../PostOptionsMenu";

const PostHeader = ({
  userId,
  userName,
  profileAvatar,
  timeAgo,
  navigate,
  feedId,
  tempUser,
  dec,
  token,
  onHidePost,
  onNotInterested,
  isFollowing: initialFollowState,
  onFollow,
  onUnfollow,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialFollowState); // <-- local instant update

  const descRef = useRef(null);
console.log(tempUser)

  useEffect(() => {
    setIsFollowing(initialFollowState); 
  }, [initialFollowState]);

  // Handle Instant Follow/Unfollow
  const handleToggleFollow = async () => {
    const optimistic = !isFollowing;
    setIsFollowing(optimistic); // ⚡ INSTANT UI update

    try {
      if (optimistic) {
        await onFollow(); // call parent action API
      } else {
        await onUnfollow();
      }
    } catch (err) {
      // ❌ Rollback if request fails
      setIsFollowing(!optimistic);
      console.error("Follow Toggle Failed:", err);
    }
  };

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
        <div
          onClick={() => navigate(`/profile/${userId}`)}
          className="flex items-center gap-3 cursor-pointer"
        >
          <img
            src={profileAvatar}
            alt="avatar"
            className="w-11 h-11 rounded-full object-cover"
          />

          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
            <p className="text-xs text-gray-500">{timeAgo || "Recently"}</p>
          </div>
        </div>

        {/* Follow Button */}
        <div className="flex items-center gap-2">
           {tempUser?._id && userId && tempUser.userName !== userId && (
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

          <PostOptionsMenu
            feedId={feedId}
            authUserId={tempUser._id}
            token={token}
            onHidePost={onHidePost}
            onNotInterested={onNotInterested}
          />
        </div>
      </div>

      {/* Description Preview */}
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
