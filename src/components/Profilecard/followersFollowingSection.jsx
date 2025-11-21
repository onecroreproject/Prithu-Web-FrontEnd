import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { UserCheck, UserPlus, X, ShieldBan, Calendar, User, Mail, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
 
export default function FriendsSection({ onFollowDataUpdate, id }) {
  const [activeSubTab, setActiveSubTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowData = async () => {
    setLoading(true);
    try {
      let followersRes, followingsRes;

      // 🔹 If id exists → fetch specific user's follow data
      if (id) {
        [followersRes, followingsRes] = await Promise.all([
          api.get(`/api/single/user/followers?id=${id}`),
          api.get(`/api/single/user/following?id=${id}`)
        ]);
      } 
      
      // 🔹 Otherwise → fetch your own follow data
      else {
        [followersRes, followingsRes] = await Promise.all([
          api.get(`/api/user/followers`),
          api.get(`/api/user/following`)
        ]);
      }

      // Update state
      setFollowers(followersRes.data.followers || []);
      setFollowings(followingsRes.data.following || []);

      // Notify parent component about updated counts
      if (onFollowDataUpdate) {
        onFollowDataUpdate({
          followersCount: followersRes.data.followers?.length || 0,
          followingCount: followingsRes.data.following?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching follow data:", error);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchFollowData();
  }, [id]); // Added id as dependency to refetch when id changes
 
  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/api/user/unfollow/creator`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
 
      if (res.status === 200) {
        await fetchFollowData();
        console.log("Unfollowed:", userId);
      }
    } catch (err) {
      console.error("Unfollow error:", err.response?.data || err.message);
    }
  };
 
  const handleBlock = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/api/user/block`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
 
      if (res.status === 200) {
        console.log("Blocked user:", userId);
        await fetchFollowData();
      }
    } catch (err) {
      console.error("Block user error:", err);
      await fetchFollowData();
    }
  };
 
  const handleRemove = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        "/api/user/remove/follower",
        { followerId: userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
 
      if (res.status === 200) {
        console.log("Removed follower:", userId);
        await fetchFollowData();
      }
    } catch (err) {
      console.error("Remove follower error:", err.response?.data || err.message);
    }
  };

  const handleMessage = (userId) => {
    // Navigate to chat with the user
    const navigate = useNavigate();
    navigate(`/chat/${userId}`);
  };
 
  const subTabs = [
    {
      id: "followers",
      label: "Followers",
      Icon: UserCheck,
      count: followers.length,
    },
    {
      id: "followings",
      label: "Following",
      Icon: UserPlus,
      count: followings.length,
    },
  ];
 
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex px-4 sm:px-6">
          {subTabs.map((tab) => {
            const Icon = tab.Icon;
            const isActive = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 sm:px-6 py-4 text-sm font-medium transition-all duration-200 border-b-2 -mb-px
                  ${isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  isActive ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
 
      {/* Content */}
      <div className="p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center items-center py-8 sm:py-12">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : activeSubTab === "followers" ? (
          <FollowersTab
            followers={followers}
            onRemove={handleRemove}
            onBlock={handleBlock}
            onMessage={handleMessage}
            id={id} // Pass id to hide buttons
          />
        ) : (
          <FollowingsTab
            followings={followings}
            onUnfollow={handleUnfollow}
            onMessage={handleMessage}
            id={id} // Pass id to hide buttons
          />
        )}
      </div>
    </div>
  );
}
 
/* ---------------- Followers Tab ---------------- */
function FollowersTab({ followers, onRemove, onBlock, onMessage, id }) {
  if (!followers.length) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          No followers yet
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
          Start connecting with people and building your network to see followers here.
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {followers.map((follower) => (
          <FollowerCard
            key={follower.userId}
            follower={follower}
            onRemove={onRemove}
            onBlock={onBlock}
            onMessage={onMessage}
            id={id} // Pass id to hide buttons
          />
        ))}
      </div>
    </div>
  );
}
 
/* ---------------- Followings Tab ---------------- */
function FollowingsTab({ followings, onUnfollow, onMessage, id }) {
  if (!followings.length) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2">
          Not following anyone yet
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
          Discover and connect with people to build your network and see them here.
        </p>
      </div>
    );
  }
 
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4">
        {followings.map((following) => (
          <FollowingCard
            key={following.userId}
            following={following}
            onUnfollow={onUnfollow}
            onMessage={onMessage}
            id={id} // Pass id to hide buttons
          />
        ))}
      </div>
    </div>
  );
}
 
/* ---------------- Follower Card Component ---------------- */
function FollowerCard({ follower, onRemove, onBlock, onMessage, id }) {
  const navigate = useNavigate();

  const handleMessageClick = (e) => {
    e.stopPropagation();
    navigate(`/chat/${follower.userId}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200">
      <div
        onClick={() => navigate(`/user/profile/${follower.userId}`)}
        className="flex flex-col items-center text-center cursor-pointer"
      >
        {/* Avatar */}
        <div className="relative mb-3">
          <img
            src={follower.profileAvatar}
            className="w-14 h-14 rounded-full object-cover"
            alt="avatar"
          />
        </div>

        {/* Info */}
        <h4 className="font-semibold text-sm">{follower.userName}</h4>
        <p className="text-xs text-gray-500 mb-3">@{follower.userName}</p>

        {/* ❌ Hide action buttons if id exists (viewing another user's profile) */}
        {!id && (
          <div className="flex gap-2 w-full mt-2">
            {/* Message Button */}
            <button
              onClick={handleMessageClick}
              className="flex items-center justify-center gap-1 flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 text-xs rounded-lg transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Message
            </button>

            {/* Remove Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(follower.userId);
              }}
              className="flex items-center justify-center gap-1 flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-lg transition-colors"
            >
              <X className="w-3 h-3" />
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
 
/* ---------------- Following Card Component ---------------- */
function FollowingCard({ following, onUnfollow, onMessage, id }) {
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleMessageClick = (e) => {
    e.stopPropagation();
    navigate(`/chat/${following.userId}`);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200">
      <div
        onClick={() => navigate(`/user/profile/${following.userId}`)}
        className="flex flex-col items-center text-center cursor-pointer"
      >
        {/* Avatar */}
        <div className="relative mb-3">
          <img
            src={following.profileAvatar}
            className="w-14 h-14 rounded-full object-cover"
            alt="avatar"
          />
        </div>

        {/* Info */}
        <h4 className="font-semibold text-sm">{following.userName}</h4>
        <p className="text-xs text-gray-500 mb-3">@{following.userName}</p>

        {/* ❌ Hide all unfollow buttons if id exists (viewing another user's profile) */}
        {!id && (
          <div className="flex gap-2 w-full mt-2">
            {/* Message Button - Always visible for your own following */}
            <button
              onClick={handleMessageClick}
              className="flex items-center justify-center gap-1 flex-1 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 text-xs rounded-lg transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
              Message
            </button>

            {/* Unfollow Button */}
            {!showUnfollowConfirm ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUnfollowConfirm(true);
                }}
                className="flex items-center justify-center gap-1 flex-1 py-2 bg-red-100 hover:bg-red-200 text-red-600 text-xs rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
                Unfollow
              </button>
            ) : (
              <div className="flex gap-2 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnfollow(following.userId);
                  }}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition-colors"
                >
                  Yes
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUnfollowConfirm(false);
                  }}
                  className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-colors"
                >
                  No
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}