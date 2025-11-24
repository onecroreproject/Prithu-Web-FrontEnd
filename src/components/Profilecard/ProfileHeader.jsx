
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
  const currentUser = localStorage.getItem("userId");
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

  // Local copies for instant UI updates (optimistic)
  const [followersCount, setFollowersCount] = useState(0);
  const [visibility, setVisibility] = useState("public"); // fallback - replace with your actual key if different

  // -----------------------------
  // REFETCH ON EXTERNAL EVENTS
  // -----------------------------
  useEffect(() => {
    const refreshProfile = () => {
      refetch(); // 🔥 Re-fetch profile from backend (followers count, visibility etc.)
    };

    window.addEventListener("userFollowStatusChanged", refreshProfile);

    return () => {
      window.removeEventListener("userFollowStatusChanged", refreshProfile);
    };
  }, [refetch]);

  // -----------------------------
  // SYNC USER -> LOCAL STATE
  // -----------------------------
  useEffect(() => {
    if (!user) return;

    setBannerUrl(user.coverPhoto || defaultBanner);
    setProfileUrl(user.profileAvatar || defaultAvatar);

    // normalize follower count field - adapt if your API uses a different key
    const serverFollowersCount =
      user.followersCount ?? (user.followers ? user.followers.length : 0);
    setFollowersCount(serverFollowersCount);

    // normalize visibility field - change key if your API differs
    const serverVisibility = user.visibility ?? user.visibilityStatus ?? "public";
    setVisibility(serverVisibility);

    // If this page is someone else's profile, set following status from server (keeps in sync)
    if (id) {
      // If the hook already exposes whether current user follows, prefer that.
      // Fallback: keep existing checkFollowStatus hook below that calls /api/user/following
    }
  }, [user, id]);

  // -----------------------------
  // FETCH FOLLOW STATUS (initial)
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
  // FOLLOW USER (optimistic + reconcile)
  // -----------------------------
  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);

    // Optimistic UI update
    setIsFollowing(true);
    setFollowersCount((c) => c + 1);

    try {
      await api.post(
        `/api/user/follow/creator`,
        { userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Followed successfully!");

      // Broadcast follow event with richer payload so other parts can update instantly
      window.dispatchEvent(
        new CustomEvent("userFollowStatusChanged", {
          detail: {
            userId: id,
            isFollowing: true,
            followersCount: followersCount + 1, // best-effort value (optimistic)
            visibility, // current visibility — other listeners can decide what to do
          },
        })
      );

      // Re-fetch server truth (to update visibility/follower-count accurately)
      await refetch();
    } catch (err) {
      // rollback optimistic update if server fails
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

    // Optimistic UI update
    setIsFollowing(false);
    setFollowersCount((c) => Math.max(0, c - 1));

    try {
      await api.post(
        `/api/user/unfollow/creator`,
        { userId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Unfollowed successfully!");

      window.dispatchEvent(
        new CustomEvent("userFollowStatusChanged", {
          detail: {
            userId: id,
            isFollowing: false,
            followersCount: Math.max(0, followersCount - 1),
            visibility,
          },
        })
      );

      // Re-fetch server truth
      await refetch();
    } catch (err) {
      // rollback optimistic update if server fails
      setIsFollowing(true);
      setFollowersCount((c) => c + 1);
      toast.error(err.response?.data?.message || "Failed to unfollow");
      console.error(err);
    } finally {
      setFollowLoading(false);
    }
  };

  // (rest of your crop & image code unchanged)
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

  const calculateCoverAspect = (width, height) => {
    const targetAspect = 3 / 1; // Cover photo aspect ratio
    const currentAspect = width / height;

    if (currentAspect > targetAspect) {
      return targetAspect;
    } else {
      return targetAspect;
    }
  };

  const openCropModal = async (file, type) => {
    if (!isOwnProfile) return;

    const imageURL = URL.createObjectURL(file);
    setImageToCrop(imageURL);
    setCropFor(type);

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

  const handleSaveCrop = async () => {
    try {
      setIsUploading(true);

      let aspect;
      if (cropFor === "profile") {
        aspect = 1; // Square for profile
      } else {
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

  const handleCloseCropModal = () => {
    setCropModalOpen(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setOriginalImageSize({ width: 0, height: 0 });

    if (imageToCrop) {
      URL.revokeObjectURL(imageToCrop);
    }
  };

  if (isLoading) return <p className="text-gray-500 p-4">Loading profile...</p>;

  return (
    <>
      <div className="w-full bg-white overflow-hidden rounded-b-2xl shadow">
        <motion.div className="relative h-40 sm:h-48 md:h-56 bg-gray-200 overflow-hidden">
          <img
            src={bannerUrl}
            className="w-full h-full object-cover object-center"
            alt="Cover"
            onError={(e) => {
              e.target.src = defaultBanner;
            }}
          />

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

        <div className="relative flex justify-between items-end px-6 -mt-14">
          <div className="relative w-32 h-32">
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

          {/* FOLLOW BUTTON + follower count display */}
          {!isOwnProfile && currentUser !== id && (
            <div className="items-center mb-4 flex flex-col items-end">
              

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
                    borderRadius: "8px",
                  },
                }}
              />
            </div>

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
