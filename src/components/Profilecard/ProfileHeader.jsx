// src/components/PostHeader.jsx
import React, { useState, useRef } from "react";
import {
  MessageSquare,
  User,
  Users,
  Megaphone,
  MessageCircle,
  MoreHorizontal,
  Edit,
  Camera,
} from "lucide-react";

export default function PostHeader({ activeTab, setActiveTab }) {
  // ----- Image handling (banner + avatar) -----
  const [bannerUrl, setBannerUrl] = useState(
    "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200"
  );
  const [profileUrl, setProfileUrl] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300"
  );

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const openBannerPicker = () => bannerInputRef.current?.click();
  const openProfilePicker = () => profileInputRef.current?.click();

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) setBannerUrl(URL.createObjectURL(file));
  };
  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileUrl(URL.createObjectURL(file));
  };

  // ----- Tabs definition -----
  const tabs = [
    { id: "personal", Icon: MessageSquare, label: "Personal" },
    { id: "profile", Icon: User, label: "Profile" },
    { id: "friends", Icon: Users, label: "Friends" },
    { id: "groups", Icon: Users, label: "Groups" },
    { id: "adverts", Icon: Megaphone, label: "Adverts" },
    { id: "forums", Icon: MessageCircle, label: "Forums" },
    { id: "more", Icon: MoreHorizontal, label: "More" },
  ];

  return (
    <div className="w-full bg-white">
      {/* COVER BANNER */}
      <div
        className="relative h-56 bg-cover bg-center overflow-hidden"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      >
        <div className="absolute left-0 top-0 w-48 h-48 rounded-full bg-gradient-to-br from-orange-600 to-red-900 -translate-x-16 -translate-y-8 blur-2xl opacity-60" />
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-7xl font-black tracking-wider text-white opacity-90 select-none">
            COMPANY
          </h1>
        </div>

        <button
          onClick={openBannerPicker}
          className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2.5 rounded-lg transition-all"
        >
          <Edit className="w-5 h-5 text-gray-900" />
        </button>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
      </div>

      {/* PROFILE AVATAR + NAME */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end gap-6 -mt-16 pb-6">
            {/* Avatar */}
            <div className="relative">
              <img
                src={profileUrl}
                alt="Alice"
                className="w-36 h-36 rounded-xl border-4 border-white object-cover shadow-lg bg-white"
              />
              <button
                onClick={openProfilePicker}
                className="absolute bottom-2 right-2 bg-white hover:bg-gray-100 p-1.5 rounded-lg shadow-md transition-all"
              >
                <Camera className="w-4 h-4 text-gray-700" />
              </button>
              <input
                ref={profileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfileChange}
              />
            </div>

            {/* Name + Status */}
            <div className="flex flex-col justify-end">
              <h2 className="text-lg font-bold text-gray-900">Alice</h2>
              <p className="text-xs text-gray-600 mt-1">
                <span className="font-medium text-gray-800">@user</span>
                <span className="mx-1.5 text-gray-400">•</span>
                <span>Active 14 minutes ago</span>
              </p>
            </div>
            {/* NAVIGATION TABS */}
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex flex-col items-center gap-1.5 px-4 py-2 rounded-lg transition-all
                    ${isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}