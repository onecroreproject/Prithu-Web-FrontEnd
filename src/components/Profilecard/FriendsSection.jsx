// src/components/FriendsSection.jsx
import React, { useState } from "react";
import { UserCheck, UserPlus, X, Check } from "lucide-react";

export default function FriendsSection() {
  const [activeSubTab, setActiveSubTab] = useState("friendship");

  // ────── Dummy data (replace with API later) ──────
  const friends = [
    { id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/40?img=1" },
    { id: 2, name: "Sarah Lee", avatar: "https://i.pravatar.cc/40?img=2" },
    { id: 3, name: "Mike Chen", avatar: "https://i.pravatar.cc/40?img=3" },
  ];

  const requests = [
    { id: 4, name: "Emma Wilson", avatar: "https://i.pravatar.cc/40?img=4" },
    { id: 5, name: "Liam Brown", avatar: "https://i.pravatar.cc/40?img=5" },
  ];
  // ───────────────────────────────────────────────────

  const subTabs = [
    { id: "friendship", label: "Followers", Icon: UserCheck },
    { id: "requests", label: "Followings", Icon: UserPlus },
  ];

  const renderContent = () => {
    if (activeSubTab === "friendship") return <FriendshipTab friends={friends} />;
    if (activeSubTab === "requests") return <RequestsTab requests={requests} />;
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Sub-tab navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {subTabs.map((tab) => {
          const Icon = tab.Icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium capitalize transition-all
                ${activeSubTab === tab.id
                  ? "border-b-2 border-purple-600 text-purple-600"
                  : "text-gray-600 hover:text-gray-900"
                }
              `}
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

/* ────── Sub-Tab Components ────── */

function FriendshipTab({ friends }) {
  const handleRemove = (id) => {
    // TODO: call API to unfriend
    alert(`Remove friend ${id}`);
  };

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserCheck className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No friends yet</h3>
        <p className="text-sm text-gray-600">Start connecting with people!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Your Friends ({friends.length})
      </h3>
      {friends.map((f) => (
        <div
          key={f.id}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center gap-3">
            <img
              src={f.avatar}
              alt={f.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-medium text-gray-900">{f.name}</span>
          </div>
          <button
            onClick={() => handleRemove(f.id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

function RequestsTab({ requests }) {
  const handleAccept = (id) => {
    // TODO: accept request API
    alert(`Accepted ${id}`);
  };
  const handleDecline = (id) => {
    // TODO: decline request API
    alert(`Declined ${id}`);
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No pending requests</h3>
        <p className="text-sm text-gray-600">You’re all caught up!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Friend Requests ({requests.length})
      </h3>
      {requests.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
        >
          <div className="flex items-center gap-3">
            <img
              src={r.avatar}
              alt={r.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <span className="font-medium text-gray-900">{r.name}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(r.id)}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Accept
            </button>
            <button
              onClick={() => handleDecline(r.id)}
              className="px-3 py-1.5 bg-gray-300 text-gray-800 text-xs font-medium rounded-md hover:bg-gray-400 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Decline
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}