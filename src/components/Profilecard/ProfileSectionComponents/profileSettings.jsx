// src/pages/ProfileSettings.jsx
import React, { useState, useEffect, useContext } from "react";
import api from "../../../api/axios";
import { AuthContext } from "../../../../context/AuthContext";
import { toast } from "react-hot-toast";

import ChangeProfilePhoto from "./changeProfilePhoto";
import ChangeCoverImage from "./changeCoverPhoto";

export default function ProfileSettings() {
  const { token, user } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Local states for settings
  const [showProfile, setShowProfile] = useState(true);
  const [emailOnFollow, setEmailOnFollow] = useState(true);

  // ✅ Fetch existing profile data
  const fetchUserProfile = async () => {
    try {
      const { data } = await api.get("/api/profile/settings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfileData(data.profile);

      // Initialize settings if available
      setShowProfile(data.profile?.privacy?.showProfile ?? true);
      setEmailOnFollow(data.profile?.notifications?.emailOnFollow ?? true);
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, [token]);

  // ✅ Upload profile or cover image
  const uploadProfileDetail = async (formData) => {
    try {
      const { data } = await api.put("/api/profile/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfileData(data.profile);
      toast.success("Profile updated successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      toast.error("Failed to upload image");
    }
  };

  // ✅ Save privacy/notification settings
  const saveSettings = async () => {
    try {
      await api.post(
        "/api/user/profile/settings",
        {
          privacy: { showProfile },
          notifications: { emailOnFollow },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Settings saved!");
      await fetchUserProfile();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save settings");
    }
  };

  // ✅ Delete profile
  const deleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete your profile?")) return;
    try {
      await api.delete("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Profile deleted");
      // Optional: redirect or logout here
    } catch (err) {
      console.error(err);
      toast.error("Deletion failed");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-600">
        Loading profile...
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-10">
      {/* Privacy + Notifications */}
      <div className="bg-white shadow-sm  rounded-xl p-6 text-gray-800">
        <h3 className="text-lg font-semibold mb-6">Privacy & Notifications</h3>

        <div className="space-y-8 max-w-2xl">
          {/* Privacy */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Privacy</h4>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={showProfile}
                onChange={(e) => setShowProfile(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                Show profile to everyone
              </span>
            </label>
          </div>

          {/* Notifications */}
          <div>
            <h4 className="font-medium text-gray-800 mb-3">Notifications</h4>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={emailOnFollow}
                onChange={(e) => setEmailOnFollow(e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                Email me when someone follows me
              </span>
            </label>
          </div>

          {/* Save Button */}
          <div className="pt-4">
            <button
              onClick={saveSettings}
              className="px-6 py-2.5 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
            >
              Save Settings
            </button>
          </div>

          {/* Danger Zone */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={deleteProfile}
              className="text-sm font-medium text-red-600 hover:text-red-700 transition"
            >
              Delete Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
