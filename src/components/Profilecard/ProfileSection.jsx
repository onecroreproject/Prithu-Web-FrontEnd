// src/components/Profile/PostSection.jsx
import React, { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../api/axios";
import toast from "react-hot-toast";

// Subcomponents
import ViewProfile from "./ProfileSectionComponents/viewProfile";
import EditProfile from "./ProfileSectionComponents/editProfile";
import ChangeProfilePhoto from "./ProfileSectionComponents/changeProfilePhoto";
import ChangeCoverImage from "./ProfileSectionComponents/changeCoverPhoto";
import ProfileSettings from "./ProfileSectionComponents/profileSettings";

export default function PostSection() {
  const [activeOption, setActiveOption] = useState("view");
  const { user, fetchUserProfile, loading } = useAuth();

  // Unified upload function
  const uploadProfileDetail = async (formData) => {
    try {
      await api.post("/api/user/profile/detail/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Updated successfully!");
      await fetchUserProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      throw err;
    }
  };

  const options = [
    { id: "view", label: "View" },
    { id: "edit", label: "Edit" },
    { id: "profile-photo", label: "Change Profile Photo" },
    { id: "cover-image", label: "Change Cover Image" },
    { id: "settings", label: "Settings" },
  ];

  const renderContent = () => {
    switch (activeOption) {
      case "view":
        return <ViewProfile user={user} />;
      case "edit":
        return (
          <EditProfile
            user={user}
            uploadProfileDetail={uploadProfileDetail}
            loading={loading}
          />
        );
      case "profile-photo":
        return <ChangeProfilePhoto user={user} uploadProfileDetail={uploadProfileDetail} />;
      case "cover-image":
        return <ChangeCoverImage user={user} uploadProfileDetail={uploadProfileDetail} />;
      case "settings":
        return <ProfileSettings user={user} fetchUserProfile={fetchUserProfile} />;
      default:
        return <ViewProfile user={user} />;
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex gap-6 mb-8 border-b border-gray-200">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveOption(opt.id)}
            className={`pb-3 text-sm font-medium border-b-2 transition-all duration-200 ${
              activeOption === opt.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="mt-6">{renderContent()}</div>
    </div>
  );
}
