// src/components/GroupsSection.jsx
import React, { useState } from "react";
import { Users, UserPlus, Check, X, LogOut } from "lucide-react";

export default function GroupsSection() {
  const [activeSubTab, setActiveSubTab] = useState("membership");

  // Dummy data – replace with real API later
  const memberships = [
    { id: 1, name: "Cycling Club", members: 128, avatar: "https://i.pravatar.cc/80?img=10" },
    { id: 2, name: "Book Lovers", members: 89, avatar: "https://i.pravatar.cc/80?img=11" },
    { id: 3, name: "Tech Talks", members: 312, avatar: "https://i.pravatar.cc/80?img=12" },
  ];

  const invitations = [
    { id: 4, name: "Photography Enthusiasts", inviter: "John Doe", members: 67, avatar: "https://i.pravatar.cc/80?img=13" },
    { id: 5, name: "Startup Founders", inviter: "Sarah Lee", members: 203, avatar: "https://i.pravatar.cc/80?img=14" },
  ];

  const subTabs = [
    { id: "membership", label: "Membership", Icon: Users },
    { id: "invitations", label: "Invitations", Icon: UserPlus },
  ];

  const renderContent = () => {
    if (activeSubTab === "membership") return <MembershipTab groups={memberships} />;
    if (activeSubTab === "invitations") return <InvitationsTab invites={invitations} />;
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

function MembershipTab({ groups }) {
  const handleLeave = (id) => {
    alert(`Left group ${id}`);
    // TODO: API call to leave group
  };

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Not in any groups</h3>
        <p className="text-sm text-gray-600">Join a group to connect with others!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Your Groups ({groups.length})
      </h3>
      {groups.map((g) => (
        <div
          key={g.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3">
            <img
              src={g.avatar}
              alt={g.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-medium text-gray-900">{g.name}</h4>
              <p className="text-xs text-gray-500">{g.members} members</p>
            </div>
          </div>
          <button
            onClick={() => handleLeave(g.id)}
            className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            Leave
          </button>
        </div>
      ))}
    </div>
  );
}

function InvitationsTab({ invites }) {
  const handleAccept = (id) => {
    alert(`Accepted invite to group ${id}`);
    // TODO: API call to accept
  };
  const handleDecline = (id) => {
    alert(`Declined invite to group ${id}`);
    // TODO: API call to decline
  };

  if (invites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No group invites</h3>
        <p className="text-sm text-gray-600">You’ll see invites here when received.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Group Invitations ({invites.length})
      </h3>
      {invites.map((i) => (
        <div
          key={i.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition"
        >
          <div className="flex items-center gap-3">
            <img
              src={i.avatar}
              alt={i.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div>
              <h4 className="font-medium text-gray-900">{i.name}</h4>
              <p className="text-xs text-gray-500">
                Invited by <span className="font-medium">{i.inviter}</span> · {i.members} members
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleAccept(i.id)}
              className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-md hover:bg-green-700 flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Accept
            </button>
            <button
              onClick={() => handleDecline(i.id)}
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