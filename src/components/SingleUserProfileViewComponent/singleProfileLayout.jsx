// src/pages/Profilelayout.jsx
import api from "../../api/axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

// Components
import PostHeader from "../../components/Profilecard/ProfileHeader";
import ProfileStats from "../../components/Profilecard/ProfileStats";
import ProfileTab from "../../components/Profilecard/profileTabs";
import ProfileSection from "../../components/Profilecard/ProfileSection";
import ActivitySection from "../../components/Profilecard/ActivitySection";
import GroupsSection from "../../components/Profilecard/GroupsSection";
import Advertisement from "../../components/Profilecard/Advertisement";
import ForumsSection from "../../components/Profilecard/FormsSection";
import Headers from "../../components/Header";
import { X, UserPlus, Home, Eye } from 'lucide-react';

const SingleUserProfilelayout = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("Activity");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState(null);
  const [error, setError] = useState("");

  // Profile stats
  const [profileStats, setProfileStats] = useState({
    downloadCount: 0,
    shareCount: 0,
  });

  // Follow-related states
  const [isFollowing, setIsFollowing] = useState(false);
  const [checkingFollow, setCheckingFollow] = useState(false);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem("userId");

  // Check if current user is viewing their own profile
  const isOwnProfile = currentUserId === id;

  // Ref to track if modal should be shown
  const shouldShowModal = useRef(true);

  const pageVariants = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -15, scale: 0.98 },
  };

  // 🔥 Fetch profile overview with userId sent inside body
  const fetchProfileOverview = async () => {
    try {
      const res = await api.post(`/api/single/get/profile/overview`, {
        profileUserId: id,
      });

      const data = res.data?.data;
      setUserData(data);

      setProfileStats({
        downloadCount: data.downloadCount || 0,
        shareCount: data.shareCount || 0,
      });
    } catch (err) {
      console.error("Error fetching profile overview:", err);
      setError("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Refresh all data after follow
  const refreshAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchProfileOverview(),
        fetchVisibilitySettings()
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Check Follow Status
  const checkFollowStatus = async () => {
    if (!id || !currentUserId || isOwnProfile) {
      setIsFollowing(true);
      return;
    }

    setCheckingFollow(true);

    try {
      const res = await api.post("/api/check/follow/status", {
        creatorId: id,
      });

      if (res.data.success) {
        setIsFollowing(res.data.isFollowing);

        // If not following, show modal after a delay (1 second)
        if (!res.data.isFollowing && shouldShowModal.current) {
          setTimeout(() => {
            setShowFollowModal(true);
          }, 1000);
        }
      }
    } catch (err) {
      console.error("Error checking follow status:", err);
      setIsFollowing(false);
    } finally {
      setCheckingFollow(false);
    }
  };

  // 🔥 Follow User
  const handleFollowUser = async () => {
    if (!id || !currentUserId || isOwnProfile) return;

    setFollowingLoading(true);

    try {
      const res = await api.post('/api/user/follow/creator', { userId: id });

      if (res.data.success) {
        setIsFollowing(true);

        if (userData) {
          setUserData(prev => ({
            ...prev,
            followerCount: (prev.followerCount || 0) + 1
          }));
        }

        toast.success(`You are now following ${userData?.displayName || userData?.userName}!`);
      }
    } catch (err) {
      console.error("Error following user:", err);
      toast.error("Failed to follow user");
    } finally {
      setFollowingLoading(false);
    }
  };




  // 🔥 Unfollow User
  const handleUnfollowUser = async () => {
    if (!id || !currentUserId || isOwnProfile) return;

    setFollowingLoading(true);

    try {
      const res = await api.post('/api/user/unfollow/creator', {
        userId: id,
      });

      if (res.data.success) {
        setIsFollowing(false);

        // Update follower count
        // Update userData if it has followerCount
        if (userData) {
          setUserData(prev => ({
            ...prev,
            followerCount: Math.max(0, (prev.followerCount || 0) - 1)
          }));
        }

        // Show success toast
        toast.success(`You have unfollowed ${userData?.displayName || userData?.userName || "this user"}`);

        // Refresh data
        refreshAllData();
      }
    } catch (err) {
      console.error("Error unfollowing user:", err);
      toast.error("Failed to unfollow user");
    } finally {
      setFollowingLoading(false);
    }
  };

  // 🔥 Handle modal close (when user cancels/skips)
  const handleModalClose = () => {
    setShowFollowModal(false);
    shouldShowModal.current = false; // Prevent modal from showing again
    // Navigate to home after a small delay
    setTimeout(() => {
      navigate("/home");
    }, 300);
  };

  // 🔥 Handle follow from modal
  const handleFollowFromModal = async () => {
    try {
      // Step 1: instantly unlock UI
      setIsFollowing(true);
      setShowFollowModal(false);
      shouldShowModal.current = false;

      // Step 2: call follow API
      await handleFollowUser();

      // Step 3: refresh quietly after UI unlock
      setTimeout(() => {
        refreshAllData();
      }, 100);

    } catch (error) {
      console.error("Error in follow action:", error);
    }
  };



  const fetchVisibilitySettings = async () => {
    try {
      const res = await api.post(`/api/individual/user/visibility/settings`, {
        userId: id,
      });
      setVisibility(res.data.visibility);
    } catch (err) {
      console.error("Error fetching visibility settings:", err);
    }
  };

  useEffect(() => {
    if (id) {
      // Reset the modal flag when profile ID changes
      shouldShowModal.current = true;
      fetchProfileOverview();
      fetchVisibilitySettings();
      checkFollowStatus();
    }
  }, [id]);


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
            isFollowing={isFollowing}
          />
        );
      case "profile":
        return <ProfileSection
          userData={userData}
          visibility={visibility}
          id={id}
          isFollowing={isFollowing}
        />;
      case "groups":
        return <GroupsSection isFollowing={isFollowing} />;
      case "adverts":
        return <Advertisement isFollowing={isFollowing} />;
      case "forums":
        return <ForumsSection isFollowing={isFollowing} />;
      default:
        return (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            This section is under development.
          </div>
        );
    }
  };

  // Skeleton Loader
  if (loading || !userData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
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

  return (
    <>
      <div>
        <Headers />
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Integrated Follow Modal */}
          <AnimatePresence>
            {showFollowModal && !isOwnProfile && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={handleModalClose}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-xs bg-white rounded-xl shadow-lg border border-gray-200"
                >
                  {/* Close Button */}
                  <button
                    onClick={handleModalClose}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Content */}
                  <div className="p-5">
                    {/* Avatar */}
                    <div className="flex justify-center mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-full border-2 border-white shadow-md overflow-hidden">
                          {userData?.profileAvatar ? (
                            <img
                              src={userData.profileAvatar}
                              alt={userData.displayName || userData.userName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600">
                                {(userData?.displayName || userData?.userName)?.[0]?.toUpperCase() || 'U'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                          <Eye className="w-3 h-3 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Text */}
                    <h3 className="text-center font-semibold text-gray-900 mb-1">
                      Unlock {(userData?.displayName || userData?.userName)?.split(' ')[0] || "User"}'s Profile
                    </h3>
                    <p className="text-center text-sm text-gray-500 mb-5">
                      Follow to view their posts, activity, and connect with them
                    </p>

                    {/* Follow Button - User stays on page */}
                    <button
                      onClick={handleFollowFromModal}
                      disabled={followingLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-3 shadow-sm hover:shadow"
                    >
                      {followingLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Following...</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow & View Profile</span>
                        </>
                      )}
                    </button>

                    {/* Go to Home Button */}
                    <button
                      onClick={handleModalClose}
                      className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      <span>Go to Home Instead</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <PostHeader
            id={id}
            coverImage={userData.coverPhoto}
            profileImage={userData.profileAvatar}
            userName={userData.displayName || userData.userName}
            // Pass follow-related props to ProfileHeader
            isFollowing={isFollowing}
            checkingFollow={checkingFollow}
            onFollow={handleFollowUser}
            onUnfollow={handleUnfollowUser}
            followingLoading={followingLoading}
            isOwnProfile={isOwnProfile}
          />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
            <div className="lg:col-span-1 space-y-8">
              <ProfileStats
                downloadCount={profileStats.downloadCount}
                shareCount={profileStats.shareCount}
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
    </>
  );
};

export default SingleUserProfilelayout;
