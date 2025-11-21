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

  // -----------------------------
  // BLOCK EDITING FOR OTHER USERS
  // -----------------------------
  const openCropModal = (file, type) => {
    if (!isOwnProfile) return;
    const imageURL = URL.createObjectURL(file);
    setImageToCrop(imageURL);
    setCropFor(type);
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
      {/* MAIN PROFILE HEADER */}
      {/* =============================== */}

      <div className="w-full bg-white overflow-hidden rounded-b-2xl shadow">
        {/* Banner */}
        <motion.div
          className="relative h-40 sm:h-48 md:h-56 bg-cover bg-center"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        >
          {/* Edit cover */}
          {isOwnProfile && (
            <motion.button
              onClick={() => bannerInputRef.current.click()}
              className="absolute top-3 right-3 bg-white/30 p-2 rounded-lg"
            >
              <Edit />
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
       <div className="relative flex justify-between  items-end px-6 -mt-14">

          <div className="relative w-32 h-32">
            <img
              src={profileUrl}
              className="w-32 h-32 rounded-xl border-4 border-white object-cover shadow-lg"
            />

            {/* Edit profile photo */}
            {isOwnProfile && (
              <button
                onClick={() => profileInputRef.current.click()}
                className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow"
              >
                <Camera />
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
                  className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg shadow hover:bg-gray-300"
                >
                  {followLoading ? "Unfollowing..." : "Unfollow"}
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
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
          <div className="bg-white p-4 rounded-lg w-full max-w-lg">
            <h2 className="font-bold mb-4">
              Crop {cropFor === "profile" ? "Profile Photo" : "Cover Photo"}
            </h2>

            <div className="relative w-full h-72 bg-black/10">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={cropFor === "profile" ? 1 : 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(c, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                disabled={isUploading}
                onClick={() => setCropModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                disabled={isUploading}
                onClick={handleSaveCrop}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
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
