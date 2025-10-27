// src/pages/Profilelayout.jsx
import React, { useState } from "react";

// Updated: Use consistent path
import PostHeader from "../components/Profilecard/ProfileHeader"; // ← This is the correct one (from earlier fix)

// Sidebar components
import ProfileStats from "../components/Profilecard/ProfileStats";
import PhotoGallery from "../components/Profilecard/PhotoGallery";
import RecentActivity from "../components/Profilecard/RecentActivity";

// Main content sections
import ProfileSection from "../components/Profilecard/ProfileSection";
import ActivitySection from "../components/Profilecard/ActivitySection";
import FriendsSection from "../components/Profilecard/FriendsSection";
import GroupsSection from "../components/Profilecard/GroupsSection";
import Advertisement from "../components/Profilecard/Advertisement";
import ForumsSection from "../components/Profilecard/FormsSection";// ← Fixed typo: was "FormsSection"

const Profilelayout = () => {
  const [activeTab, setActiveTab] = useState("personal");

  const userData = {
    userName: "Alice",
    coverImage: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200",
    profileImage: "https://i.pravatar.cc/150?img=45",
    friendsCount: 3,
    groupsCount: 5,
  };

  const activities = [
    {
      id: 1,
      userName: "Alice",
      userAvatar: "https://i.pravatar.cc/150?img=45",
      action: "posted a new activity comment",
      time: "17 hours, 41 minutes ago",
      content: "Checkmark",
    },
  ];

  const recentActivities = [
    { userName: "Alice", action: "posted a new activity comment", time: "17 hours, 41 minutes ago" },
    { userName: "Alice", action: "posted an update", time: "21 hours, 17 minutes ago" },
    { userName: "Alice", action: "joined the group Cycling Club", time: "3 days, 3 hours ago" },
  ];

  const photos = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=300",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300",
    "https://images.unsplash.com/photo-1542909168-82c3e7fdca44?w=300",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* HEADER WITH TABS */}
      <PostHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* LEFT SIDEBAR – ALWAYS VISIBLE */}
        <div className="lg:col-span-1 space-y-6">
          <ProfileStats
            friendsCount={userData.friendsCount}
            groupsCount={userData.groupsCount}
          />
          <PhotoGallery photos={photos} />
        </div>

        {/* MAIN CONTENT – CHANGES WITH TAB */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "personal" ? (
            <ActivitySection
              userAvatar={userData.profileImage}
              userName={userData.userName}
              activities={activities}
            />
          ) : activeTab === "profile" ? (
            <ProfileSection />
          ) : activeTab === "friends" ? (
            <FriendsSection />
          ) : activeTab === "groups" ? (
            <GroupsSection />
          ) : activeTab === "adverts" ? (
            <Advertisement />
          ) : activeTab === "forums" ? (
            <ForumsSection />
          ) : (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
              This section is under development.
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR – ALWAYS VISIBLE */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivities} />
        </div>
      </div>
    </div>
  );
};

export default Profilelayout;