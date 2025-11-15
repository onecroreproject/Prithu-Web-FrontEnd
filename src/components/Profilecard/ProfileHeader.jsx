import React, { useState, useRef, useEffect } from "react";
import Cropper from "react-easy-crop";
import {
  MessageSquare,
  User,
  Users,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Camera,
  Briefcase,
  FolderGit2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import { useUserProfile } from "../../hook/userProfile";
import {
  updateCoverPhoto,
  updateProfileAvatar,
} from "../../Service/profileService";
import { getCroppedImg } from "../../components/ProfileHeaderComponent/ImageCropmodel";

const defaultBanner =
  "https://res.cloudinary.com/demo/image/upload/v1720000000/default-cover.jpg";
const defaultAvatar =
  "https://res.cloudinary.com/demo/image/upload/v1720000000/default-avatar.jpg";

export default function ProfileHeader({ activeTab, setActiveTab }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { data: user, isLoading, refetch } = useUserProfile(token);

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

  const id = localStorage.getItem("userId");

  useEffect(() => {
    if (user) {
      setBannerUrl(user.coverPhoto || defaultBanner);
      setProfileUrl(user.profileAvatar || defaultAvatar);
    }
  }, [user]);

  // Open crop modal
  const openCropModal = (file, type) => {
    const imageURL = URL.createObjectURL(file);
    setImageToCrop(imageURL);
    setCropFor(type);
    setCropModalOpen(true);
  };

  // Handle raw file input
  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) openCropModal(file, "cover");
  };

  const handleProfileChange = (e) => {
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


  const tabs = [
    { id: "Activity", Icon: MessageSquare, label: "Activity" },
    { id: "profile", Icon: User, label: "Profile" },
    { id: "friends", Icon: Users, label: "Followers" },
    { id: "groups", Icon: Users, label: "Groups" },
    { id: "adverts", Icon: Megaphone, label: "Adverts" },
    { id: "forums", Icon: MessageCircle, label: "Forums" },
    { id: "jobs", Icon: Briefcase, label: "Jobs" },
    { id: "portfolio", Icon: FolderGit2, label: "Portfolio" },
    { id: "more", Icon: MoreHorizontal, label: "More" },
  ];
console.log(user)
  const handleTabClick = (tab) => {
    setActiveTab(tab.id);

    if (tab.id === "portfolio" && id) {
      navigate(`/portfolio/${user.userName}`);
    } else if (tab.id === "portfolio" && !id) {
      toast.error("User ID not found!");
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
        <motion.div
          className="relative h-40 sm:h-48 md:h-56 bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${bannerUrl})` }}
        >
          {/* Edit cover button */}
          <motion.button
            onClick={() => bannerInputRef.current.click()}
            className="absolute top-3 right-3 bg-white/30 p-2 rounded-lg"
          >
            <Edit />
          </motion.button>

          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerChange}
          />
        </motion.div>

        {/* Profile section */}
        <div className="relative px-6 -mt-14">
          <div className="relative w-32 h-32">
            <img
              src={profileUrl}
              className="w-32 h-32 rounded-xl border-4 border-white object-cover shadow-lg"
            />
            <button
              onClick={() => profileInputRef.current.click()}
              className="absolute bottom-2 right-2 bg-white p-2 rounded-lg shadow"
            >
              <Camera />
            </button>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfileChange}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 p-4 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.Icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 ${
                  isActive ? "bg-blue-600 text-white" : "bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
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
                onCropComplete={(croppedArea, pixels) =>
                  setCroppedAreaPixels(pixels)
                }
              />
            </div>

           <div className="flex justify-end gap-2 mt-4">
  <button
    disabled={isUploading}
    onClick={() => !isUploading && setCropModalOpen(false)}
    className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
  >
    Cancel
  </button>

  <button
    disabled={isUploading}
    onClick={handleSaveCrop}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
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
