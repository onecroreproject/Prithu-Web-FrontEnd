// ✅ src/components/Profile/EditProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useUserProfile } from "../../../hook/userProfile";
import { updateProfileDetails } from "../../../Service/userService";
import { useAuth } from "../../../context/AuthContext";

export default function EditProfile() {
  const { token } = useAuth();
  const { data: user, isLoading: profileLoading, refetch } = useUserProfile(token);

  const [isEditing, setIsEditing] = useState(false);
  const [showLeavePopup, setShowLeavePopup] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    displayName: "",
    dateOfBirth: null,
    city: "",
    country: "",
    bio: "",
    phoneNumber: "",
    whatsappNumber: "",
    maritalStatus: "Single",
    language: "English",
    socialLinks: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      github: "",
      youtube: "",
      website: "",
    },
  });

  const initialDataRef = useRef(JSON.stringify(formData));

  // 🧩 Prefill user data
  useEffect(() => {
    if (!user) return;
    const updated = {
      displayName: user.displayName || "",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      city: user.city || "",
      country: user.country || "",
      bio: user.bio || "",
      phoneNumber: user.phoneNumber || "",
      whatsappNumber: user.whatsappNumber || "",
      maritalStatus: user.maritalStatus || "Single",
      language: user.language || "English",
      socialLinks: {
        facebook: user.socialLinks?.facebook || "",
        instagram: user.socialLinks?.instagram || "",
        twitter: user.socialLinks?.twitter || "",
        linkedin: user.socialLinks?.linkedin || "",
        github: user.socialLinks?.github || "",
        youtube: user.socialLinks?.youtube || "",
        website: user.socialLinks?.website || "",
      },
    };
    setFormData(updated);
    initialDataRef.current = JSON.stringify(updated);
  }, [user]);

  // 🧠 Detect unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(formData) !== initialDataRef.current);
  }, [formData]);

  // ⚠️ Warn on tab close
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

  // 🧠 Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  // ✅ React Query Mutation
  const mutation = useMutation({
    mutationFn: (payload) => updateProfileDetails(payload, token),
    onSuccess: async () => {
      toast.success("✅ Profile updated successfully!");
      await refetch(); // refresh user profile
      setIsEditing(false);
      initialDataRef.current = JSON.stringify(formData);
      setHasUnsavedChanges(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "❌ Failed to update profile");
    },
  });

  // ✅ Save Profile
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

    mutation.mutate(payload);
  };

  const handleCancel = () => {
    setFormData(JSON.parse(initialDataRef.current));
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  // 🧭 Loading state
  if (profileLoading) return <p className="text-gray-500 p-4">Loading profile...</p>;

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
          <InputField
            label="Name"
            value={formData.displayName}
            onChange={(v) => handleChange("displayName", v)}
            disabled={!isEditing}
          />
          <InputField
            label="Phone"
            value={formData.phoneNumber}
            onChange={(v) => handleChange("phoneNumber", v)}
            disabled={!isEditing}
          />
          <InputField
            label="WhatsApp Number"
            value={formData.whatsappNumber}
            onChange={(v) => handleChange("whatsappNumber", v)}
            disabled={!isEditing}
          />
        </div>

        {/* 🌍 Location */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="City"
            value={formData.city}
            onChange={(v) => handleChange("city", v)}
            disabled={!isEditing}
          />
          <InputField
            label="Country"
            value={formData.country}
            onChange={(v) => handleChange("country", v)}
            disabled={!isEditing}
          />
        </div>

        {/* DOB */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth
          </label>
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
        <TextArea
          label="Bio"
          value={formData.bio}
          onChange={(v) => handleChange("bio", v)}
          disabled={!isEditing}
        />

        {/* Marital Status */}
        <SelectField
          label="Marital Status"
          options={["Single", "Married", "Divorced", "Widowed"]}
          value={formData.maritalStatus}
          onChange={(v) => handleChange("maritalStatus", v)}
          disabled={!isEditing}
        />

        {/* Language */}
        <SelectField
          label="Language"
          options={["English", "Tamil", "Hindi", "Malayalam", "Telugu"]}
          value={formData.language}
          onChange={(v) => handleChange("language", v)}
          disabled={!isEditing}
        />

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(formData.socialLinks).map((platform) => (
              <InputField
                key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                value={formData.socialLinks[platform]}
                onChange={(v) => handleSocialChange(platform, v)}
                disabled={!isEditing}
              />
            ))}
          </div>
        </div>

        {/* Save & Cancel */}
        {isEditing && (
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={mutation.isLoading}
              className={`px-6 py-2.5 font-medium rounded-lg transition ${
                mutation.isLoading
                  ? "bg-gray-400"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {mutation.isLoading ? "Saving…" : "Save Changes"}
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

/* ✅ Reusable Input Components */
function InputField({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

function TextArea({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

function SelectField({ label, options, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
