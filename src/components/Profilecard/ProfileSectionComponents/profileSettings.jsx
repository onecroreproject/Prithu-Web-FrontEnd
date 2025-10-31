import React, { useState, useEffect, useContext } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfileSettings() {
  const { token } = useContext(AuthContext);
  const [visibility, setVisibility] = useState({});
  const [loading, setLoading] = useState(true);

  // ✅ Fetch current visibility settings
  const fetchVisibilitySettings = async () => {
    try {
      const { data } = await api.get("/api/user/update/visibility/settings",);
      setVisibility(data.visibility || {});
    } catch (err) {
      console.error("Failed to load visibility settings:", err);
      toast.error("Failed to load visibility settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisibilitySettings();
  }, [token]);

  // ✅ Update specific field’s visibility
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

  // ✅ Delete profile
  const deleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    try {
      await api.delete("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile deleted successfully!");
      // Optional: redirect or logout
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete profile");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading privacy settings...
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

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      {/* Privacy Section */}
      <motion.div
        className="bg-white shadow-sm rounded-xl p-6 text-gray-800"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.05 }}
      >
        <h3 className="text-lg font-semibold mb-6">Privacy Settings</h3>

        <AnimatePresence>
          <div className="space-y-6">
            {fields.map(({ key, label }) => (
              <motion.div
                key={key}
                variants={fadeSlide}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="border-b border-gray-100 pb-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="font-medium text-gray-700">{label}</span>

                  <div className="flex gap-3 flex-wrap">
                    {["public", "followers", "private"].map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-1 text-sm cursor-pointer ${
                          visibility[key] === option
                            ? "text-purple-700 font-medium"
                            : "text-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name={key}
                          value={option}
                          checked={visibility[key] === option}
                          onChange={() => updateVisibility(key, option)}
                          className="accent-purple-600"
                        />
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        className="bg-white shadow-sm rounded-xl p-6 text-gray-800"
        variants={fadeSlide}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
        <p className="text-sm text-gray-500 mb-4">
          Once deleted, your profile cannot be recovered.
        </p>
        <button
          onClick={deleteProfile}
          className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition"
        >
          Delete Profile
        </button>
      </motion.div>
    </div>
  );
}
