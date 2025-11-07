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

export default function PostSection() {
  const [activeOption, setActiveOption] = useState("profilePage");
  const { token } = useAuth();

  // ✅ React Query Hook for user data
  const {
    data: user,
    isLoading,
    refetch: refetchUser,
  } = useUserProfile(token);

  // ✅ Mutations for updating profile info
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

  // ✅ Unified upload function (for general profile info)
  const uploadProfileDetail = async (formData) => {
    await updateProfileMutation.mutateAsync(formData);
  };

  // ✅ Render components based on active option
  const renderContent = () => {
    switch (activeOption) {
      case "profilePage":
        return (
          <ProfilePage/>
        );

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
        return <ProfileSettings user={user} />;

      default:
        return <ProfilePage user={user} />;
    }
  };

  if (isLoading)
    return <p className="text-gray-500 p-4">Loading profile...</p>;

  const options = [
    { id: "profilePage", label: "Profile View" },
    { id: "profile-photo", label: "Change Profile Photo" },
    { id: "cover-image", label: "Change Cover Image" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Navigation Tabs */}
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveOption(opt.id)}
            className={`relative pb-3 text-sm font-medium transition-all duration-200 ${
              activeOption === opt.id
                ? "text-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {opt.label}
            {activeOption === opt.id && (
              <motion.div
                layoutId="underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-600 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Smoothly Resizing Content */}
      <div className="mt-6">
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
    </div>
  );
}
