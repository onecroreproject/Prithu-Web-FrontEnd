// ✅ src/components/FeedPageComponent/postCardComponent/postHeader.jsx
import React from "react";
import PostOptionsMenu from "../PostOptionsMenu";
import { MoreVertical } from "lucide-react";

const PostHeader = ({
  userId,
  userName,
  post,
  profileAvatar,
  timeAgo,
  navigate,
  feedId,
  tempUser,
  token,
  onHideFromUI,
  onNotInterested,
  isFollowing: initialFollowState,
  onFollow,
  onUnfollow,
}) => {
  const [isFollowing, setIsFollowing] = React.useState(initialFollowState);

  const currentUser = localStorage.getItem("userId");
  const isOwner = currentUser === userId;

  /* ------------------------------------------------------------
      FOLLOW/UNFOLLOW
  ------------------------------------------------------------ */
  const handleToggleFollow = async () => {
    if (isOwner) return;

    const optimistic = !isFollowing;
    setIsFollowing(optimistic);

    try {
      optimistic ? await onFollow() : await onUnfollow();
    } catch (err) {
      setIsFollowing(!optimistic);
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Left side: User info - Instagram exact style */}
      <div className="flex items-center gap-3">
        {/* Avatar - Instagram exact circle (32px) */}
        <div 
          onClick={() => navigate(`/home/user/profile/${userId}`)}
          className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
        >
          {profileAvatar ? (
            <img 
              src={profileAvatar} 
              alt={userName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* Username and time - Instagram exact style */}
        <div className="flex flex-col">
          <button 
            onClick={() => navigate(`/home/user/profile/${userId}`)}
            className="text-sm font-semibold text-gray-900 hover:opacity-80 transition-opacity text-left"
          >
            {userName}
          </button>
          {timeAgo && (
            <span className="text-xs text-gray-400">{timeAgo}</span>
          )}
        </div>
        
        {/* Instagram-style Follow button for non-owners */}
        {!isOwner && (
          <div className="ml-2">
            {isFollowing ? (
              // Following button style (Instagram design)
              <button
                onClick={handleToggleFollow}
                className="text-xs font-semibold text-gray-900 bg-transparent hover:bg-gray-100 border border-gray-300 rounded px-3 py-1.5 transition-all duration-200"
              >
                Following
              </button>
            ) : (
              // Follow button style (Instagram design)
              <button
                onClick={handleToggleFollow}
                className="text-xs font-semibold text-white bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 rounded px-3 py-1.5 transition-all duration-200 shadow-sm"
              >
                Follow
              </button>
            )}
          </div>
        )}
      </div>

      {/* Right side: Options menu */}
      <div className="flex items-center">
        <PostOptionsMenu
          feedId={feedId}
          authUserId={tempUser._id}
          token={token}
          onHideFromUI={onHideFromUI}
          onNotInterested={onNotInterested}
          trigger={
            <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-700" />
            </button>
          }
        />
      </div>
    </div>
  );
};

export default PostHeader;