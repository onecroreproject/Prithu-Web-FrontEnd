// ✅ src/components/Profile/ProfilePage.jsx
import React, { useState, useEffect, memo } from "react";
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
  FolderGit2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useUserProfile, useTogglePublish } from "../../../hook/userProfile";
import { toast } from "react-hot-toast";

// SECTIONS
import EditProfile from "./editProfile";
import EditEducation from "./editEductionProfile";
import EditExperience from "./editExperience";
import EditSkill from "./editSkillProfile";
import EditCertification from "./editCertificationProfile";
import EditProject from "./editProject";

export default function ProfilePage() {
  const [expandedSection, setExpandedSection] = useState(null);
  const { token } = useAuth();

  const { data: profile, isLoading } = useUserProfile(token);
  const toggleMutation = useTogglePublish(token);

  const [localProfile, setLocalProfile] = useState(null);

  useEffect(() => {
    if (profile) setLocalProfile(profile);
  }, [profile]);

  const handleSectionToggle = (section) =>
    setExpandedSection((prev) => (prev === section ? null : section));

  /** ---------------------------------------
   *  PUBLISH / UNPUBLISH RESUME
   * --------------------------------------*/
  const handleTogglePublish = async () => {
    try {
      const newState = !localProfile?.isPublished;
      const response = await toggleMutation.mutateAsync(newState);

      if (response?.success) {
        setLocalProfile((p) => ({
          ...p,
          isPublished: response.isPublished,
          shareableLink: response.shareableLink,
        }));

        toast.success(
          response.isPublished
            ? "Resume published successfully!"
            : "Resume unpublished"
        );
      }
    } catch {
      toast.error("Error updating publish state");
    }
  };

  if (isLoading || !localProfile)
    return <p className="text-gray-500 p-4">Loading profile...</p>;

  const shareLink = localProfile?.shareableLink;
  const isPublished = localProfile?.isPublished;

  /** ---------------------------------------
   *  Curriculum Section (Grouped)
   * --------------------------------------*/
  const curriculumSections = [
    {
      key: "education",
      title: "Education",
      icon: <GraduationCap className="w-5 h-5 text-purple-600" />,
      component: <EditEducation />,
    },
    {
      key: "experience",
      title: "Experience",
      icon: <Briefcase className="w-5 h-5 text-purple-600" />,
      component: <EditExperience />,
    },
    {
      key: "projects",
      title: "Projects",
      icon: <FolderGit2 className="w-5 h-5 text-purple-600" />,
      component: <EditProject />,
    },
    {
      key: "skills",
      title: "Skills",
      icon: <Code2 className="w-5 h-5 text-purple-600" />,
      component: <EditSkill />,
    },
    {
      key: "certifications",
      title: "Certifications",
      icon: <Award className="w-5 h-5 text-purple-600" />,
      component: <EditCertification />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 p-4 max-w-3xl mx-auto"
    >
      {/* -----------------------------------------
          TOP HEADER
      ----------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h2 className="text-xl font-bold text-gray-900">User Profile</h2>

        {/* Toggle Publish */}
        <label className="flex items-center gap-2 cursor-pointer">
          <Share2 className="w-5 h-5 text-purple-600" />
          <span className="text-sm">Share your Resume</span>
          <input
            type="checkbox"
            checked={isPublished}
            onChange={handleTogglePublish}
            className="toggle toggle-success"
          />
        </label>
      </div>

      {/* -----------------------------------------
          SHAREABLE LINK
      ----------------------------------------- */}
      {isPublished && shareLink && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-purple-50 border border-purple-200 p-4 rounded-lg"
        >
          <p className="text-sm text-gray-700 mb-2">
            🎉 Your resume is live! Share this link:
          </p>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <a
              href={shareLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 font-medium hover:underline break-all"
            >
              {shareLink}
            </a>

            <button
              onClick={() => {
                navigator.clipboard.writeText(shareLink);
                toast.success("Link copied!");
              }}
              className="flex items-center gap-1 bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
        </motion.div>
      )}

      {/* -----------------------------------------
          EDIT PROFILE (ALWAYS SHOWN)
      ----------------------------------------- */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
      >
        <div
          onClick={() => handleSectionToggle("profile")}
          className="p-5 flex justify-between items-center cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <User2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">Profile Information</h3>
          </div>

          {expandedSection === "profile" ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>

        <AnimatePresence>
          {expandedSection === "profile" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-5 pb-5"
            >
              <EditProfile />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* -----------------------------------------
          CURRICULUM (GROUPED SECTIONS)
      ----------------------------------------- */}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all"
      >
        <div
          onClick={() => handleSectionToggle("curriculum")}
          className="p-5 flex justify-between items-center cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FolderGit2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-medium text-gray-900">Curriculum (PortFolio Update) </h3>
          </div>

          {expandedSection === "curriculum" ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>

        <AnimatePresence>
          {expandedSection === "curriculum" && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-5 pb-5"
            >
              {curriculumSections.map((item, idx) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b last:border-b-0 border-gray-100 py-4"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {item.icon}
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                  </div>
                  {item.component}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
