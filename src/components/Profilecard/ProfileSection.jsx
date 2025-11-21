// src/components/Profile/PostSection.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { useUserProfile } from "../../hook/userProfile";
import {
  updateProfileDetails,
  updateProfileAvatar,
  updateCoverPhoto,
} from "../../Service/profileService";

import ProfilePage from "./ProfileSectionComponents/profilePage";
import ChangeProfilePhoto from "./ProfileSectionComponents/changeProfilePhoto";
import ChangeCoverImage from "./ProfileSectionComponents/changeCoverPhoto";
import ProfileSettings from "./ProfileSectionComponents/profileSettings";
import { useAuth } from "../../context/AuthContext";

export default function PostSection({ id }) {
  const [activeOption, setActiveOption] = useState("profilePage");
  const { token } = useAuth();

  // Load user profile
  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useUserProfile(token, id);

  // Mutations
  const updateProfileMutation = useMutation({
    mutationFn: (formData) => updateProfileDetails(formData, token),
    onSuccess: () => {
      toast.success("✅ Profile updated successfully!");
      refetchUser();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "❌ Update failed");
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: (file) => updateProfileAvatar(file, token),
    onSuccess: () => {
      toast.success("✅ Profile photo updated!");
      refetchUser();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "❌ Profile upload failed");
    },
  });

  const updateCoverMutation = useMutation({
    mutationFn: (file) => updateCoverPhoto(file, token),
    onSuccess: () => {
      toast.success("✅ Cover photo updated!");
      refetchUser();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "❌ Cover upload failed");
    },
  });

  const uploadProfileDetail = async (formData) => {
    await updateProfileMutation.mutateAsync(formData);
  };

  // -----------------------------------------------------
  // 🔥 HIDE TABS when id exists (viewing another user)
  // -----------------------------------------------------
  const options = id
    ? [
        // Only show ProfilePage for other users
        { id: "profilePage", label: "Profile View" },
      ]
    : [
        // Full options for own profile
        { id: "profilePage", label: "Profile View" },
        { id: "profile-photo", label: "Change Profile Photo" },
        { id: "cover-image", label: "Change Cover Image" },
        { id: "settings", label: "Settings" },
      ];

  // -----------------------------------------------------

  const renderContent = () => {
    switch (activeOption) {
      case "profilePage":
        return <ProfilePage id={id} />;

      case "profile-photo":
        return (
          <ChangeProfilePhoto
            user={user}
            uploadProfileImage={(file) => updateAvatarMutation.mutate(file)}
          />
        );

      case "cover-image":
        return (
          <ChangeCoverImage
            user={user}
            uploadCoverImage={(file) => updateCoverMutation.mutate(file)}
          />
        );

      case "settings":
        return <ProfileSettings user={user} id={id} />;

      default:
        return <ProfilePage id={id} />;
    }
  };

  if (isLoading) return <p className="text-gray-500 p-4">Loading profile...</p>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Mobile Tabs */}
      <div className="sm:hidden border-b border-gray-200">
        <div className="flex overflow-x-auto px-4 py-2 hide-scrollbar">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveOption(opt.id)}
              className={`flex-shrink-0 px-4 py-3 mx-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeOption === opt.id
                  ? "bg-blue-50 text-blue-600 border border-blue-200"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:block border-b border-gray-200">
        <div className="flex px-6">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveOption(opt.id)}
              className={`relative px-4 py-4 text-sm font-medium transition-all duration-200 ${
                activeOption === opt.id
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {opt.label}
              {activeOption === opt.id && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-600 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeOption}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hide Scrollbar CSS */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
