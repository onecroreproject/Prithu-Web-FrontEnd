// ✅ src/components/Profile/ProfileTabs.jsx
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hook/userProfile";
import {
  User,
  Users,
  MessageSquare,
  ChevronRight
} from "lucide-react";
 
const ProfileTabs = ({ activeTab, setActiveTab,id }) => {
  const { token } = useAuth();
  const { data: user, isLoading } = useUserProfile(token,id);
 
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4">
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
 
  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3 md:p-4 text-center">
        <p className="text-gray-500 text-xs md:text-sm">Failed to load profile information</p>
      </div>
    );
  }
 
  // Main sections - Only Activity, Profile, and Followers
  const mainSections = [
    {
      icon: MessageSquare,
      label: "Activity",
      id: "Activity",
      mobileLabel: "Activity"
    },
    {
      icon: User,
      label: "Profile",
      id: "profile",
      mobileLabel: "Profile"
    },
    {
      icon: Users,
      label: "Followers",
      id: "friends",
      mobileLabel: "Followers"
    }
  ];
 
  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
 
  return (
    <>
      {/* Mobile: < 768px - Full width auto adjustment */}
      <div className="sm:hidden bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex justify-between space-x-1">
          {mainSections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = activeTab === section.id;
           
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleTabClick(section.id)}
                className={`flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                }`}
              >
                <IconComponent className={`w-4 h-4 mb-1 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`} />
                <span className={`text-xs font-medium text-center leading-tight ${
                  isActive ? "text-blue-700" : "text-gray-600"
                }`}>
                  {section.mobileLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
 
      {/* Tablet: 768px - 1023px - Auto width with distribution */}
      <div className="hidden sm:block lg:hidden bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="flex justify-between space-x-2">
          {mainSections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = activeTab === section.id;
           
            return (
              <motion.button
                key={section.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleTabClick(section.id)}
                className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                }`}
              >
                <IconComponent className={`w-4 h-4 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`} />
                <span className={`text-sm font-medium whitespace-nowrap ${
                  isActive ? "text-blue-700" : "text-gray-600"
                }`}>
                  {section.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
 
      {/* Laptop: 1024px - 1279px - Vertical with chevron */}
      <div className="hidden lg:block xl:hidden bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <div className="grid gap-1.5">
          {mainSections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = activeTab === section.id;
           
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <button
                  onClick={() => handleTabClick(section.id)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-blue-50 hover:border-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-blue-100"
                        : "bg-gray-100 group-hover:bg-blue-100"
                    }`}>
                      <IconComponent className={`w-3.5 h-3.5 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-600 group-hover:text-blue-600"
                      }`} />
                    </div>
                   
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className={`font-semibold text-sm ${
                        isActive ? "text-blue-700" : "text-gray-900"
                      }`}>
                        {section.label}
                      </h4>
                    </div>
                  </div>
                 
                  <ChevronRight className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-blue-500"
                  }`} />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
 
      {/* Desktop: ≥ 1280px - Enhanced vertical layout */}
      <div className="hidden xl:block bg-white rounded-xl border border-gray-200 p-3">
        <div className="grid gap-2">
          {mainSections.map((section, index) => {
            const IconComponent = section.icon;
            const isActive = activeTab === section.id;
           
            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <button
                  onClick={() => handleTabClick(section.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-blue-50 hover:border-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isActive
                        ? "bg-blue-100"
                        : "bg-gray-100 group-hover:bg-blue-100"
                    }`}>
                      <IconComponent className={`w-4 h-4 ${
                        isActive
                          ? "text-blue-600"
                          : "text-gray-600 group-hover:text-blue-600"
                      }`} />
                    </div>
                   
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className={`font-semibold text-sm ${
                        isActive ? "text-blue-700" : "text-gray-900"
                      }`}>
                        {section.label}
                      </h4>
                    </div>
                  </div>
                 
                  <ChevronRight className={`w-4 h-4 transition-colors ${
                    isActive
                      ? "text-blue-500"
                      : "text-gray-400 group-hover:text-blue-500"
                  }`} />
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
 