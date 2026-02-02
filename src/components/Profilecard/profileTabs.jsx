import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hooks/userProfile";
import { User, Activity, Heart } from "lucide-react";

/**
 * ProfileTabs Component
 * Handles tab navigation for the user profile page.
 */
const ProfileTabs = ({ activeTab, setActiveTab, id }) => {
  const { token } = useAuth();
  const { data: userRecord, isLoading } = useUserProfile(token, id);

  if (isLoading) {
    return (
      <div className="p-3 md:p-4">
        <div className="animate-pulse">
          <div className="space-y-2 md:space-y-3">
            <div className="h-10 md:h-11 bg-gray-200 rounded-lg"></div>
            <div className="h-10 md:h-11 bg-gray-200 rounded-lg"></div>
            <div className="h-10 md:h-11 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  // Configuration for all tabs
  const mainSections = [
    {
      id: "profile",
      label: "My Profile",
      mobileLabel: "Profile",
      Icon: User
    },
    {
      id: "activity",
      label: "My Activity",
      mobileLabel: "Activity",
      Icon: Activity
    },
    {
      id: "favorite",
      label: "Favorite Videos",
      mobileLabel: "Favorites",
      Icon: Heart
    }
  ].filter((section) => {
    // Hide Activity and Favorite for other users' profiles (if id is present and not matching mine)
    // For now, simpler: hide if id exists (meaning we're viewing someone else)
    if (id && (section.id === "activity" || section.id === "favorite")) return false;
    return true;
  });

  const handleTabClick = (tabId) => {
    console.log("Tab clicked:", tabId);
    setActiveTab(tabId);
  };

  return (
    <>
      {/* Mobile Navigation */}
      <div className="sm:hidden p-3 mb-3">
        <div className="flex justify-between space-x-1 overflow-x-auto no-scrollbar">
          {mainSections.map((section, index) => {
            const isActive = activeTab === section.id;
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleTabClick(section.id)}
                className={`flex-1 min-w-[60px] flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-600 hover:text-gray-800"
                  }`}
              >
                <section.Icon className={`w-5 h-5 ${isActive ? "text-blue-700" : "text-gray-500"}`} />
                <span className={`text-[10px] font-medium text-center mt-1 whitespace-nowrap ${isActive ? "text-blue-700" : "text-gray-600"}`}>
                  {section.mobileLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Tablet Navigation */}
      <div className="hidden sm:block lg:hidden p-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {mainSections.map((section, index) => {
            const isActive = activeTab === section.id;
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleTabClick(section.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200 ${isActive
                  ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <section.Icon className="w-4 h-4" />
                <span className="text-sm font-semibold">{section.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Desktop Navigation (Sidebar style) */}
      <div className="hidden lg:block p-2">
        <div className="grid gap-2">
          {mainSections.map((section, index) => {
            const isActive = activeTab === section.id;
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => handleTabClick(section.id)}
                  className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl transition-all duration-200 ${isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-100 translate-x-1"
                    : "text-gray-700 hover:bg-gray-50 hover:translate-x-1"
                    }`}
                >
                  <section.Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                  <span className={`font-bold text-sm ${isActive ? "text-white" : "text-gray-800"}`}>
                    {section.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                    />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default ProfileTabs;
