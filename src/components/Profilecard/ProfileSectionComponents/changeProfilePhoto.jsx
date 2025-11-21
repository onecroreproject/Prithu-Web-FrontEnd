// src/components/Profile/ChangeProfilePhoto.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Upload, Camera, Loader2 } from "lucide-react";
 
export default function ChangeProfilePhoto({ user, uploadProfileDetail }) {
  const [preview, setPreview] = useState(user?.profileAvatar || "");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
 
  // ✅ Handle file select + preview
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };
 
  // ✅ Handle drag and drop
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
 
  // ✅ Validate and process file
  const validateAndProcessFile = (file) => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }
 
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
 
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    handleFileUpload(file);
  };
 
  // ✅ Handle upload to server
  const handleFileUpload = async (file) => {
    const form = new FormData();
    form.append("file", file);
    try {
      setLoading(true);
      await uploadProfileDetail(form);
      toast.success("Profile photo updated successfully!");
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
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
            <Camera className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Change Profile Photo
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Update your profile picture
            </p>
          </div>
        </div>
      </div>
 
      <div className="p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          {/* Preview Section */}
          <div className="flex flex-col items-center">
            <div
              className={`relative w-32 h-32 lg:w-40 lg:h-40 rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-300 ${
                dragOver
                  ? "border-blue-400 bg-blue-50"
                  : preview
                    ? "border-gray-200"
                    : "border-gray-300 bg-gray-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {preview ? (
                <>
                  <img
                    src={preview}
                    alt="Profile preview"
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
                  <User className="w-12 h-12 mb-2" />
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
           
            {/* Current Photo Indicator */}
            {preview && !loading && (
              <p className="text-green-600 text-sm font-medium mt-3 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                New photo selected
              </p>
            )}
          </div>
 
          {/* Upload Section */}
          <div className="flex-1 max-w-md">
            <div className="space-y-4">
              {/* Upload Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">
                  Upload Requirements
                </h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Recommended size: 400×400 pixels</li>
                  <li>• Supported formats: JPG, PNG, WebP</li>
                  <li>• Maximum file size: 5MB</li>
                  <li>• Square images work best</li>
                </ul>
              </div>
 
              {/* File Upload Options */}
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
                  onClick={() => document.getElementById('file-input').click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="text-blue-600 font-medium">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, WebP up to 5MB
                  </p>
                </div>
 
                {/* File Input */}
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                  disabled={loading}
                />
 
                {/* Upload Button */}
                <button
                  onClick={() => document.getElementById('file-input').click()}
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
                      Choose File
                    </>
                  )}
                </button>
              </div>
 
              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center">
                Your profile photo will be visible to other users
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
 