// src/components/ProfileHeaderComponent/ProfileHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import {
  Edit,
  Camera,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useUserProfile } from "../../hook/userProfile";
import {
  updateCoverPhoto,
  updateProfileAvatar,
} from "../../Service/profileService";
import api from "../../api/axios";
import { getCroppedImg } from "../../components/ProfileHeaderComponent/ImageCropmodel";
import defaultAvatars from "../../assets/user.png";
import { useNavigate } from "react-router-dom";

const defaultBanner =defaultAvatars
 
const defaultAvatar =defaultAvatars
 

export default function ProfileHeader({ id }) {
  const { token } = useAuth();
  const { data: user, isLoading, refetch } = useUserProfile(token, id);
  const currentUser = localStorage.getItem("userId");
  const navigate=useNavigate()
  const [bannerUrl, setBannerUrl] = useState(defaultBanner);
  const [profileUrl, setProfileUrl] = useState(defaultAvatar);

  // File Refs
  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  // Crop modal state
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [cropFor, setCropFor] = useState(""); // "cover" | "profile"
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // FOLLOW STATES
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);

  // 🔥 True only when viewing own profile
  const isOwnProfile = !id;

  // -----------------------------
  // SYNC USER -> LOCAL STATE
  // -----------------------------
  useEffect(() => {
    if (user) {
      setBannerUrl(user.coverPhoto || defaultBanner);
      setProfileUrl(user.profileAvatar || defaultAvatar);
      
      const serverFollowersCount =
        user.followersCount ?? (user.followers ? user.followers.length : 0);
      setFollowersCount(serverFollowersCount);
    }
  }, [user]);

  // -----------------------------
  // FETCH FOLLOW STATUS (initial)
  // -----------------------------
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!id) return;

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
  // FOLLOW USER (optimistic + reconcile)
  // -----------------------------
  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    setIsFollowing(true);
    setFollowersCount((c) => c + 1);

    try {
      await api.post(
        `/api/user/follow/creator`,
        { userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success("Followed successfully!");
      await refetch();
    } catch (err) {
      setIsFollowing(false);
      setFollowersCount((c) => Math.max(0, c - 1));
      toast.error(err.response?.data?.message || "Failed to follow");
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  // -----------------------------
  // UNFOLLOW USER (optimistic + reconcile)
  // -----------------------------
  const handleUnfollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    setIsFollowing(false);
    setFollowersCount((c) => Math.max(0, c - 1));

    try {
      await api.post(
        `/api/user/unfollow/creator`,
        { userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/home")
      toast.success("Unfollowed successfully!");
      await refetch();
    } catch (err) {
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
      toast.error(err.response?.data?.message || "Failed to unfollow");
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Open crop modal
  const openCropModal = (file, type) => {
    if (!isOwnProfile) return;
    
    const imageURL = URL.createObjectURL(file);
    setImageToCrop(imageURL);
    setCropFor(type);
    setCropModalOpen(true);
  };

  // Handle raw file input
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

  // Save cropped image
  const handleSaveCrop = async () => {
    try {
      setIsUploading(true);

      const aspect = cropFor === "profile" ? 1 : 3;
      const { file, url } = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        aspect
      );

      if (cropFor === "cover") {
        setBannerUrl(url);
        await updateCoverPhoto(file, token);
        toast.success("Cover updated!");
      } else {
        setProfileUrl(url);
        await updateProfileAvatar(file, token);
        toast.success("Profile updated!");
      }

      await refetch();
      setCropModalOpen(false);
    } catch (err) {
      toast.error("Upload failed");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading)
    return <p className="text-gray-500 p-4">Loading profile...</p>;

  return (
    <>
      {/* =============================== */}
      {/* MAIN PROFILE HEADER START */}
      {/* =============================== */}

      <div className="w-full bg-white overflow-hidden rounded-b-2xl shadow">
        {/* Banner Section */}
       <motion.div className="relative bg-gradient-to-r from-blue-500 to-purple-600 overflow-hidden">
          <div className="aspect-[3/1] min-h-[160px] max-h-full w-full">
            <img
              src={bannerUrl}
              className="w-full h-full object-cover"
              alt="Cover"
              onError={(e) => {
                e.target.src = defaultBanner;
              }}
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

          {isOwnProfile && (
            <motion.button
              onClick={() => bannerInputRef.current.click()}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-xl transition-all duration-200 shadow-lg backdrop-blur-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit className="w-5 h-5 text-gray-700" />
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

        {/* Profile section - Improved mobile alignment */}
        <div className="relative px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6 -mt-12 sm:-mt-16 pb-4">
            {/* Profile Picture */}
            <motion.div className="relative flex-shrink-0">
              <img
                src={profileUrl}
                className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-xl border-4 border-white object-cover shadow-lg bg-white"
                alt="Profile"
                onError={(e) => {
                  e.target.src = defaultAvatar;
                }}
              />
              {isOwnProfile && (
                <button
                  onClick={() => profileInputRef.current.click()}
                  className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white p-1.5 sm:p-2 rounded-lg shadow hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              )}
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileChange}
              />
            </motion.div>

            {/* User Info - Better mobile alignment */}
            <motion.div className="flex flex-col justify-end text-center sm:text-left flex-1 min-w-0 sm:mt-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                {user?.name} {user?.lastName}
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 mt-1">
                <span className="font-medium text-gray-800 text-sm">
                  @{user?.userName || "username"}
                </span>
              </div>

              {/* Mobile Follow Section */}
              {!isOwnProfile && currentUser !== id && (
                <div className="flex items-center gap-4 mt-3 sm:hidden">
                  

                  <div>
                    {isFollowing ? (
                      <button
                        onClick={handleUnfollow}
                        disabled={followLoading}
                        className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium text-sm"
                      >
                        {followLoading ? "Unfollowing..." : "Unfollow"}
                      </button>
                    ) : (
                      <button
                        onClick={handleFollow}
                        disabled={followLoading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm"
                      >
                        {followLoading ? "Following..." : "Follow"}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Desktop Follow Section */}
            {!isOwnProfile && currentUser !== id && (
              <div className="hidden sm:flex flex-col items-end gap-2">
               
                {isFollowing ? (
                  <button
                    onClick={handleUnfollow}
                    disabled={followLoading}
                    className="px-4 py-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 font-medium text-sm"
                  >
                    {followLoading ? "Unfollowing..." : "Unfollow"}
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm"
                  >
                    {followLoading ? "Following..." : "Follow"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* =============================== */}
      {/* CROP MODAL */}
      {/* =============================== */}

      {cropModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-auto">
            <h2 className="font-bold text-lg mb-4 text-gray-900">
              Crop {cropFor === "profile" ? "Profile Photo" : "Cover Photo"}
            </h2>

            <div className="relative w-full h-64 sm:h-72 bg-black/10 rounded-lg overflow-hidden">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropFor === "profile" ? 1 : 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(croppedArea, pixels) =>
                  setCroppedAreaPixels(pixels)
                }
              />
            </div>

            {/* Zoom Control */}
            <div className="mt-4">
              <label className="text-sm text-gray-700 mb-2 block">Zoom</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                disabled={isUploading}
                onClick={() => !isUploading && setCropModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                disabled={isUploading}
                onClick={handleSaveCrop}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isUploading ? "Uploading..." : "Save & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}





