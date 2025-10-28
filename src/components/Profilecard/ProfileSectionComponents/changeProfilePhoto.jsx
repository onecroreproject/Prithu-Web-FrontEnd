// src/components/Profile/ChangeProfilePhoto.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";

export default function ChangeProfilePhoto({ user, uploadProfileDetail }) {
  const [preview, setPreview] = useState(user?.profilePhoto || "");
  const [loading, setLoading] = useState(false);

  // ✅ Handle file select + preview
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      handleFileUpload(file);
    }
  };

  // ✅ Handle upload to server
  const handleFileUpload = async (file) => {
    const form = new FormData();
    form.append("profilePhoto", file);
    try {
      setLoading(true);
      await uploadProfileDetail(form);
      toast.success("Profile photo updated!");
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        Change Profile Photo
      </h3>

      <div className="flex items-center gap-10">
        {/* ✅ Preview box */}
        <div className="w-36 h-36 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-400 flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-5xl text-gray-400">+</span>
          )}
        </div>

        <div className="max-w-md">
          <p className="text-sm text-gray-600 mb-4">
            Upload a new profile picture. Recommended size:{" "}
            <strong>400x400px</strong>
          </p>

          {/* ✅ File input */}
          <label className="inline-block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <span
              className={`px-5 py-2.5 font-medium rounded-lg cursor-pointer transition ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-purple-600 text-white hover:bg-purple-700"
              }`}
            >
              {loading ? "Uploading..." : "Choose File"}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
