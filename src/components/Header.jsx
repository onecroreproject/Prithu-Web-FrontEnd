 
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
  const mobileMenuRef = useRef(null);
  const notificationRef = useRef(null);
 
  // ✅ Fetch user profile once logged in
  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);
 
  // ✅ Fetch notification count
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
 
  // ✅ Handle socket updates for notifications
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
 
  // ✅ Close dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);
 
  const handleBellClick = () => {
    setNotifOpen((p) => !p);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };
 
  const closeAll = () => {
    setDropdownOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
  };
 
  // ✅ Toggle Reels mode
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
      className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-4 md:px-6 py-3 shadow-md z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* Logo */}
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 cursor-pointer"
      >
        <img src={PrithuLogo} alt="Prithu Logo" className="w-8 h-8 md:w-10 md:h-10" />
        <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-green-500 to-yellow-400 bg-clip-text text-transparent">
          PRITHU
        </h1>
      </div>
 
      {/* Search - Hidden on mobile */}
      <div className="hidden sm:flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-400 bg-gray-50 outline-none"
          />
        </div>
      </div>
 
      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Create Post */}
          <HeaderIcon Icon={Plus} onClick={() => setIsCreatePostOpen(true)} />
 
          {/* Reels Toggle */}
          <HeaderIcon Icon={Video} onClick={handleReelClick} active={isReelsActive} />
 
          {/* Notifications */}
          <div ref={notificationRef} className="relative">
            <HeaderIcon Icon={BellRing} badge={notifCount} onClick={handleBellClick} />
            <NotificationDropdown
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              onUpdateCount={fetchNotificationCount}
            />
          </div>
        </div>
 
        {/* Mobile Actions */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Mobile Notifications */}
          <div ref={notificationRef} className="relative">
            <HeaderIcon Icon={BellRing} badge={notifCount} onClick={handleBellClick} />
            <NotificationDropdown
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              onUpdateCount={fetchNotificationCount}
            />
          </div>
 
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((p) => !p)}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
 
        {/* Profile Dropdown - Desktop Only */}
        <div ref={dropdownRef} className="relative hidden sm:flex items-center gap-2">
          <motion.button
            onClick={() => setDropdownOpen((p) => !p)}
            className={`flex items-center gap-2 rounded-lg px-2 py-1 transition-all duration-300 ${
              dropdownOpen ? "text-gray-800" : "text-gray-700"
            }`}
            whileTap={{ scale: 0.97 }}
          >
            <span className="font-medium">
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
                className="absolute right-0 top-12 w-56 bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-2xl shadow-lg backdrop-blur-sm"
              >
                {navItems.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeAll}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-green-100 hover:to-yellow-50 rounded-md transition"
                  >
                    <Icon className="w-4 h-4 text-green-600" />
                    {label}
                  </NavLink>
                ))}
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-md transition w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
 
      {/* Mobile Menu - Full Width */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-full bg-white shadow-2xl z-50 sm:hidden"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-yellow-50">
              <div className="flex items-center gap-3">
                <ProfileAvatar user={user} />
                <div>
                  <p className="font-semibold text-gray-900">{user?.userName || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.email || ""}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
 
            {/* Mobile Menu Content */}
            <div className="p-4 space-y-2 h-[calc(100vh-80px)] overflow-y-auto">
              {/* Mobile Actions */}
              <div className="flex gap-2 pb-4 border-b border-gray-200">
                <button
                  onClick={() => {
                    setIsCreatePostOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-yellow-400 text-white rounded-lg font-medium"
                >
                  <Plus className="w-5 h-5" />
                  Create Post
                </button>
                <button
                  onClick={() => {
                    handleReelClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${
                    isReelsActive
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Video className="w-5 h-5" />
                  Reels
                </button>
              </div>
 
              {/* Navigation Items */}
              <div className="space-y-1">
                {navItems.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-green-50 rounded-lg transition"
                  >
                    <Icon className="w-5 h-5 text-green-600" />
                    <span className="font-medium">{label}</span>
                  </NavLink>
                ))}
              </div>
 
              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left mt-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
 
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
 
      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </motion.header>
  );
}
 
/* ✅ HeaderIcon component */
const HeaderIcon = ({ Icon, onClick, badge, active }) => (
  <button
    onClick={onClick}
    className={`relative p-2 rounded-full transition-all duration-300 ${
      active ? "bg-green-100 ring-2 ring-green-400" : "hover:bg-gray-100"
    }`}
  >
    <Icon
      className={`w-5 h-5 transition-all ${
        active ? "text-green-700 scale-110" : "text-green-600"
      }`}
    />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);
 
/* ✅ Avatar component */
const ProfileAvatar = ({ user }) => {
  const fallback = user?.displayName?.[0]?.toUpperCase() || "U";
  return user?.profileAvatar ? (
    <img
      src={user.profileAvatar}
      alt="Avatar"
      className="w-8 h-8 md:w-9 md:h-9 rounded-full object-cover border-2 border-green-200"
    />
  ) : (
    <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-green-100 flex items-center justify-center text-sm text-green-600 font-bold border-2 border-green-200">
      {fallback}
    </div>
  );
};
 