import React from "react";

import { motion } from "framer-motion";

import { useAuth } from "../../context/AuthContext";

import { useUserProfile } from "../../hook/userProfile";

import profile from "../../assets/profile.png"

import event from "../../assets/event.png"

import followers from "../../assets/followers.png"
 
const ProfileTabs = ({ activeTab, setActiveTab, id }) => {

  const { token } = useAuth();

  const { data: user, isLoading } = useUserProfile(token, id);
 
  if (isLoading) {

    return (
<div className="p-3 md:p-4">
<div className="animate-pulse">
<div className="space-y-2 md:space-y-3">
<div className="h-10 md:h-11 bg-gray-200"></div>
<div className="h-10 md:h-11 bg-gray-200"></div>
<div className="h-10 md:h-11 bg-gray-200"></div>
</div>
</div>
</div>

    );

  }
 
  if (!user) {

    return (
<div className="p-3 md:p-4 text-center">
<p className="text-gray-500 text-xs md:text-sm">Failed to load profile information</p>
</div>

    );

  }
 
  // Main sections with image emojis from assets folder

  const mainSections = [

    {

      image: profile,

      label: "Activity",

      id: "Activity",

      mobileLabel: "Activity"

    },

    {

      image: event,

      label: "Profile",

      id: "profile",

      mobileLabel: "Profile"

    },

    {

      image: followers,

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
<div className="sm:hidden p-3 mb-3">
<div className="flex justify-between space-x-1">

          {mainSections.map((section, index) => {

            const isActive = activeTab === section.id;

            return (
<motion.button

                key={section.id}

                initial={{ opacity: 0, scale: 0.9 }}

                animate={{ opacity: 1, scale: 1 }}

                transition={{ delay: index * 0.05 }}

                onClick={() => handleTabClick(section.id)}

                className={`flex-1 flex flex-col items-center justify-center p-2 transition-all duration-200 ${

                  isActive

                    ? "text-blue-700"

                    : "text-gray-600 hover:text-gray-800"

                }`}
>
<img 

                  src={section.image} 

                  alt={section.label}

                  className="w-5 h-5 mb-1 object-contain"

                />
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
<div className="hidden sm:block lg:hidden p-3 mb-3">
<div className="flex justify-between space-x-2">

          {mainSections.map((section, index) => {

            const isActive = activeTab === section.id;

            return (
<motion.button

                key={section.id}

                initial={{ opacity: 0, scale: 0.9 }}

                animate={{ opacity: 1, scale: 1 }}

                transition={{ delay: index * 0.05 }}

                onClick={() => handleTabClick(section.id)}

                className={`flex-1 flex items-center justify-center gap-2 p-3 transition-all duration-200 ${

                  isActive

                    ? "text-blue-700"

                    : "text-gray-600 hover:text-gray-800"

                }`}
>
<img 

                  src={section.image} 

                  alt={section.label}

                  className="w-5 h-5 object-contain"

                />
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
 
      {/* Laptop: 1024px - 1279px - Vertical layout */}
<div className="hidden lg:block xl:hidden p-3 mb-3">
<div className="grid gap-1.5">

          {mainSections.map((section, index) => {

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

                  className={`w-full flex items-center gap-2.5 p-2.5 transition-all duration-200 ${

                    isActive

                      ? "text-blue-700"

                      : "text-gray-700 hover:text-gray-900"

                  }`}
>
<img 

                    src={section.image} 

                    alt={section.label}

                    className="w-6 h-6 object-contain"

                  />
<div className="flex-1 min-w-0 text-left">
<h4 className={`font-semibold text-sm ${

                      isActive ? "text-blue-700" : "text-gray-900"

                    }`}>

                      {section.label}
</h4>
</div>
</button>
</motion.div>

            );

          })}
</div>
</div>
 
      {/* Desktop: ≥ 1280px - Enhanced vertical layout */}
<div className="hidden xl:block p-3">
<div className="grid gap-2">

          {mainSections.map((section, index) => {

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

                  className={`w-full flex items-center gap-3 p-3 transition-all duration-200 ${

                    isActive

                      ? "text-blue-700"

                      : "text-gray-700 hover:text-gray-900"

                  }`}
>
<img 

                    src={section.image} 

                    alt={section.label}

                    className="w-7 h-7 object-contain"

                  />
<div className="flex-1 min-w-0 text-left">
<h4 className={`font-semibold text-sm ${

                      isActive ? "text-blue-700" : "text-gray-900"

                    }`}>

                      {section.label}
</h4>
</div>
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
 