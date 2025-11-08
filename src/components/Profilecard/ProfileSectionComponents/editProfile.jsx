// ✅ src/components/Profile/EditProfile.jsx
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useUserProfile } from "../../../hook/userProfile";
import { updateProfileDetails } from "../../../Service/profileService";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../api/axios";
import debounce from "lodash.debounce";

export default function EditProfile() {
  const { token } = useAuth();
  const { data: user, isLoading: profileLoading, refetch } = useUserProfile(token);
console.log(user)
  const [isEditing, setIsEditing] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    name: "",
    lastName: "",
    bio: "",
    gender: "Male",
    maritalStatus: "Single",
    dateOfBirth: null,
    maritalDate: null,
    address: "",
    city: "",
    country: "",
    phoneNumber: "",
    whatsAppNumber: "",
    theme: "light",
    language: "English",
    timezone: "Asia/Kolkata",
    details: "",
    notifications: true,
    privacy: "public",
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
      userName: user.userName || "",
      name: user.name || "",
      lastName: user.lastName || "",
      bio: user.bio || "",
      gender: user.gender || "Male",
      maritalStatus: user.maritalStatus || "Single",
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth) : null,
      maritalDate: user.maritalDate ? new Date(user.maritalDate) : null,
      address: user.address || "",
      city: user.city || "",
      country: user.country || "",
      phoneNumber: user.phoneNumber || "",
      whatsAppNumber: user.whatsAppNumber || "",
      theme: user.theme || "light",
      language: user.language || "English",
      timezone: user.timezone || "Asia/Kolkata",
      details: user.details || "",
      notifications: user.notifications ?? true,
      privacy: user.privacy || "public",
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

  useEffect(() => {
    setHasUnsavedChanges(JSON.stringify(formData) !== initialDataRef.current);
  }, [formData]);

  // ✅ Debounced username check
  const checkUsername = useRef(
    debounce(async (username) => {
      if (!username.trim()) {
        setUsernameStatus(null);
        return;
      }
      try {
        const { data } = await api.get(
          `/api/check/username/availability?username=${encodeURIComponent(username)}`
        );
        setUsernameStatus(data);
      } catch (err) {
        console.error("❌ Username check failed:", err);
      }
    }, 600)
  ).current;

  // 🔧 Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "userName") checkUsername(value);
  };

  const handlePhoneChange = (field, value) => {
    if (/^\d{0,10}$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSocialChange = (platform, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  // ✅ Mutation for update
  const mutation = useMutation({
    mutationFn: (payload) => updateProfileDetails(payload, token),
    onSuccess: async () => {
      toast.success("✅ Profile updated successfully!");
      await refetch();
      setIsEditing(false);
      initialDataRef.current = JSON.stringify(formData);
      setHasUnsavedChanges(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "❌ Failed to update profile"),
  });

  const handleSave = (e) => {
    e.preventDefault();
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

        {/* Name Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            value={formData.name}
            onChange={(v) => handleChange("name", v)}
            disabled={!isEditing}
          />
          <InputField
            label="Last Name"
            value={formData.lastName}
            onChange={(v) => handleChange("lastName", v)}
            disabled={!isEditing}
          />
        </div>

        {/* Username */}
        <InputField
          label="Username"
          value={formData.userName}
          onChange={(v) => handleChange("userName", v)}
          disabled={!isEditing}
        />
        {isEditing && usernameStatus && (
          <p
            className={`text-sm ${
              usernameStatus.available ? "text-green-600" : "text-red-600"
            }`}
          >
            {usernameStatus.message}
          </p>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Phone Number"
            value={formData.phoneNumber}
            onChange={(v) => handlePhoneChange("phoneNumber", v)}
            disabled={!isEditing}
          />
          <InputField
            label="WhatsApp Number"
            value={formData.whatsAppNumber}
            onChange={(v) => handlePhoneChange("whatsAppNumber", v)}
            disabled={!isEditing}
          />
        </div>

        {/* Address */}
        <TextArea
          label="Address"
          value={formData.address}
          onChange={(v) => handleChange("address", v)}
          disabled={!isEditing}
        />

        {/* City / Country */}
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

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={(date) => handleChange("dateOfBirth", date)}
            disabled={!isEditing}
          />
          <DateField
            label="Marital Date"
            value={formData.maritalDate}
            onChange={(date) => handleChange("maritalDate", date)}
            disabled={!isEditing}
          />
        </div>

        {/* Bio */}
        <TextArea
          label="Profile Summary"
          value={formData.bio}
          onChange={(v) => handleChange("bio", v)}
          disabled={!isEditing}
        />

        {/* Theme, Timezone */}
        <SelectField
          label="Theme"
          options={["light", "dark", "system"]}
          value={formData.theme}
          onChange={(v) => handleChange("theme", v)}
          disabled={!isEditing}
        />
        <InputField
          label="Timezone"
          value={formData.timezone}
          onChange={(v) => handleChange("timezone", v)}
          disabled={!isEditing}
        />

        {/* Privacy and Notifications */}
        <SelectField
          label="Privacy"
          options={["public", "private", "friends"]}
          value={formData.privacy}
          onChange={(v) => handleChange("privacy", v)}
          disabled={!isEditing}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.notifications}
            onChange={(e) => handleChange("notifications", e.target.checked)}
            disabled={!isEditing}
          />
          <span className="text-sm text-gray-700">Enable Notifications</span>
        </div>

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
    </div>
  );
}

/* ✅ Reusable Inputs */
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

function DateField({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        maxDate={new Date()}
        showYearDropdown
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}
