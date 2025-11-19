import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { UserCheck, UserPlus, X, ShieldBan } from "lucide-react";

export default function FriendsSection({ onFollowDataUpdate }) {
  const [activeSubTab, setActiveSubTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchFollowData = async () => {
    setLoading(true);
    try {
      const [followersRes, followingsRes] = await Promise.all([
        api.get(`/api/user/followers`),
        api.get(`/api/user/following`),
      ]);

      setFollowers(followersRes.data.followers || []);
      setFollowings(followingsRes.data.following || []);

      // Notify parent component about updated counts
      if (onFollowDataUpdate) {
        onFollowDataUpdate({
          followersCount: followersRes.data.followers?.length || 0,
          followingCount: followingsRes.data.following?.length || 0
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
  }, []);

  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/api/user/unfollow/creator`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        // Update local state
        setFollowers((prev) => prev.filter((f) => f.userId !== userId));
        setFollowings((prev) => prev.filter((f) => f.userId !== userId));
        
        // Refresh data to get updated counts
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
      // Assuming you have a block API endpoint
      const res = await api.post(
        `/api/user/block`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        console.log("Blocked user:", userId);
        
        // Update local state
        setFollowers((prev) => prev.filter((f) => f.userId !== userId));
        setFollowings((prev) => prev.filter((f) => f.userId !== userId));
        
        // Refresh data to get updated counts
        await fetchFollowData();
      }
    } catch (err) {
      console.error("Block user error:", err);
      // Fallback: still update UI even if API fails
      setFollowers((prev) => prev.filter((f) => f.userId !== userId));
      setFollowings((prev) => prev.filter((f) => f.userId !== userId));
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

        // Remove ONLY from followers list
        setFollowers((prev) => prev.filter((f) => f.userId !== userId));
        
        // Refresh data to get updated counts
        await fetchFollowData();
      }
    } catch (err) {
      console.error("Remove follower error:", err.response?.data || err.message);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {[
          { id: "followers", label: "Followers", Icon: UserCheck },
          { id: "followings", label: "Followings", Icon: UserPlus },
        ].map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium capitalize transition-all
                ${
                  activeSubTab === tab.id
                    ? "border-b-2 border-purple-600 text-purple-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <p className="text-center text-gray-500 py-10">Loading...</p>
        ) : activeSubTab === "followers" ? (
          <FollowersTab
            followers={followers}
            onRemove={handleRemove}
            onBlock={handleBlock}
          />
        ) : (
          <FollowingsTab
            followings={followings}
            onUnfollow={handleUnfollow}
          />
        )}
      </div>
    </div>
  );
}

/* ---------------- Followers Tab ---------------- */
function FollowersTab({ followers, onRemove, onBlock }) {
  if (!followers.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No followers yet
        </h3>
        <p className="text-sm text-gray-600">Start connecting with people!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Followers ({followers.length})
      </h3>
      {followers.map((f) => (
        <div
          key={f.userId}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center gap-3">
            <img
              src={f.profileAvatar || "https://i.pravatar.cc/40"}
              alt={f.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="font-medium text-gray-900">{f.userName}</span>
              <p className="text-xs text-gray-500">{f.followedAt}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onBlock(f.userId)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            >
              <ShieldBan className="w-4 h-4" /> Block
            </button>

            <button
              onClick={() => onRemove(f.userId)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              <X className="w-4 h-4" /> Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Followings Tab ---------------- */
function FollowingsTab({ followings, onUnfollow }) {
  if (!followings.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No followings yet
        </h3>
        <p className="text-sm text-gray-600">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Following ({followings.length})
      </h3>

      {followings.map((r) => (
        <div
          key={r.userId}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center gap-3">
            <img
              src={r.profileAvatar || "https://i.pravatar.cc/40"}
              alt={r.userName}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <span className="font-medium text-gray-900">{r.userName}</span>
              <p className="text-xs text-gray-500">{r.followedAt}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onUnfollow(r.userId)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-md hover:bg-red-200"
            >
              <X className="w-4 h-4" /> Unfollow
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}