import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  User,
  Bell,
  Shield,
  Settings as Cog,
  Info,
  Bookmark,
  Layout,
  Sun,
  CreditCard,
  Users,
  Box,
  LogOut,
  Heart,
  EyeOff,
  ThumbsDown,
} from "lucide-react";

const settingsItems = [
  { title: "Account Type", icon: <User size={18} />, route: "/settings/account-type" },
  { title: "Notification", icon: <Bell size={18} />, route: "/settings/notification" },
  { title: "Security", icon: <Shield size={18} />, route: "/settings/security" },
  { title: "Account", icon: <Cog size={18} />, route: "/settings/account" },
  { title: "About", icon: <Info size={18} />, route: "/settings/about" },
  { title: "Save", icon: <Bookmark size={18} />, route: "/settings/saved-posts" },
  { title: "Feed", icon: <Layout size={18} />, route: "/settings/feed" },
  { title: "Liked Posts", icon: <Heart size={18} />, route: "/settings/liked-posts" },
  { title: "Not Interested Posts", icon: <ThumbsDown size={18} />, route: "/settings/not-interested-posts" },
  { title: "Hidden Posts", icon: <EyeOff size={18} />, route: "/settings/hidden-posts" },
  { title: "Theme", icon: <Sun size={18} />, route: "/settings/theme" },
  { title: "Payment", icon: <CreditCard size={18} />, route: "/settings/payment" },
  { title: "Referral", icon: <Users size={18} />, route: "/settings/referral" },
  { title: "Subscription", icon: <Box size={18} />, route: "/settings/subscription-details" },
  { title: "Invite Friends", icon: <Users size={18} />, route: "/settings/invite-friends" },
  { title: "Logout", icon: <LogOut size={18} />, highlight: true },
];

const SettingsSidebar = () => {
  const navigate = useNavigate();

  return (
    <div
      className="
        w-64
        bg-white
        border-r border-gray-200
        h-screen
        flex flex-col
        shadow-sm
      "
    >
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {settingsItems.map((item, idx) => (
          <NavLink
            key={idx}
            to={item.route || "#"}
            onClick={(e) => {
              if (item.highlight) {
                e.preventDefault();
                console.log("Logout clicked");
                // Implement logout logic here if needed
                navigate("/logout"); // Example: navigate to logout route
              }
            }}
            className={({ isActive }) => `
              w-full flex items-center justify-between
              px-4 py-3 rounded-md
              transition-all duration-150
              text-left
              ${
                item.highlight
                  ? "text-red-600 hover:bg-red-50 font-semibold"
                  : isActive
                  ? "bg-gray-100 text-gray-900 font-semibold"
                  : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div
                className={`
                  p-2 rounded-md
                  ${
                    item.route && window.location.pathname === item.route
                      ? "bg-gray-200 text-gray-900"
                      : "bg-gray-100 text-gray-500"
                  }
                `}
              >
                {item.icon}
              </div>
              <span className="font-medium text-sm">{item.title}</span>
            </div>
            {!item.highlight && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            )}
          </NavLink>
        ))}
      </div>
      <div className="border-t border-gray-100 p-4 text-xs text-gray-400">
        © {new Date().getFullYear()} MyApp. All rights reserved.
      </div>
    </div>
  );
};

export default SettingsSidebar;