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
import { motion, AnimatePresence } from "framer-motion";
import { Edit3, Save, X, User, Mail, Phone, MapPin, Calendar, Globe, Lock, Bell, Link2 } from "lucide-react";
 
export default function EditProfile({id}) {
  const { token } = useAuth();
  const { data: user, isLoading: profileLoading, refetch } = useUserProfile(token,id);
 
  const [isEditing, setIsEditing] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
 
  const [formData, setFormData] = useState({
    userName: "",
    name: "",
    lastName: "",
    bio: "",
    profileSummary: "",
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
      profileSummary: user.profileSummary || "",
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
 
  if (profileLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm"
    >
      {/* Header Section */}
      <div className="bg-blue-50 border-b border-blue-100 rounded-t-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Edit Profile" : "Profile Details"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {isEditing ? "Update your personal information" : "View and manage your profile"}
              </p>
            </div>
          </div>
 
          {!isEditing ? (
             !id ? (
    <button
      type="button"
      onClick={() => setIsEditing(true)}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm hover:shadow-md"
    >
      <Edit3 className="w-4 h-4" />
      Edit Profile
    </button>
  ) : null
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                form="profile-form"
                disabled={mutation.isLoading || !hasUnsavedChanges}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                  mutation.isLoading || !hasUnsavedChanges
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                }`}
              >
                <Save className="w-4 h-4" />
                {mutation.isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
 
      <form id="profile-form" className="p-6 space-y-8" onSubmit={handleSave}>
        {/* Personal Information Section */}
        <Section title="Personal Information" icon={User}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              value={formData.name}
              onChange={(v) => handleChange("name", v)}
              disabled={!isEditing}
              icon={User}
            />
            <InputField
              label="Last Name"
              value={formData.lastName}
              onChange={(v) => handleChange("lastName", v)}
              disabled={!isEditing}
              icon={User}
            />
          </div>
         
          <InputField
            label="Username"
            value={formData.userName}
            onChange={(v) => handleChange("userName", v)}
            disabled={!isEditing}
            icon={User}
          />
         
          <AnimatePresence>
            {isEditing && usernameStatus && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className={`text-sm font-medium ${
                  usernameStatus.available ? "text-green-600" : "text-red-600"
                }`}
              >
                {usernameStatus.message}
              </motion.p>
            )}
          </AnimatePresence>
        </Section>
 
        {/* Contact Information Section */}
        <Section title="Contact Information" icon={Phone}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputField
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(v) => handlePhoneChange("phoneNumber", v)}
              disabled={!isEditing}
              icon={Phone}
              type="tel"
            />
            <InputField
              label="WhatsApp Number"
              value={formData.whatsAppNumber}
              onChange={(v) => handlePhoneChange("whatsAppNumber", v)}
              disabled={!isEditing}
              icon={Phone}
              type="tel"
            />
          </div>
        </Section>
 
        {/* Location Information */}
        <Section title="Location" icon={MapPin}>
          <TextArea
            label="Address"
            value={formData.address}
            onChange={(v) => handleChange("address", v)}
            disabled={!isEditing}
            icon={MapPin}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InputField
              label="City"
              value={formData.city}
              onChange={(v) => handleChange("city", v)}
              disabled={!isEditing}
              icon={MapPin}
            />
            <InputField
              label="Country"
              value={formData.country}
              onChange={(v) => handleChange("country", v)}
              disabled={!isEditing}
              icon={MapPin}
            />
          </div>
        </Section>
 
        {/* Dates Section */}
        <Section title="Important Dates" icon={Calendar}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
        </Section>
 
        {/* About Section */}
        <Section title="About You" icon={User}>
          <TextArea
            label="Personal Bio"
            value={formData.bio}
            onChange={(v) => handleChange("bio", v)}
            disabled={!isEditing}
            rows={4}
          />
          <TextArea
            label="Profile Summary"
            value={formData.profileSummary}
            onChange={(v) => handleChange("profileSummary", v)}
            disabled={!isEditing}
            rows={3}
          />
        </Section>
 
        {/* Preferences Section */}
        <Section title="Preferences" icon={Globe}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              icon={Globe}
            />
          </div>
        </Section>
 
        {/* Privacy & Notifications */}
        <Section title="Privacy & Notifications" icon={Lock}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SelectField
              label="Privacy"
              options={["public", "private", "friends"]}
              value={formData.privacy}
              onChange={(v) => handleChange("privacy", v)}
              disabled={!isEditing}
            />
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Bell className="w-4 h-4 text-gray-600" />
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
                <p className="text-xs text-gray-500">Receive updates and alerts</p>
              </div>
              <input
                type="checkbox"
                checked={formData.notifications}
                onChange={(e) => handleChange("notifications", e.target.checked)}
                disabled={!isEditing}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </Section>
 
        {/* Social Links Section */}
        <Section title="Social Media Links" icon={Link2}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {Object.keys(formData.socialLinks).map((platform) => (
              <InputField
                key={platform}
                label={platform.charAt(0).toUpperCase() + platform.slice(1)}
                value={formData.socialLinks[platform]}
                onChange={(v) => handleSocialChange(platform, v)}
                disabled={!isEditing}
                icon={Link2}
              />
            ))}
          </div>
        </Section>
      </form>
    </motion.div>
  );
}
 
/* ✅ Reusable Section Component */
function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}
 
/* ✅ Reusable Input Components */
function InputField({ label, value, onChange, disabled, icon: Icon, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
            Icon ? "pl-10" : ""
          } ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }`}
        />
      </div>
    </div>
  );
}
 
function TextArea({ label, value, onChange, disabled, icon: Icon, rows = 3 }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          disabled={disabled}
          className={`w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
            Icon ? "pl-10" : ""
          } ${
            disabled
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          }`}
        />
      </div>
    </div>
  );
}
 
function SelectField({ label, options, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt.charAt(0).toUpperCase() + opt.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
 
function DateField({ label, value, onChange, disabled }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <DatePicker
        selected={value}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        maxDate={new Date()}
        showYearDropdown
        disabled={disabled}
        className={`w-full p-3 border border-gray-300 rounded-lg transition-colors duration-200 ${
          disabled
            ? "bg-gray-100 text-gray-500 cursor-not-allowed"
            : "bg-white hover:border-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        }`}
      />
    </div>
  );
}
 