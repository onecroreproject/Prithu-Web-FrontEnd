// ✅ src/layouts/Header.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BellRing,
  Search,
  Home,
  Video,
  User,
  Gift,
  Settings,
  LogOut,
  Plus,
  Menu,
  X,
} from "lucide-react";
import debounce from "lodash.debounce";
import PrithuLogo from "../assets/prithu_logo.webp";
import NotificationDropdown from "../components/NotificationComponet/notificationDropdwon";
import api from "../api/axios";
import CreatePostModal from "../components/CreatePostModal";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import SearchBar from "./searchComponent"; // ✅ new component

const navItems = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/subscriptions", label: "Subscriptions", Icon: BellRing },
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/referral", label: "Referral", Icon: Gift },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function Header() {
  const { user, token, logout, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isReelsActive, setIsReelsActive] = useState(false);

  const dropdownRef = useRef(null);

  /* ------------------- 🔹 Fetch user profile ------------------- */
  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  /* ------------------- 🔹 Fetch notifications ------------------- */
  const fetchNotificationCount = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/api/get/user/all/notification", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const notifications = data?.notifications || [];
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      setNotifCount(unreadCount);
    } catch (err) {
      console.error("❌ Notification fetch failed:", err);
    }
  }, [token]);

  const debouncedFetch = useMemo(
    () => debounce(fetchNotificationCount, 500),
    [fetchNotificationCount]
  );

  useEffect(() => {
    const handleNewNotif = (e) => {
      const notif = e.detail;
      toast.success(`🔔 ${notif.title || "New notification!"}`);
      setNotifCount((prev) => prev + 1);
    };

    const handleNotifRead = () => debouncedFetch();

    document.addEventListener("socket:newNotification", handleNewNotif);
    document.addEventListener("socket:notificationRead", handleNotifRead);
    fetchNotificationCount();

    return () => {
      document.removeEventListener("socket:newNotification", handleNewNotif);
      document.removeEventListener("socket:notificationRead", handleNotifRead);
    };
  }, [debouncedFetch, fetchNotificationCount]);

  /* ------------------- 🔹 Close dropdown on outside click ------------------- */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleBellClick = () => setNotifOpen((p) => !p);
  const closeAll = () => {
    setDropdownOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
  };

  /* ------------------- 🔹 Reels Toggle ------------------- */
  const handleReelClick = () => {
    const nextState = !isReelsActive;
    setIsReelsActive(nextState);
    window.dispatchEvent(
      new CustomEvent("toggleReels", { detail: { isActive: nextState } })
    );
    toast(`${nextState ? "🎬 Reels Mode" : "🏠 Feed Mode"} activated`, {
      icon: nextState ? "🎥" : "✨",
    });
  };

  return (
    <motion.header
      className="fixed top-0 left-0 w-full bg-white dark:bg-gray-900 flex items-center justify-between px-4 md:px-6 py-3 shadow-sm dark:shadow-gray-800 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 🌿 Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img src={PrithuLogo} alt="Prithu Logo" className="w-9 h-9" />
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-yellow-400 bg-clip-text text-transparent">
          PRITHU
        </h1>
      </div>

      {/* 🔍 Search */}
      <div className="hidden sm:flex flex-1 justify-center px-4">
        <SearchBar token={token} />
      </div>

      {/* ⚙️ Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => setMobileMenuOpen((p) => !p)}
          className="sm:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <HeaderIcon Icon={Plus} onClick={() => setIsCreatePostOpen(true)} />
        <HeaderIcon Icon={Video} onClick={handleReelClick} active={isReelsActive} />

        {/* 🔔 Notifications */}
        <div className="relative">
          <HeaderIcon Icon={BellRing} badge={notifCount} onClick={handleBellClick} />
          <NotificationDropdown
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onUpdateCount={fetchNotificationCount}
          />
        </div>

        {/* 👤 Profile Dropdown */}
        <div ref={dropdownRef} className="relative flex items-center gap-2">
          <motion.button
            onClick={() => setDropdownOpen((p) => !p)}
            className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-300 ${
              dropdownOpen ? "text-gray-800 dark:text-gray-200" : "text-gray-700 dark:text-gray-300"
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <span className="hidden sm:block font-medium">
              {user?.userName || "User"}
            </span>
            <ProfileAvatar user={user} />
          </motion.button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-lg"
              >
                {navItems.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
                  >
                    <Icon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-md transition"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ✨ Create Post Modal */}
      <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </motion.header>
  );
}

/* ✅ HeaderIcon */
const HeaderIcon = ({ Icon, onClick, badge, active }) => (
  <button
    onClick={onClick}
    className={`relative p-2 rounded-full transition-all duration-300 ${
      active ? "bg-green-100 dark:bg-green-800 ring-2 ring-green-400" : "hover:bg-gray-100 dark:hover:bg-gray-700"
    }`}
  >
    <Icon
      className={`w-5 h-5 ${
        active ? "text-green-700 dark:text-green-300 scale-110" : "text-green-600 dark:text-green-400"
      } transition-all`}
    />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

/* ✅ Avatar */
const ProfileAvatar = ({ user }) => {
  const fallback = user?.displayName?.[0]?.toUpperCase() || "U";
  return user?.profileAvatar ? (
    <img src={user.profileAvatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
  ) : (
    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center text-xs text-green-600 dark:text-green-300 font-bold">
      {fallback}
    </div>
  );
};
