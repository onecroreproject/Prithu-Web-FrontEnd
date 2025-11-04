// ✅ src/components/Profile/EditProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios"; // ✅ make sure this path is correct
import { toast } from "react-hot-toast";

export default function EditProfile() {
  const { user, fetchUserProfile, loading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
    city: user?.city || "",
    country: user?.country || "",
    bio: user?.bio || "",
    phoneNumber: user?.phoneNumber || "",
    whatsappNumber: user?.whatsappNumber || "",
    maritalStatus: user?.maritalStatus || "Single",
    language: user?.language || "English",
    socialLinks: {
      facebook: user?.socialLinks?.facebook || "",
      instagram: user?.socialLinks?.instagram || "",
      twitter: user?.socialLinks?.twitter || "",
      linkedin: user?.socialLinks?.linkedin || "",
      github: user?.socialLinks?.github || "",
      youtube: user?.socialLinks?.youtube || "",
      website: user?.socialLinks?.website || "",
    },
  });

  const initialDataRef = useRef(JSON.stringify(formData));

  // 🔄 Re-sync form when user changes
  useEffect(() => {
    if (!user) return;
    const updated = {
      displayName: user?.displayName || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
      city: user?.city || "",
      country: user?.country || "",
      bio: user?.bio || "",
      phoneNumber: user?.phoneNumber || "",
      whatsappNumber: user?.whatsappNumber || "",
      maritalStatus: user?.maritalStatus || "Single",
      language: user?.language || "English",
      socialLinks: {
        facebook: user?.socialLinks?.facebook || "",
        instagram: user?.socialLinks?.instagram || "",
        twitter: user?.socialLinks?.twitter || "",
        linkedin: user?.socialLinks?.linkedin || "",
        github: user?.socialLinks?.github || "",
        youtube: user?.socialLinks?.youtube || "",
        website: user?.socialLinks?.website || "",
      },
    };
    setFormData(updated);
    initialDataRef.current = JSON.stringify(updated);
  }, [user]);

  // 🧩 Detect unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(formData) !== initialDataRef.current);
  }, [formData]);

  // ⚠️ Warn before tab close
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditing && hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, hasUnsavedChanges]);

  // ⚠️ Warn when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && isEditing && hasUnsavedChanges) {
        setShowLeavePopup(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isEditing, hasUnsavedChanges]);

  // 🧾 Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const uploadProfileDetail = async (data) => {
    try {
      await api.post("/api/user/profile/detail/update", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully!");
      await fetchUserProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
      throw err;
    }
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    const payload = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "socialLinks") {
        payload.append("socialLinks", JSON.stringify(value));
      } else if (value != null) {
        payload.append(
          key,
          value instanceof Date ? value.toISOString().split("T")[0] : value
        );
      }
    });

    await uploadProfileDetail(payload);
    setIsEditing(false);
    initialDataRef.current = JSON.stringify(formData);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    setFormData(JSON.parse(initialDataRef.current));
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="relative">
      <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEditing ? "Edit Profile" : "Profile Details"}
          </h2>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Edit
            </button>
          )}
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border border-gray-300 rounded-lg ${
                !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border border-gray-300 rounded-lg ${
                !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              value={formData.whatsappNumber}
              onChange={(e) => handleChange("whatsappNumber", e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border border-gray-300 rounded-lg ${
                !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {/* 🌍 Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border border-gray-300 rounded-lg ${
                !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => handleChange("country", e.target.value)}
              disabled={!isEditing}
              className={`w-full p-3 border border-gray-300 rounded-lg ${
                !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
          <DatePicker
            selected={formData.dateOfBirth}
            onChange={(date) => handleChange("dateOfBirth", date)}
            dateFormat="dd/MM/yyyy"
            maxDate={new Date()}
            showYearDropdown
            disabled={!isEditing}
            className={`w-full p-3 border border-gray-300 rounded-lg ${
              !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleChange("bio", e.target.value)}
            rows={3}
            disabled={!isEditing}
            className={`w-full p-3 border border-gray-300 rounded-lg ${
              !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          />
        </div>

        {/* Marital Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
          <select
            value={formData.maritalStatus}
            onChange={(e) => handleChange("maritalStatus", e.target.value)}
            disabled={!isEditing}
            className={`w-full p-3 border border-gray-300 rounded-lg ${
              !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            <option>Single</option>
            <option>Married</option>
            <option>Divorced</option>
            <option>Widowed</option>
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select
            value={formData.language}
            onChange={(e) => handleChange("language", e.target.value)}
            disabled={!isEditing}
            className={`w-full p-3 border border-gray-300 rounded-lg ${
              !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
          >
            <option>English</option>
            <option>Tamil</option>
            <option>Hindi</option>
            <option>Malayalam</option>
            <option>Telugu</option>
          </select>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData.socialLinks).map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                  {platform}
                </label>
                <input
                  type="url"
                  value={formData.socialLinks[platform]}
                  onChange={(e) => handleSocialChange(platform, e.target.value)}
                  disabled={!isEditing}
                  placeholder={`Enter ${platform} link`}
                  className={`w-full p-3 border border-gray-300 rounded-lg ${
                    !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Save & Cancel */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2.5 font-medium rounded-lg transition ${
                loading
                  ? "bg-gray-400"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {loading ? "Saving…" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>
          </div>
        )}
      </form>

      {/* Unsaved Changes Popup */}
      {showLeavePopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Unsaved Changes
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              You have unsaved changes. Do you want to save before leaving?
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={(e) => {
                  setShowLeavePopup(false);
                  handleSave(e);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setShowLeavePopup(false);
                  setIsEditing(false);
                  setHasUnsavedChanges(false);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Leave Without Saving
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
