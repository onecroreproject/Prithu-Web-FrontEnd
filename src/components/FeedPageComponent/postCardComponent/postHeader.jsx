import React from "react";
import PostOptionsMenu from "../PostOptionsMenu";
import { MoreVertical } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

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
  const { onlineUsers } = useAuth();
  const isOnline = onlineUsers.has(userId);

  const currentUser = localStorage.getItem("userId");
  const isOwner = currentUser === userId;

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
      <div className="flex items-center gap-3">
        <div
          onClick={() => navigate(`/home/user/profile/${userId}`)}
          className="relative w-8 h-8 overflow-hidden cursor-pointer"
        >
          {profileAvatar ? (
            <img
              src={profileAvatar}
              alt={userName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
          )}
        </div>


        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate(`/home/user/profile/${userId}`)}
              className="text-sm font-semibold text-gray-900 hover:opacity-80 transition-opacity text-left"
            >
              {userName}
            </button>
            {post.postedBy?.role === "Admin" && (
              <span className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Admin
              </span>
            )}
          </div>
          {timeAgo && (
            <span className="text-xs text-gray-400">{timeAgo}</span>
          )}
        </div>

        {!isOwner && (
          <div className="ml-2">
            {isFollowing ? (
              <button
                onClick={handleToggleFollow}
                className="text-xs font-semibold text-gray-900 bg-transparent hover:bg-gray-100 border border-gray-300 rounded px-3 py-1.5 transition-all duration-200"
              >
                Following
              </button>
            ) : (
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

      <div className="flex items-center">
        <PostOptionsMenu
          feedId={feedId}
          authUserId={tempUser?._id}
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
