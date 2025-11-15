// ✅ src/pages/Profilelayout.jsx
import api from "../api/axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

// Components
import PostHeader from "../components/SingleUserProfileViewComponent/ProfileHeader";
import ProfileStats from "../components/SingleUserProfileViewComponent/ProfileStats";
import PhotoGallery from "../components/SingleUserProfileViewComponent/PhotoGallery";
import ProfileSection from "../components/SingleUserProfileViewComponent/ProfileSection";
import FriendsSection from "../components/SingleUserProfileViewComponent/followersFollowingSection";
import GroupsSection from "../components/SingleUserProfileViewComponent/GroupsSection";
import Jobsection from "../components/SingleUserProfileViewComponent/Jobsection";

const SingleUserProfilelayout = () => {
  const { username } = useParams(); // ✅ Extract username from URL (e.g., /profile/:username)
  const [activeTab, setActiveTab] = useState("personal");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔹 Animation Variants
  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.98 },
  };
console.log(username)
  // 🔹 Fetch profile by username
  useEffect(() => {
    const fetchProfileByUsername = async () => {
      if (!username) {
        setError("Invalid profile link.");
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/api/get/individual/profile/detail/${username}`);
        setUserData(res.data?.data || null);
      } catch (err) {
        console.error("❌ Error fetching profile by username:", err);
        setError("Profile not found or failed to load.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileByUsername();
  }, [username]);
console.log(userData)
  const photos = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300",
    "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=300",
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=300",
    "https://images.unsplash.com/photo-1542909168-82c3e7fdca44?w=300",
  ];

  // 🔹 Render active tab content
  const renderActiveSection = () => {
    if (!userData) return null;

    switch (activeTab) {
      case "profile":
        return <ProfileSection userData={userData} />;
      case "friends":
        return <FriendsSection userData={userData} />;
      case "groups":
        return <GroupsSection />;
      case "forums":
        return <ForumsSection />;
      case "jobs":
        return <Jobsection />;
      default:
        return (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            This section is under development.
          </div>
        );
    }
  };

  // 🔹 Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-lg">
        {error}
      </div>
    );
  }

  // 🔹 Skeleton Loader (Loading state)
  if (loading || !userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="h-52 bg-gray-200 rounded-xl mb-6 relative overflow-hidden">
          <div className="absolute -bottom-10 left-6 w-24 h-24 bg-gray-300 rounded-full border-4 border-white"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-6 mb-6">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-5 w-24 bg-gray-200 rounded-md"></div>
            ))}
        </div>

        {/* Grid Layout Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            <div className="h-40 bg-gray-200 rounded-xl"></div>
            <div className="h-60 bg-gray-200 rounded-xl"></div>
          </div>

          {/* Center Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>

          {/* Right Sidebar */}
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // 🔹 Main Render after data load
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <PostHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userData={userData}
      />

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <ProfileStats
            followersCount={userData.followerCount || 0}
            followingCount={userData.followingCount || 0}
            totalPost={userData.postCount || 0}
          />
          <PhotoGallery feeds={userData?.feeds} />
        </div>

        {/* Center Section with Animation */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SingleUserProfilelayout;
