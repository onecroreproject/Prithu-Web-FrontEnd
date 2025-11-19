// ✅ src/components/Profile/ProfileTabs.jsx
import React from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useUserProfile } from "../../hook/userProfile";
import {
  User,
  Users,
  Megaphone,
  MessageSquare,
  MessageCircle,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  ChevronRight
} from "lucide-react";
 
const ProfileTabs = ({ activeTab, setActiveTab }) => {
  const { token } = useAuth();
  const { data: user, isLoading } = useUserProfile(token);
 
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        <div className="animate-pulse">
          <div className="space-y-3 sm:space-y-4">
            <div className="h-12 sm:h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-12 sm:h-16 bg-gray-200 rounded-lg"></div>
            <div className="h-12 sm:h-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
 
  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 text-center">
        <p className="text-gray-500 text-sm sm:text-base">Failed to load profile information</p>
      </div>
    );
  }
 
  // Main sections - Profile, Followers, Groups, Adverts, Forums
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
    },
    {
      icon: Users,
      label: "Groups",
      id: "groups",
      mobileLabel: "Groups"
    },
    {
      icon: MessageCircle,
      label: "Forums",
      id: "forums",
      mobileLabel: "Forums"
    },
    {
      icon: Megaphone,
      label: "Advertisements",
      id: "adverts",
      mobileLabel: "Ads"
    },
    {
      icon: Briefcase,
      label: "Jobs",
      id: "jobs",
      mobileLabel: "Jobs"
    }
  ];

  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
 
  return (
    <>
      {/* Mobile Horizontal Scroll Tabs */}
      <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex space-x-1 overflow-x-auto pb-2 hide-scrollbar">
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
                className={`flex-shrink-0 flex flex-col items-center justify-center p-3 rounded-lg min-w-[70px] transition-all duration-200 ${
                  isActive
                    ? "bg-blue-50 border border-blue-200 text-blue-700"
                    : "bg-gray-50 hover:bg-gray-100 text-gray-600"
                }`}
              >
                <IconComponent className={`w-5 h-5 mb-1 ${
                  isActive ? "text-blue-600" : "text-gray-500"
                }`} />
                <span className={`text-xs font-medium text-center ${
                  isActive ? "text-blue-700" : "text-gray-600"
                }`}>
                  {section.mobileLabel}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Desktop Vertical Tabs */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
        {/* Main Sections Grid */}
        <div className="grid gap-2 sm:gap-3 mb-4 sm:mb-6">
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
                  className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 border border-blue-200 shadow-sm"
                      : "hover:bg-blue-50 hover:border-blue-100"
                  }`}
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      isActive 
                        ? "bg-blue-100" 
                        : "bg-gray-100 group-hover:bg-blue-100"
                    }`}>
                      <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        isActive 
                          ? "text-blue-600" 
                          : "text-gray-600 group-hover:text-blue-600"
                      }`} />
                    </div>
                   
                    <div className="flex-1 min-w-0 text-left">
                      <h4 className={`font-semibold text-sm sm:text-base ${
                        isActive ? "text-blue-700" : "text-gray-900"
                      }`}>
                        {section.label}
                      </h4>
                    </div>
                  </div>
                 
                  <ChevronRight className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
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

      {/* Custom CSS for hiding scrollbar */}
      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
};
 
export default ProfileTabs;