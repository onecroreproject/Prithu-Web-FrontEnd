 
import React, { useState, useEffect, useContext } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Shield, Trash2, Globe, Users, Lock, AlertTriangle } from "lucide-react";
 
export default function ProfileSettings() {
  const { token } = useContext(AuthContext);
  const [visibility, setVisibility] = useState({});
  const [loading, setLoading] = useState(true);
 
  // ✅ Fetch current visibility settings
  const fetchVisibilitySettings = async () => {
    try {
      const { data } = await api.get("/api/user/get/visibility/settings");
      setVisibility(data.visibility || {});
    } catch (err) {
      console.error("Failed to load visibility settings:", err);
    } finally {
      setLoading(false);
    }
  };
 
  useEffect(() => {
    fetchVisibilitySettings();
  }, [token]);
 
  // ✅ Update specific field's visibility
  const updateVisibility = async (field, value) => {
    try {
      await api.post(
        "/api/user/update/visibility/settings",
        { field, value, type: "general" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Updated ${field} visibility to ${value}`);
      setVisibility((prev) => ({ ...prev, [field]: value }));
    } catch (err) {
      console.error("Failed to update visibility:", err);
      toast.error("Failed to update visibility");
    }
  };
 
 
 
  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
 
  // ✅ All available privacy fields
  const fields = [
    { key: "displayName", label: "Display Name" },
    { key: "userName", label: "Username" },
    { key: "email", label: "Email" },
    { key: "phoneNumber", label: "Phone Number" },
    { key: "bio", label: "Bio" },
    { key: "dateOfBirth", label: "Date of Birth" },
    { key: "maritalStatus", label: "Marital Status" },
    { key: "country", label: "Country" },
    { key: "city", label: "City" },
    { key: "profileAvatar", label: "Profile Avatar" },
    { key: "coverPhoto", label: "Cover Photo" },
    { key: "socialLinks", label: "Social Links" },
  ];
 
  // ✅ Animation variants
  const fadeSlide = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };
 
  // ✅ Privacy options with icons
  const privacyOptions = [
    { value: "public", label: "Public", icon: Globe, description: "Visible to everyone" },
    { value: "followers", label: "Followers", icon: Users, description: "Visible to your followers only" },
    { value: "private", label: "Private", icon: Lock, description: "Visible only to you" },
  ];
 
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Privacy Settings Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Privacy Settings</h2>
              <p className="text-gray-600 text-sm mt-1">
                Control who can see your profile information
              </p>
            </div>
          </div>
        </div>
 
        {/* Privacy Settings Content */}
        <div className="p-6">
          <AnimatePresence>
            <div className="space-y-6">
              {fields.map(({ key, label }, index) => (
                <motion.div
                  key={key}
                  variants={fadeSlide}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={{ delay: index * 0.05 }}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-200 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Field Label */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm lg:text-base">
                        {label}
                      </h4>
                      <p className="text-gray-500 text-xs lg:text-sm mt-1">
                        Choose who can see your {label.toLowerCase()}
                      </p>
                    </div>
 
                    {/* Privacy Options */}
                    <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                      {privacyOptions.map((option) => {
                        const IconComponent = option.icon;
                        const isActive = visibility[key] === option.value;
                       
                        return (
                          <label
                            key={option.value}
                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all duration-200 min-w-[120px] ${
                              isActive
                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                : "border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name={key}
                              value={option.value}
                              checked={isActive}
                              onChange={() => updateVisibility(key, option.value)}
                              className="hidden"
                            />
                            <IconComponent className={`w-4 h-4 ${
                              isActive ? "text-blue-600" : "text-gray-400"
                            }`} />
                            <div className="flex flex-col">
                              <span className={`text-sm font-medium ${
                                isActive ? "text-blue-700" : "text-gray-700"
                              }`}>
                                {option.label}
                              </span>
                              <span className="text-xs text-gray-500">
                                {option.description}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>
 
 
    </motion.div>
  );
}
 
 