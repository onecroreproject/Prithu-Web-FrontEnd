import api from "../api/axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";

// Components
import PostHeader from "../components/Profilecard/ProfileHeader";
import ProfileStats from "../components/Profilecard/ProfileStats";
import ProfileTab from "../components/Profilecard/profileTabs";
import ProfileSection from "../components/Profilecard/ProfileSection";
import ActivitySection from "../components/Profilecard/ActivitySection";
import FavoriteFeedSection from "../components/Profilecard/FavoriteFeedSection";

const Profilelayout = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStats, setProfileStats] = useState({
    downloadCount: 0,
    shareCount: 0
  });

  // 🔹 Fetch user profile overview data
  const fetchProfileOverview = async () => {
    try {
      const res = await api.get(`/api/get/profile/overview`);
      const userData = res.data?.data;
      setUserData(userData);

      setProfileStats({
        downloadCount: userData.downloadCount || 0,
        shareCount: userData.shareCount || 0
      });
    } catch (err) {
      console.error("Error fetching profile overview:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileOverview();
  }, []);


  // 🔹 Animation Variants
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  // 🔹 Render active tab content
  const renderActiveSection = () => {
    if (!userData) return null;

    console.log("Profilelayout rendering section:", activeTab);
    switch (activeTab) {
      case "activity":
        return (
          <ActivitySection
            userAvatar={userData.profileAvatar}
            userName={userData.displayName || userData.userName}
            activities={userData.activities || []}
          />
        );
      case "profile":
        return <ProfileSection userData={userData} />;
      case "favorite":
        return <FavoriteFeedSection onBack={() => setActiveTab("activity")} />;
      default:
        return (
          <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg">
            This section is under development.
          </div>
        );
    }
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // 🔹 Skeleton Loader
  if (loading || !userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-4 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-xl mb-4 relative">
          <div className="absolute -bottom-8 left-6 w-20 h-20 bg-gray-300 rounded-full border-4 border-white"></div>
        </div>

        <div className="flex gap-4 mb-4">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="h-4 w-20 bg-gray-200 rounded-md"></div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-48 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="lg:col-span-2">
            <div className="h-80 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // 🔹 Main Render
  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-4 py-4">
      <PostHeader
        coverImage={userData.coverPhoto}
        profileImage={userData.profileAvatar}
        userName={userData.displayName || userData.userName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
        <div className="lg:col-span-1 space-y-4">
          <ProfileStats
            downloadCount={profileStats.downloadCount}
            shareCount={profileStats.shareCount}
            activeTab={activeTab}
          />
          <ProfileTab
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {renderActiveSection()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Profilelayout;
