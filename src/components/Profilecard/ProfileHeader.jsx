// src/components/Profile/PostHeader.jsx
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
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import api from "../../api/axios";

export default function ProfileHeader({ activeTab, setActiveTab }) {
  const { user, fetchUserProfile, loading } = useAuth();

  // 🔹 Initialize local states with user data when available
  const [bannerUrl, setBannerUrl] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setBannerUrl(
        user.coverPhoto ||
          "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200"
      );
      setProfileUrl(
        user.profileAvatar ||
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
      );
    }
  }, [user]);

  // 🔹 Handle Cover Photo Upload
  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setBannerUrl(previewUrl);

    const formData = new FormData();
    formData.append("coverPhoto", file);

    try {
      const res = await api.post("/api/user/profile/cover/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Cover photo updated!");
      await fetchUserProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cover upload failed");
      console.error(err);
    }
  };

  // 🔹 Handle Profile Avatar Upload
  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfileUrl(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/api/user/profile/detail/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile photo updated!");
      await fetchUserProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile upload failed");
      console.error(err);
    }
  };

  if (loading) return <p className="text-gray-500 p-4">Loading profile...</p>;

  // 🔹 Tabs
  const tabs = [
    { id: "Activity", Icon: MessageSquare, label: "Activity" },
    { id: "profile", Icon: User, label: "Profile" },
    { id: "friends", Icon: Users, label: "Followers" },
    { id: "groups", Icon: Users, label: "Groups" },
    { id: "adverts", Icon: Megaphone, label: "Adverts" },
    { id: "forums", Icon: MessageCircle, label: "Forums" },
    { id: "jobs", Icon: Briefcase, label: "Jobs" },
    { id: "more", Icon: MoreHorizontal, label: "More" },
  ];

  return (
    <div className="w-full bg-white overflow-hidden rounded-b-2xl shadow">
      {/* COVER BANNER */}
      <motion.div
        className="relative h-56 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${bannerUrl})` }}
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute left-0 top-0 w-48 h-48 rounded-full bg-gradient-to-br from-purple-700 to-indigo-800 -translate-x-16 -translate-y-8 blur-2xl opacity-50" />
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

        {/* Edit Cover Button */}
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

      {/* PROFILE SECTION */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end gap-6 -mt-16 pb-6">
            {/* Avatar with Animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <img
                src={profileUrl}
                alt={user?.displayName || "User"}
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
                {user?.displayName || "User"}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium text-gray-800">
                  @{user?.userName || "username"}
                </span>
                <span className="mx-1.5 text-gray-400">•</span>
                <span>Active {user?.lastActive || "just now"}</span>
              </p>
            </motion.div>

            {/* Tabs */}
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
                    onClick={() => setActiveTab(tab.id)}
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
