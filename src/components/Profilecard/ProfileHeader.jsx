// src/components/ProfileHeaderComponent/ProfileHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import { Edit, Camera } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hook/userProfile";
import {
  updateCoverPhoto,
  updateProfileAvatar,
} from "../../Service/profileService";
import api from "../../api/axios";
import { getCroppedImg } from "../../components/ProfileHeaderComponent/ImageCropmodel";

const defaultBanner =
  "https://res.cloudinary.com/demo/image/upload/v1720000000/default-cover.jpg";
const defaultAvatar =
  "https://res.cloudinary.com/demo/image/upload/v1720000000/default-avatar.jpg";

export default function ProfileHeader({ id }) {
  const { token } = useAuth();

  const { data: user, isLoading, refetch } = useUserProfile(token, id);

  const [bannerUrl, setBannerUrl] = useState(defaultBanner);
  const [profileUrl, setProfileUrl] = useState(defaultAvatar);

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [cropFor, setCropFor] = useState("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [originalImageSize, setOriginalImageSize] = useState({ width: 0, height: 0 });

  // 🔥 True only when viewing own profile
  const isOwnProfile = !id;

  // FOLLOW STATES
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // -----------------------------
  // FETCH FOLLOW STATUS
  // -----------------------------
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!id) return; // only for viewing someone else

      try {
        const res = await api.get(`/api/user/following`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = res.data.following || [];

        const alreadyFollows = list.some((u) => u.userId === id);
        setIsFollowing(alreadyFollows);
      } catch (error) {
        console.log("Follow status error:", error);
      }
    };

    checkFollowStatus();
  }, [id, token]);

  // -----------------------------
  // FOLLOW USER
  // -----------------------------
  const handleFollow = async () => {
    setFollowLoading(true);

    try {
      await api.post(
        `/api/user/follow/creator`,
        { userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Followed successfully!");
      setIsFollowing(true);

      // 🔥 Broadcast follow event to update feed posts
      window.dispatchEvent(
        new CustomEvent("userFollowStatusChanged", {
          detail: { userId: id, isFollowing: true },
        })
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to follow");
    } finally {
      setFollowLoading(false);
    }
  };

  // -----------------------------
  // UNFOLLOW USER
  // -----------------------------
  const handleUnfollow = async () => {
    setFollowLoading(true);

    try {
      await api.post(
        `/api/user/unfollow/creator`,
        { userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Unfollowed successfully!");
      setIsFollowing(false);

      // 🔥 Broadcast unfollow event to update feed posts
      window.dispatchEvent(
        new CustomEvent("userFollowStatusChanged", {
          detail: { userId: id, isFollowing: false },
        })
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to unfollow");
    } finally {
      setFollowLoading(false);
    }
  };

  // -----------------------------
  // POPULATE PROFILE DATA
  // -----------------------------
  useEffect(() => {
    if (user) {
      setBannerUrl(user.coverPhoto || defaultBanner);
      setProfileUrl(user.profileAvatar || defaultAvatar);
    }
  }, [user]);

  // Get original image dimensions
  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  // Calculate aspect ratio for cover photo (3:1 ratio)
  const calculateCoverAspect = (width, height) => {
    const targetAspect = 3 / 1; // Cover photo aspect ratio
    const currentAspect = width / height;
    
    if (currentAspect > targetAspect) {
      // Image is wider than target, crop width
      return targetAspect;
    } else {
      // Image is taller than target, maintain original aspect but suggest 3:1
      return targetAspect;
    }
  };

  // -----------------------------
  // BLOCK EDITING FOR OTHER USERS
  // -----------------------------
  const openCropModal = async (file, type) => {
    if (!isOwnProfile) return;
    
    const imageURL = URL.createObjectURL(file);
    setImageToCrop(imageURL);
    setCropFor(type);
    
    // Get original image dimensions for cover photos
    if (type === "cover") {
      try {
        const dimensions = await getImageDimensions(file);
        setOriginalImageSize(dimensions);
      } catch (error) {
        console.error("Error getting image dimensions:", error);
      }
    }
    
    setCropModalOpen(true);
  };

  const handleBannerChange = (e) => {
    if (!isOwnProfile) return;
    const file = e.target.files[0];
    if (file) openCropModal(file, "cover");
  };

  const handleProfileChange = (e) => {
    if (!isOwnProfile) return;
    const file = e.target.files[0];
    if (file) openCropModal(file, "profile");
  };

  // -----------------------------
  // SAVE CROPPED IMAGE
  // -----------------------------
  const handleSaveCrop = async () => {
    try {
      setIsUploading(true);

      let aspect;
      if (cropFor === "profile") {
        aspect = 1; // Square for profile
      } else {
        // For cover, use the calculated aspect ratio based on original image
        aspect = calculateCoverAspect(originalImageSize.width, originalImageSize.height);
      }

      const { file, url } = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        aspect
      );

      if (cropFor === "cover") {
        setBannerUrl(url);
        await updateCoverPhoto(file, token);
        toast.success("Cover photo updated successfully!");
      } else {
        setProfileUrl(url);
        await updateProfileAvatar(file, token);
        toast.success("Profile photo updated successfully!");
      }

      await refetch();
      setCropModalOpen(false);
    } catch (err) {
      toast.error("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset crop state when modal closes
  const handleCloseCropModal = () => {
    setCropModalOpen(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setOriginalImageSize({ width: 0, height: 0 });
    
    // Clean up object URLs
    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
  };

  if (isLoading)
    return <p className="text-gray-500 p-4">Loading profile...</p>;

  return (
    <>
      {/* =============================== */}
      {/* MAIN PROFILE HEADER */}
      {/* =============================== */}

      <div className="w-full bg-white overflow-hidden rounded-b-2xl shadow">
        {/* Banner - Show original image without object-cover */}
        <motion.div
          className="relative h-40 sm:h-48 md:h-56 bg-gray-200 overflow-hidden"
        >
          <img
            src={bannerUrl}
            className="w-full h-full object-cover"
            style={{ 
              objectFit: 'none', // Don't crop or cover
              objectPosition: 'center',
              minWidth: '100%',
              minHeight: '100%'
            }}
            alt="Cover"
            onError={(e) => {
              e.target.src = defaultBanner;
            }}
          />
          
          {/* Edit cover */}
          {isOwnProfile && (
            <motion.button
              onClick={() => bannerInputRef.current.click()}
              className="absolute top-3 right-3 bg-white/80 hover:bg-white p-2 rounded-lg transition-all duration-200 shadow-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="w-4 h-4 text-gray-700" />
            </motion.button>
          )}

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />
        </motion.div>

        {/* Profile Picture + Follow Button */}
        <div className="relative flex justify-between items-end px-6 -mt-14">
          <div className="relative w-32 h-32">
            {/* Profile image - Square crop maintained */}
            <div className="w-32 h-32 rounded-xl border-4 border-white bg-white shadow-lg overflow-hidden">
              <img
                src={profileUrl}
                className="w-full h-full object-cover"
                alt="Profile"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
            </div>

            {/* Edit profile photo */}
            {isOwnProfile && (
              <button
                onClick={() => profileInputRef.current.click()}
                className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow hover:bg-gray-50 transition-all duration-200"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </button>
            )}

            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileChange}
            />
          </div>

          {/* FOLLOW BUTTON */}
          {!isOwnProfile && (
            <div className="items-center mb-4">
              {isFollowing ? (
                <button
                  onClick={handleUnfollow}
                  disabled={followLoading}
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg shadow hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
                >
                  {followLoading ? "Unfollowing..." : "Unfollow"}
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                >
                  {followLoading ? "Following..." : "Follow"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =============================== */}
      {/* CROP MODAL */}
      {/* =============================== */}

      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-full max-w-lg mx-4">
            <h2 className="font-bold text-lg mb-4 text-gray-900">
              Crop {cropFor === "profile" ? "Profile Photo" : "Cover Photo"}
            </h2>

            <div className="relative w-full h-72 bg-gray-100 rounded-lg overflow-hidden">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropFor === "profile" ? 1 : calculateCoverAspect(originalImageSize.width, originalImageSize.height)}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(c, pixels) => setCroppedAreaPixels(pixels)}
                showGrid={false}
                restrictPosition={true}
                style={{
                  containerStyle: {
                    borderRadius: '8px'
                  }
                }}
              />
            </div>

            {/* Zoom Control */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zoom: {Math.round(zoom * 100)}%
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                disabled={isUploading}
                onClick={handleCloseCropModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={isUploading}
                onClick={handleSaveCrop}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  "Save & Upload"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}