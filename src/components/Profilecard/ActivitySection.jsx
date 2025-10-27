// src/components/ActivitySection.jsx
import React, { useState } from "react";
import PostComposer from "./PostComposer";
import ActivityFeed from "./ActivityFeed";

export default function ActivitySection({ userAvatar, userName, activities }) {
  const [activeSubTab, setActiveSubTab] = useState("personal");

  const subTabs = [
    { id: "personal", label: "Personal" },
    { id: "mentions", label: "Mentions" },
    { id: "favourites", label: "Favourites" },
    { id: "friends", label: "Friends" },
    { id: "groups", label: "Groups" },
  ];

  const renderContent = () => {
    switch (activeSubTab) {
      case "personal":
        return (
          <>
            <PostComposer userAvatar={userAvatar} userName={userName} />
            <ActivityFeed activities={activities} />
          </>
        );

      case "mentions":
        return <MentionsTab />;

      case "favourites":
        return <FavouritesTab />;

      case "friends":
        return <FriendsActivityTab />;

      case "-groups":
        return <GroupsActivityTab />;

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Sub-Tab Navigation */}
      <div className="flex gap-1 border-b border-gray-200">
        {subTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium capitalize transition-all duration-200
              ${activeSubTab === tab.id
                ? "border-b-2 border-purple-600 text-purple-600"
                : "text-gray-600 hover:text-gray-900"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}

/* ────── Sub-Tab Components ────── */

/* 1. Mentions */
function MentionsTab() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-2xl text-gray-400">@</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No mentions yet</h3>
      <p className="text-sm text-gray-600">When someone mentions you, it’ll show here.</p>
    </div>
  );
}

/* 2. Favourites */
function FavouritesTab() {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
        <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.953a1 1 0 00.95.69h4.16c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1  |

 1 0 00-.364 1.118l1.287 3.953c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.287-3.953a1 1 0 00-.364-1.118L2.098 9.38c-.784-.57-.38-1.81.588-1.81h4.16a1 1 0 00.95-.69l1.286-3.953z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">No favorites yet</h3>
      <p className="text-sm text-gray-600">Tap the star on any post to save it here.</p>
    </div>
  );
}

/* 3. Friends Activity */
function FriendsActivityTab() {
  const friendsActivity = [
    { name: "John Doe", action: "liked your photo", time: "2 hours ago", avatar: "https://i.pravatar.cc/40?img=1" },
    { name: "Sarah Lee", action: "commented on your post", time: "5 hours ago", avatar: "https://i.pravatar.cc/40?img=2" },
    { name: "Mike Chen", action: "started following you", time: "1 day ago", avatar: "https://i.pravatar.cc/40?img=3" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Friends Activity</h3>
      {friendsActivity.map((item, i) => (
        <div key={i} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
          <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-medium text-gray-900">{item.name}</span>{' '}
              <span className="text-gray-600">{item.action}</span>
            </p>
            <p className="text-xs text-gray-500">{item.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/* 4. Groups Activity */
function GroupsActivityTab() {
  const groupsActivity = [
    { group: "Cycling Club", post: "Weekend ride to the hills – join us!", time: "1 day ago", members: 128 },
    { group: "Book Lovers", post: "Discussion: 1984 by George Orwell", time: "2 days ago", members: 89 },
    { group: "Tech Talks", post: "React 19 is coming – what’s new?", time: "3 days ago", members: 312 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Groups Activity</h3>
      {groupsActivity.map((item, i) => (
        <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900">{item.group}</h4>
            <span className="text-xs text-gray-500">{item.time}</span>
          </div>
          <p className="text-sm text-gray-700 mb-1">{item.post}</p>
          <p className="text-xs text-gray-500">{item.members} members active</p>
        </div>
      ))}
    </div>
  );
}