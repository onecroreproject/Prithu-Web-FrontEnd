// src/components/Header.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
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
import { io } from "socket.io-client";
import PrithuLogo from "../assets/prithu_logo.webp";
import { AuthContext } from "../context/AuthContext";
import NotificationDropdown from "../components/NotificationComponet/notificationDropdwon";
import api from "../api/axios";
import CreatePostModal from "../components/CreatePostModal";

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
  const { user, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isCreateReelOpen, setIsCreateReelOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Socket & Notifications
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
      auth: { token },
      transports: ["websocket"],
    });

    newSocket.on("connect", () => console.log("Socket connected"));
    newSocket.on("notification:new", () => fetchNotificationCount());
    setSocket(newSocket);

    return () => newSocket.disconnect();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await api.get("/api/user/all/notification");
      const notifications = Array.isArray(res.data)
        ? res.data
        : res.data?.notifications || [];
      const unreadCount = notifications.filter((n) => !n.isRead).length;
      setNotifCount(unreadCount);
    } catch (err) {
      console.error("Failed to load notification count:", err);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const handleBellClick = async () => {
    setNotifOpen((prev) => !prev);
    setDropdownOpen(false);
    if (!notifOpen) {
      try {
        await api.put(
          "/api/user/read",
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setNotifCount(0);
      } catch (err) {
        console.error("Failed to mark all as read:", err);
      }
    }
  };

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
    setIsCreateReelOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-6 py-3 shadow-md z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <img src={PrithuLogo} alt="Prithu Logo" className="w-10 h-10" />
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-green-500 to-yellow-400 bg-clip-text text-transparent">
          PRITHU
        </h1>
      </div>

      {/* Center: Search Bar */}
      <div className="flex flex-1 justify-center px-4">
        <div className="relative w-full max-w-2xl">
          <Search className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="w-full rounded-full pl-10 pr-4 py-2 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-gray-100"
          />
        </div>
      </div>

      {/* Center-Right: + Post & Reels Icons (ALL BLUE) */}
      <div className="flex items-center gap-4">
        {/* + CREATE POST */}
        <button
          onClick={() => {
            closeAll();
            setIsCreatePostOpen(true);
          }}
          className="group"
          aria-label="Create Post"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition ring-2 ring-blue-200">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
        </button>

        {/* REELS ICON (NOW BLUE) */}
        <button
          onClick={() => {
            closeAll();
            setIsCreateReelOpen(true);
          }}
          className="group"
          aria-label="Create Reel"
        >
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition ring-2 ring-blue-200">
            <Video className="w-5 h-5 text-blue-600" />
          </div>
        </button>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-6 relative">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleBellClick}
            className="group"
            aria-label="Notifications"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition ring-2 ring-blue-200">
              <BellRing className="w-5 h-5 text-blue-600" />
            </div>
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {notifCount}
              </span>
            )}
          </button>

          <NotificationDropdown
            isOpen={notifOpen}
            onClose={() => setNotifOpen(false)}
            socket={socket}
            onNotifRead={() => fetchNotificationCount()}
          />
        </div>

        {/* Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              closeAll();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition"
          >
            <span className="text-gray-600 font-medium">
              {user?.displayName || "User"}
            </span>
            {user?.profileAvatar ? (
              <img
                src={user.profileAvatar}
                alt="Profile"
                className="w-8 h-8 rounded-full ring-2 ring-gray-200 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-200 ring-2 ring-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-xs font-medium">
                  {user?.displayName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50">
              {navItems.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setDropdownOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-300 ${
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
            </div>
          )}
        </div>
      </div>

      {/* MODALS */}
      <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      {/* Optional: Reel Modal */}
      {/* <CreateReelModal open={isCreateReelOpen} onClose={() => setIsCreateReelOpen(false)} /> */}
    </header>
  );
}