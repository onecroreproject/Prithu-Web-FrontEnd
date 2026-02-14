// ✅ src/components/Profile/ProfilePage.jsx
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  User2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext";
import { useUserProfile } from "../../../hooks/userProfile";
import { toast } from "react-hot-toast";
import EditProfile from "./editProfile";



export default function ProfilePage(id) {
  const [expandedSection, setExpandedSection] = useState("profile");
  const { token } = useAuth();
  const { data: profile, isLoading } = useUserProfile(token);
  const [localProfile, setLocalProfile] = useState(profile);

  const handleSectionToggle = (section) =>
    setExpandedSection((prev) => (prev === section ? null : section));

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );

  // 🔒 If ID exists (viewing someone else's profile), show only profile section
  const hasId = id && id.id;

  const profileSections = [
    {
      key: "profile",
      title: "Profile Information",
      icon: <User2 className="w-5 h-5 text-blue-600" />,
      component: <EditProfile id={id} />,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6 p-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-xl font-bold text-gray-900 text-center sm:text-left">
          {hasId ? "User Profile" : "My Profile"}
        </h2>
      </div>


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
