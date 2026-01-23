// ✅ src/components/Profile/ProfilePage.jsx
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  User2,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Share2,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useUserProfile, useTogglePublish } from "../../../hooks/userProfile";
import { toast } from "react-hot-toast";

import EditProfile from "./editProfile";
import EditEducation from "./editEductionProfile";
import EditExperience from "./editExperience";
import EditSkill from "./editSkillProfile";
import EditCertification from "./editCertificationProfile";

export default function ProfilePage(id) {
  const [expandedSection, setExpandedSection] = useState("profile");
  const { token } = useAuth();
  const { data: profile, isLoading } = useUserProfile(token);
  const toggleMutation = useTogglePublish(token);
  const [localProfile, setLocalProfile] = useState(profile);

  const handleSectionToggle = (section) =>
    setExpandedSection((prev) => (prev === section ? null : section));

  // ✅ Publish / Unpublish Resume
  const handleTogglePublish = async () => {
    try {
      const newState = !localProfile?.isPublished;
      const response = await toggleMutation.mutateAsync(newState);

      // ✅ Update local state instantly
      if (response?.success) {
        const updatedProfile = {
          ...localProfile,
          isPublished: response.isPublished,
          shareableLink: response.shareableLink,
        };
        setLocalProfile(updatedProfile);
        toast.success(
          response.isPublished
            ? "✅ Resume published successfully!"
            : "🔒 Resume unpublished!"
        );
      }
    } catch (error) {
      toast.error("❌ Error toggling publish state");
    }
  };

  const shareLink = localProfile?.shareableLink;
  const isPublished = localProfile?.isPublished;

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  // 🔒 If ID exists (viewing someone else's profile), show only profile section
  const hasId = id && id.id;

  const profileSections = hasId
    ? [ // Only show profile section when ID exists
      {
        key: "profile",
        title: "Profile Information",
        icon: <User2 className="w-5 h-5 text-blue-600" />,
        component: <EditProfile id={id} />,
      },
    ]
    : [ // Show all sections for own profile
      {
        key: "profile",
        title: "Profile Information",
        icon: <User2 className="w-5 h-5 text-blue-600" />,
        component: <EditProfile id={id} />,
      },
      {
        key: "education",
        title: "Education",
        icon: <GraduationCap className="w-5 h-5 text-blue-600" />,
        component: <EditEducation />,
      },
      {
        key: "experience",
        title: "Work Experience",
        icon: <Briefcase className="w-5 h-5 text-blue-600" />,
        component: <EditExperience />,
      },
      {
        key: "skills",
        title: "Skills",
        icon: <Code2 className="w-5 h-5 text-blue-600" />,
        component: <EditSkill />,
      },
      {
        key: "certifications",
        title: "Certifications",
        icon: <Award className="w-5 h-5 text-blue-600" />,
        component: <EditCertification />,
      },
    ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6 p-4"
    >
      {/* 🔝 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 text-center sm:text-left">
          {hasId ? "User Profile" : "My Profile"}
        </h2>

        {/* 🌐 Share Resume Toggle - Only show for own profile */}
        {!hasId && (
          <div className="flex items-center justify-center gap-3 bg-blue-50 rounded-lg p-3 sm:p-3 border border-blue-100">
            <Share2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <label className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm text-gray-700 whitespace-nowrap">Share Resume</span>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={handleTogglePublish}
                className="toggle toggle-primary"
              />
            </label>
          </div>
        )}
      </div>

      {/* ✅ Show shareable link when published - Only for own profile */}
      {!hasId && isPublished && shareLink && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 p-4 rounded-lg"
        >
          <p className="text-sm text-gray-700 mb-3 text-center sm:text-left">
            🎉 Your resume is live! Share this link:
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 font-medium hover:underline break-all text-sm text-center sm:text-left"
            >
              {shareLink}
            </a>
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success("📋 Link copied to clipboard!");
              }}
              className="flex items-center justify-center gap-2 text-sm bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0 w-full sm:w-auto"
            >
              <Copy className="w-4 h-4" /> Copy Link
            </button>
          </div>
        </motion.div>
      )}

      {/* 📂 Profile Sections */}
      <div className="space-y-4">
        {profileSections.map((section, index) => (
          <motion.div
            key={section.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
          >
            {/* Section Header */}
            <motion.div
              whileHover={{ backgroundColor: "#f0f9ff" }}
              onClick={() => handleSectionToggle(section.key)}
              className="p-4 sm:p-5 flex justify-between items-center cursor-pointer gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {section.icon}
                <motion.h3
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="font-medium text-gray-900 text-base truncate"
                >
                  {section.title}
                </motion.h3>
              </div>

              <motion.div
                initial={false}
                animate={{
                  rotate: expandedSection === section.key ? 180 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="flex-shrink-0"
              >
                {expandedSection === section.key ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </motion.div>
            </motion.div>

            {/* Expandable Content */}
            <AnimatePresence initial={false}>
              {expandedSection === section.key && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0, scale: 0.98 }}
                  animate={{ height: "auto", opacity: 1, scale: 1 }}
                  exit={{ height: 0, opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="px-4 sm:px-5 pb-4 sm:pb-5 pt-2"
                  >
                    {section.component}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
