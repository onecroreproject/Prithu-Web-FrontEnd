import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  User,
  Users,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Camera,
  Briefcase,
  FolderGit2, // 🆕 Portfolio icon
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useUserProfile } from "../../hook/userProfile";
import {
  updateCoverPhoto,
  updateProfileAvatar,
} from "../../Service/profileService";

// ✅ Default images (fallback)
const defaultBanner =
  "https://res.cloudinary.com/demo/image/upload/v1720000000/default-cover.jpg";
const defaultAvatar =
  "https://res.cloudinary.com/demo/image/upload/v1720000000/default-avatar.jpg";

export default function ProfileHeader({ activeTab, setActiveTab }) {
  const { token ,userId} = useAuth();
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useUserProfile(token);

  const [bannerUrl, setBannerUrl] = useState(defaultBanner);
  const [profileUrl, setProfileUrl] = useState(defaultAvatar);
  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // ✅ Get user ID from localStorage
  const id = localStorage.getItem("userId");
  

  // ✅ Sync user data to local preview states
  useEffect(() => {
    if (user) {
      setBannerUrl(user.coverPhoto || defaultBanner);
      setProfileUrl(user.profileAvatar || defaultAvatar);
    }
  }, [user]);

  // ✅ Cover Photo Upload
  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setBannerUrl(previewUrl);

    try {
      await updateCoverPhoto(file, token);
      toast.success("✅ Cover photo updated successfully!");
      refetch();
    } catch (err) {
      console.error("❌ Cover upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload cover photo");
    }
  };

  // ✅ Profile Photo Upload
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileUrl(previewUrl);

    try {
      await updateProfileAvatar(file, token);
      toast.success("✅ Profile photo updated successfully!");
      refetch();
    } catch (err) {
      console.error("❌ Profile upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload profile photo");
    }
  };

  if (isLoading)
    return <p className="text-gray-500 p-4">Loading profile...</p>;

  // 🧭 Tabs (includes Portfolio)
  const tabs = [
    { id: "Activity", Icon: MessageSquare, label: "Activity" },
    { id: "profile", Icon: User, label: "Profile" },
    { id: "friends", Icon: Users, label: "Followers" },
    { id: "groups", Icon: Users, label: "Groups" },
    { id: "adverts", Icon: Megaphone, label: "Adverts" },
    { id: "forums", Icon: MessageCircle, label: "Forums" },
    { id: "jobs", Icon: Briefcase, label: "Jobs" },
    { id: "portfolio", Icon: FolderGit2, label: "Portfolio" },
    { id: "more", Icon: MoreHorizontal, label: "More" },
  ];

  // ✅ Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab.id);

    // 🧭 Navigate to portfolio if clicked
    if (tab.id === "portfolio" && id) {
      navigate(`/portfolio/${id}`);
    } else if (tab.id === "portfolio" && !id) {
      toast.error("⚠️ User ID not found in localStorage!");
    }
  };

  return (
    <div className="w-full bg-white overflow-hidden rounded-b-2xl shadow">
      {/* 🖼 COVER BANNER */}
      <motion.div
        className="relative h-56 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${bannerUrl})` }}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-7xl font-black tracking-wider text-white opacity-90 select-none"
          >
            PROFILE
          </motion.h1>
        </div>

        {/* ✏️ Edit Cover Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => bannerInputRef.current?.click()}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2.5 rounded-lg transition-all"
        >
          <Edit className="w-5 h-5 text-gray-900" />
        </motion.button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
      </motion.div>

      {/* 👤 PROFILE SECTION */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end gap-6 -mt-16 pb-6">
            {/* Avatar */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <img
                src={profileUrl}
                alt={user?.userName || "User"}
                className="w-36 h-36 rounded-xl border-4 border-white object-cover shadow-lg bg-white"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => profileInputRef.current?.click()}
                className="absolute bottom-2 right-2 bg-white hover:bg-gray-100 p-1.5 rounded-lg shadow-md transition-all"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </motion.button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileChange}
              />
            </motion.div>

            {/* User Info */}
            <motion.div
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col justify-end"
            >
              <h2 className="text-lg font-bold text-gray-900">
                {user?.name || user?.userName || "User"}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium text-gray-800">
                  @{user?.userName || "username"}
                </span>
                <span className="mx-1.5 text-gray-400">•</span>
                <span>Active {user?.lastActive || "just now"}</span>
              </p>
            </motion.div>

            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-4"
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.Icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => handleTabClick(tab)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center gap-1.5 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? "bg-purple-600 text-white"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
