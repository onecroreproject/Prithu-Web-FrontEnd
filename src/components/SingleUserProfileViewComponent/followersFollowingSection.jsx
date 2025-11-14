import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { UserCheck, UserPlus } from "lucide-react";

export default function FriendsSection({ userData }) {
  const [activeSubTab, setActiveSubTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch followers and followings using userId in POST body
  useEffect(() => {
    const fetchFollowData = async () => {
      if (!userData?._id) return; // prevent before data ready

      setLoading(true);
      try {
        const [followersRes, followingsRes] = await Promise.all([
          api.post(`/api/individual/user/followers`, { userId: userData._id }),
          api.post(`/api/individual/user/following`, { userId: userData._id }),
        ]);

        setFollowers(followersRes.data.followers || []);
        setFollowings(followingsRes.data.following || []);
      } catch (error) {
        console.error("❌ Error fetching follow data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowData();
  }, [userData?._id]);

  const subTabs = [
    { id: "followers", label: "Followers", Icon: UserCheck },
    { id: "followings", label: "Followings", Icon: UserPlus },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* ─── Tabs ─── */}
      <div className="flex gap-1 border-b border-gray-200">
        {subTabs.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium capitalize transition-all ${
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

      {/* ─── Tab Content ─── */}
      <div className="p-4">
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading...</p>
        ) : activeSubTab === "followers" ? (
          <FollowersTab followers={followers} />
        ) : (
          <FollowingsTab followings={followings} />
        )}
      </div>
    </div>
  );
}

/* ───────── Followers Tab ───────── */
function FollowersTab({ followers }) {
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
        </div>
      ))}
    </div>
  );
}

/* ───────── Followings Tab ───────── */
function FollowingsTab({ followings }) {
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
        </div>
      ))}
    </div>
  );
}
