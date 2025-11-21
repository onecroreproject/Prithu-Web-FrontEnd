// src/components/Profile/ChangeCoverImage.jsx
import React, { useState } from "react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import { Image, Upload, Loader2, Landmark } from "lucide-react";
 
export default function ChangeCoverImage({ user, fetchUserProfile ,id}) {
  const [preview, setPreview] = useState(user?.coverPhoto || "");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
 
  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
 
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
 
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };
 
  // Validate and process file
  const validateAndProcessFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
 
    // Check file size (10MB max for cover photos)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Cover image size should be less than 10MB");
      return;
    }
 
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    handleFileUpload(file);
  };
 
  const handleFileUpload = async (file) => {
    console.log("Uploading cover image");
    const form = new FormData();
    form.append("coverPhoto", file);
 
    try {
      setLoading(true);
      await api.post("/api/user/profile/cover/update", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Cover image updated successfully!");
      await fetchUserProfile();
    } catch (err) {
      console.error(err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
 
  const onFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };
 
  return (
   <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4 }}
  className="bg-white rounded-xl border border-gray-200 shadow-sm"
>
  {/* Header Section */}
  <div className="bg-blue-50 border-b border-blue-100 rounded-t-xl p-6">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Landmark className="w-5 h-5 text-blue-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900">Change Cover Image</h2>
        <p className="text-gray-600 text-sm mt-1">Update your profile cover photo</p>
      </div>
    </div>
  </div>

  {/* Body */}
  <div className="p-6">
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">

        {/* Preview Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Preview</h3>

          <div
            className={`relative h-48 md:h-56 lg:h-64 bg-gray-100 rounded-xl border-2 border-dashed overflow-hidden transition-all duration-300 ${
              dragOver
                ? "border-blue-400 bg-blue-50"
                : preview
                ? "border-gray-200"
                : "border-gray-300"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
                {loading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <Image className="w-16 h-16 mb-4" />
                <p className="text-lg font-medium mb-2">No cover image</p>
                <p className="text-sm text-center px-4">
                  Upload a cover image to personalize your profile
                </p>
              </div>
            )}
          </div>

          {preview && !loading && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
              <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              New cover image selected and ready to upload
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Requirements */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 text-sm mb-3">Cover Image Guidelines</h4>
              <ul className="text-sm text-blue-800 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Recommended size: <strong>1200×400 pixels</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Supported formats: JPG, PNG, WebP</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Maximum file size: 10MB</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Landscape orientation works best</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Upload Actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Upload Cover</h3>

            <div className="space-y-3">
              {/* Drag & Drop Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
                  dragOver
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => document.getElementById("cover-file-input").click()}
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">
                  <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, WebP up to 10MB</p>
              </div>

              {/* Hidden Input */}
              <input
                id="cover-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelect}
                disabled={loading}
              />

              {/* Upload Button */}
              <button
                onClick={() => document.getElementById("cover-file-input").click()}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 font-medium rounded-lg transition-all duration-200 ${
                  loading
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Choose Cover Image
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Your cover image will be visible to all visitors of your profile
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</motion.div>

  );
}
 