// src/components/Profile/ChangeCoverImage.jsx
import React, { useState } from "react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";

export default function ChangeCoverImage({ user, fetchUserProfile }) {
  const [preview, setPreview] = useState(user?.coverPhoto || "");
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    console.log("called")
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("coverPhoto", file);

    try {
      setLoading(true);
      await api.post("/api/user/profile/cover/update", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Cover image updated!");
      await fetchUserProfile();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      handleFileChange(e);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Change Cover Image</h3>

      <div className="space-y-6">
        {/* Preview Area */}
        <div className="h-56 bg-gray-100 border-2 border-dashed border-gray-400 rounded-xl flex items-center justify-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="cover preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-6xl text-gray-400">+</span>
          )}
        </div>

        <p className="text-sm text-gray-600">
          Upload a new cover image. Recommended size:{" "}
          <strong>1200x400px</strong>
        </p>

        <label className="inline-block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileSelect}
          />
          <span
            className={`px-5 py-2.5 rounded-lg font-medium cursor-pointer transition ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-purple-600 text-white hover:bg-purple-700"
            }`}
          >
            {loading ? "Uploading..." : "Upload Cover"}
          </span>
        </label>
      </div>
    </div>
  );
}
