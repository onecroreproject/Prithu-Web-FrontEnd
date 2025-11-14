import React from "react";
import { motion } from "framer-motion";
import ProfilePage from "./profilePage";

/**
 * ✅ Pure Profile View Component
 * @param {Object} props
 * @param {Object} props.userData - User data passed from parent (SingleUserProfilelayout)
 */
export default function PostSection({ userData }) {
  if (!userData) {
    return (
      <div className="text-center text-gray-500 py-10">
        No profile data available.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="p-6 bg-white dark:bg-[#1b1b1f] rounded-lg shadow-sm overflow-hidden"
    >
      <ProfilePage user={userData} viewOnly={true} />
    </motion.div>
  );
}
