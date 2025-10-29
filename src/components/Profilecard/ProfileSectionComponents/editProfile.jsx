// src/components/Profile/EditProfile.jsx
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function EditProfile({ user, uploadProfileDetail, loading }) {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
    city: user?.city || "",
    country: user?.country || "",
    bio: user?.bio || "",
    phoneNumber: user?.phoneNumber || "",
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

  // 🔄 Sync data when user changes
  useEffect(() => {
    setFormData({
      displayName: user?.displayName || "",
      dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth) : null,
      city: user?.city || "",
      country: user?.country || "",
      bio: user?.bio || "",
      phoneNumber: user?.phoneNumber || "",
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
  }, [user]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = new FormData();

    // Append normal fields
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
  };

  return (
    <form className="space-y-6 max-w-2xl" onSubmit={handleSave}>
      {/* 🧾 Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleChange("displayName", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
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
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            value={formData.country}
            onChange={(e) => handleChange("country", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* 📅 Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <DatePicker
          selected={formData.dateOfBirth}
          onChange={(date) => handleChange("dateOfBirth", date)}
          dateFormat="dd/MM/yyyy"
          maxDate={new Date()}
          showYearDropdown
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      {/* 💬 Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          rows={3}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      {/* 💍 Marital Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
        <select
          value={formData.maritalStatus}
          onChange={(e) => handleChange("maritalStatus", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          <option>Single</option>
          <option>Married</option>
          <option>Divorced</option>
          <option>Widowed</option>
        </select>
      </div>

      {/* 🗣️ Language */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
        <select
          value={formData.language}
          onChange={(e) => handleChange("language", e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        >
          <option>English</option>
          <option>Tamil</option>
          <option>Hindi</option>
          <option>Malayalam</option>
          <option>Telugu</option>
        </select>
      </div>

      {/* 🌐 Social Media Links */}
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
                placeholder={`Enter ${platform} link`}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ✅ Save & Cancel */}
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
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 border border-gray-300 rounded-lg"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
