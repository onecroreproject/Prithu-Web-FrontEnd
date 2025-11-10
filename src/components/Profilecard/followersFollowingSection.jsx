import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { UserCheck, UserPlus, X, ShieldBan } from "lucide-react";

export default function FriendsSection() {
  const [activeSubTab, setActiveSubTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch followers and followings
  useEffect(() => {
    const fetchFollowData = async () => {
      setLoading(true);
      try {
        const [followersRes, followingsRes] = await Promise.all([
          api.get(`/api/user/followers`),
          api.get(`/api/user/following`),
        ]);

        setFollowers(followersRes.data.followers || []);
        setFollowings(followingsRes.data.following || []);
      } catch (error) {
        console.error("Error fetching follow data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, []);

  const subTabs = [
    { id: "followers", label: "Followers", Icon: UserCheck },
    { id: "followings", label: "Followings", Icon: UserPlus },
  ];

  const handleUnfollow = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.post(
        `/api/user/unfollow/creator`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 200) {
        setFollowers((prev) => prev.filter((f) => f.userId !== userId));
        setFollowings((prev) => prev.filter((f) => f.userId !== userId));
        console.log("✅ Unfollowed user:", userId);
      }
    } catch (err) {
      console.error("❌ Unfollow API error:", err.response?.data || err.message);
    }
  };

  const handleBlock = async (userId) => {
    try {
      // 🔒 Placeholder — replace with your block API if available
      console.log("🚫 Blocked user:", userId);
      setFollowings((prev) => prev.filter((f) => f.userId !== userId));
    } catch (err) {
      console.error("❌ Block user error:", err);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <p className="text-center text-gray-500 py-10">Loading...</p>;
    }

    if (activeSubTab === "followers")
      return <FollowersTab followers={followers} onUnfollow={handleUnfollow} />;
    if (activeSubTab === "followings")
      return <FollowingsTab followings={followings} onBlock={handleBlock} />;

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {subTabs.map((tab) => {
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
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}

/* ───────── Followers Tab ───────── */
function FollowersTab({ followers, onUnfollow }) {
  if (!followers || followers.length === 0) {
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
          <button
            onClick={() => onUnfollow(f.userId)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-all"
          >
            <X className="w-4 h-4" /> Unfollow
          </button>
        </div>
      ))}
    </div>
  );
}

/* ───────── Followings Tab ───────── */
function FollowingsTab({ followings, onBlock }) {
  if (!followings || followings.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No followings yet
        </h3>
        <p className="text-sm text-gray-600">You’re all caught up!</p>
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

          <button
            onClick={() => onBlock(r.userId)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-all"
          >
            <ShieldBan className="w-4 h-4" /> Block
          </button>
        </div>
      ))}
    </div>
  );
}
