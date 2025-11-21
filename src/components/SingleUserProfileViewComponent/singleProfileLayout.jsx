// src/pages/Profilelayout.jsx
import api from "../../api/axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";   

// Components
import PostHeader from "../../components/Profilecard/ProfileHeader";
import ProfileStats from "../../components/Profilecard/ProfileStats";
import ProfileTab from "../../components/Profilecard/profileTabs";
import ProfileSection from "../../components/Profilecard/ProfileSection";
import ActivitySection from "../../components/Profilecard/ActivitySection";
import FriendsSection from "../../components/Profilecard/followersFollowingSection";
import GroupsSection from "../../components/Profilecard/GroupsSection";
import Advertisement from "../../components/Profilecard/Advertisement";
import ForumsSection from "../../components/Profilecard/FormsSection";
import Jobsection from "../../components/Jobs/Jobsection";
import Headers from "../../components/Header";

const SingleUserProfilelayout = () => {
  const { id } = useParams(); // 🔥 get userId from params

  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileStats, setProfileStats] = useState({
    followersCount: 0,
    followingCount: 0,
    totalPost: 0,
  });

  console.log("Profile User ID:", id);

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.98 },
  };

  // 🔥 Fetch profile overview with userId sent inside body
  const fetchProfileOverview = async () => {
    try {
      const res = await api.post(`/api/single/get/profile/overview`, {
        profileUserId: id, // 🔥 IMPORTANT
      });

      const data = res.data?.data;
      setUserData(data);

      setProfileStats({
        followersCount: data.followerCount || 0,
        followingCount: data.followingCount || 0,
        totalPost: data.postCount || 0,
      });
    } catch (err) {
      console.error("Error fetching profile overview:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProfileOverview();
  }, [id]);

  const handleFollowDataUpdate = (newCounts) => {
    setProfileStats((prev) => ({
      ...prev,
      followersCount: newCounts.followersCount,
      followingCount: newCounts.followingCount,
    }));

    setUserData((prev) =>
      prev
        ? {
            ...prev,
            followerCount: newCounts.followersCount,
            followingCount: newCounts.followingCount,
          }
        : null
    );
  };

  const renderActiveSection = () => {
    if (!userData) return null;

    switch (activeTab) {
      case "Activity":
        return (
          <ActivitySection
            userAvatar={userData.profileAvatar}
            userName={userData.displayName || userData.userName}
            activities={userData.activities || []}
            id={id}
          />
        );
      case "profile":
        return <ProfileSection userData={userData} id={id}/>;
      case "friends":
        return <FriendsSection onFollowDataUpdate={handleFollowDataUpdate} id={id} />;
      case "groups":
        return <GroupsSection />;
      case "adverts":
        return <Advertisement />;
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

  // Skeleton...
  if (loading || !userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
        {/* Skeleton UI */}
      </div>
    );
  }

  return (<><div>
    <Headers/>
    <div className="max-w-7xl mx-auto px-4 py-6">
      <PostHeader
        id={id}
        coverImage={userData.coverPhoto}
        profileImage={userData.profileAvatar}
        userName={userData.displayName || userData.userName}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <div className="lg:col-span-1 space-y-8">
          <ProfileStats
            followersCount={profileStats.followersCount}
            followingCount={profileStats.followingCount}
            totalPost={profileStats.totalPost}
          />

          <ProfileTab id={id} activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="lg:col-span-3 space-y-6">
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
    </div>
  </>);
};

export default SingleUserProfilelayout;
