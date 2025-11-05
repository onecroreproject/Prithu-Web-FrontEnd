// ✅ src/components/Header.jsx
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
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
} from "lucide-react";
import debounce from "lodash.debounce";
import PrithuLogo from "../assets/prithu_logo.webp";
import NotificationDropdown from "../components/NotificationComponet/notificationDropdwon";
import api from "../api/axios";
import CreatePostModal from "../components/CreatePostModal";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/reels", label: "Reels", Icon: Video },
  { to: "/subscriptions", label: "Subscriptions", Icon: BellRing },
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/referral", label: "Referral", Icon: Gift },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function Header() {
  const {
    user,
    token,
    logout,
    socketConnected,
    socketRef,
    fetchUserProfile,
  } = useAuth();

  const [notifCount, setNotifCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* ---------------------- 🧠 Fetch User Profile on Mount ---------------------- */
  useEffect(() => {
    if (token) {
      fetchUserProfile();
    }
  }, [token]);

  // Re-fetch when socket reconnects (useful after auto-login)
  useEffect(() => {
    if (socketConnected && token) {
      console.log("🔁 Socket connected, refreshing profile...");
      fetchUserProfile();
    }
  }, [socketConnected]);

  /* ---------------------- 🔔 Fetch Notification Count --------------------- */
  const fetchNotificationCount = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/api/get/user/all/notification", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const notifications = Array.isArray(data)
        ? data
        : data?.notifications || [];

      const unreadCount = notifications.filter((n) => !n.isRead).length;
      setNotifCount(unreadCount);
    } catch (err) {
      console.error("❌ Failed to load notifications:", err);
    }
  }, [token]);

  const debounceFetchNotifications = useMemo(
    () => debounce(fetchNotificationCount, 800),
    [fetchNotificationCount]
  );

  /* --------------------------- 🧩 Socket Setup --------------------------- */
  useEffect(() => {
    if (!socketRef?.current || !socketConnected) return;

    const socket = socketRef.current;

    socket.on("notification:new", debounceFetchNotifications);
    socket.on("connect", () => console.log("✅ Header listening: socket connected"));
    socket.on("disconnect", () => console.warn("⚠️ Socket disconnected (Header)"));

    fetchNotificationCount();

    return () => {
      socket.off("notification:new", debounceFetchNotifications);
    };
  }, [socketConnected, socketRef, debounceFetchNotifications, fetchNotificationCount]);

  /* --------------------------- 🔔 Handle Bell ---------------------------- */
  const handleBellClick = async () => {
    setNotifOpen((prev) => !prev);
    setDropdownOpen(false);

    if (!notifOpen && token) {
      try {
        await api.put(
          "/api/user/read",
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotifCount(0);
      } catch (err) {
        console.error("❌ Failed to mark notifications as read:", err);
      }
    }
  };

  /* -------------------------- ⚙️ Handle Dropdown -------------------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const closeAll = () => {
    setDropdownOpen(false);
    setNotifOpen(false);
    setIsCreatePostOpen(false);
  };

  /* ----------------------------- 🧩 Component ----------------------------- */
  return (
    <motion.header
      className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-6 py-3 shadow-md z-50 transition-all duration-300"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* 🟢 Logo */}
      <motion.div
        className="flex items-center gap-3 cursor-pointer"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 250 }}
      >
        <img
          src={PrithuLogo}
          alt="Prithu Logo"
          className="w-10 h-10 object-contain"
          loading="lazy"
        />
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-yellow-400 bg-clip-text text-transparent">
          PRITHU
        </h1>
      </motion.div>

      {/* 🔍 Search Bar */}
      <div className="flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-50 transition-all duration-200"
          />
        </div>
      </div>

      {/* 🔹 Actions */}
      <div className="flex items-center gap-4 sm:gap-5">
        {/* ➕ Create Post */}
        <IconButton
          Icon={Plus}
          color="blue"
          onClick={() => {
            closeAll();
            setIsCreatePostOpen(true);
          }}
        />

        {/* 🎥 Reels */}
        <IconButton
          Icon={Video}
          color="blue"
          onClick={() => {
            closeAll();
            alert("🎬 Create Reel coming soon!");
          }}
        />

        {/* 🔔 Notifications */}
        <div className="relative">
          <IconButton
            Icon={BellRing}
            color="blue"
            onClick={handleBellClick}
            badge={notifCount}
          />
          <NotificationDropdown
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            onNotifRead={fetchNotificationCount}
          />
        </div>

        {/* 👤 Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => {
              closeAll();
              setDropdownOpen((prev) => !prev);
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition"
          >
            <span className="text-gray-700 font-medium hidden sm:block">
              {user?.displayName || "User"}
            </span>
            <ProfileAvatar user={user} />
          </motion.button>

          {dropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50"
            >
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setDropdownOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-green-500 to-yellow-400 text-white shadow-sm"
                        : "text-gray-700 hover:text-green-600 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </NavLink>
              ))}

              <button
                onClick={() => {
                  logout();
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-left text-gray-700 hover:text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* 🪄 Modal */}
      <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />
    </motion.header>
  );
}

/* 🧩 Subcomponents */

const IconButton = React.memo(({ Icon, color, onClick, badge }) => (
  <motion.button
    whileTap={{ scale: 0.9 }}
    whileHover={{ scale: 1.1 }}
    onClick={onClick}
    aria-label={Icon.name}
    className="group relative"
  >
    <div
      className={`w-10 h-10 rounded-full bg-${color}-50 flex items-center justify-center group-hover:bg-${color}-100 transition ring-2 ring-${color}-200 shadow-sm`}
    >
      <Icon className={`w-5 h-5 text-${color}-600`} />
    </div>
    {badge > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center"
      >
        {badge}
      </motion.span>
    )}
  </motion.button>
));

const ProfileAvatar = React.memo(({ user }) => {
  if (user?.profileAvatar) {
    return (
      <img
        src={user.profileAvatar}
        alt="Profile"
        className="w-8 h-8 rounded-full ring-2 ring-gray-200 object-cover shadow-sm"
        loading="lazy"
      />
    );
  }
  const fallback = user?.displayName?.charAt(0).toUpperCase() || "U";
  return (
    <div className="w-8 h-8 rounded-full bg-gray-200 ring-2 ring-gray-300 flex items-center justify-center shadow-sm">
      <span className="text-gray-500 text-xs font-medium">{fallback}</span>
    </div>
  );
});
