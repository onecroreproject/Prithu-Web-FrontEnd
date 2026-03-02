import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Fragment
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import {
  BellRing, Home, Video, Image, User, Settings, LogOut, Plus, Menu, X,
  Gift, Activity, HelpCircle, MessageSquare, Heart, MessageCircle
} from "lucide-react";
import debounce from "lodash.debounce";
import PrithuLogo from "../assets/prithu_logo.webp";
import NotificationDropdown from "../components/NotificationComponet/notificationDropdwon";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useUnreadNotificationCount, useRefreshNotifications } from "../hooks/useNotifications";

// Import User Feedback and Report Pages
import UserFeedbackPage from "../components/UserFeedbackPage";
import ReportPage from "../components/ReportPage";
import ReferralPromoPopup from "./ReferralPromoPopup";
import ComingSoonPopup from "./ComingSoonPopup";



export default function Header() {
  const { user, token, logout, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  // Notification count from React Query hook
  const notifCount = useUnreadNotificationCount(token);
  const refreshNotifications = useRefreshNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isReelsActive, setIsReelsActive] = useState(location.pathname === "/home/reels");
  const [isImagesActive, setIsImagesActive] = useState(location.pathname === "/home/images");
  const [isPromoOpen, setIsPromoOpen] = useState(false);
  const [promoTitle, setPromoTitle] = useState("");
  const [promoRedirect, setPromoRedirect] = useState("");
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [comingSoonData, setComingSoonData] = useState({ title: "", icon: Gift });

  const REFERRAL_LAUNCH_DATE = new Date('2026-03-01T00:00:00');

  const location = useLocation();

  useEffect(() => {
    const now = new Date();
    if (now < REFERRAL_LAUNCH_DATE) {
      if (location.pathname === "/home/referral") {
        setPromoTitle("Referral Program");
        setIsPromoOpen(true);
      } else if (location.pathname === "/home/subscriptions") {
        setPromoTitle("Subscriptions Program");
        setIsPromoOpen(true);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    setIsReelsActive(location.pathname === "/home/reels");
    setIsImagesActive(location.pathname === "/home/images");
  }, [location.pathname]);

  // refs
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Enhanced navItems with icons
  const navItems = [
    { to: "/home", label: "Home", Icon: Home, desc: "Your feed" },
    { to: "/home/profile", label: "Profile", Icon: User, desc: "View your profile" },
    {
      to: "/home/subscriptions",
      label: "Subscriptions",
      Icon: BellRing,
      desc: "Manage subscriptions"
    },
    {
      to: "/home/referral",
      label: "Referral",
      Icon: Gift,
      desc: "Referral program"
    },
    // Settings removed as per request
    {
      to: "/home/feedback-support",
      label: "Feedback & Support",
      Icon: MessageSquare,
      desc: "Share feedback or report issues"
    },
    { to: "/home/activity", label: "My Activity", Icon: Activity, desc: "Your activity log" },
    { to: "/home/reels", label: "Reels", Icon: Video, desc: "Watch short videos", isReels: true },
    { to: "/home/images", label: "Image Feed", Icon: Image, desc: "Browse images only", isImages: true },
    { to: "/home/birthday", label: "Birthday", Icon: Gift, desc: "Birthday greetings" },
    { to: "/home/anniversary", label: "Anniversary", Icon: Heart, desc: "Anniversary wishes" },
    { to: "/home/politics", label: "Politics", Icon: MessageCircle, desc: "Politics feeds", isComingSoon: true }
  ];

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  // Real-time notification updates
  useEffect(() => {
    const handleNewNotif = e => {
      const notif = e.detail;


      toast.success(`🔔 ${notif.title || "New notification!"}`, {
        duration: 4000,
        position: "top-right",
      });

      refreshNotifications();
    };

    const handleNotifRead = () => {
      refreshNotifications();
    };

    const handlePulse = (e) => {
      const pulse = e.detail;
      // Show rich creative toast
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <img
                  className="h-10 w-10 rounded-full"
                  src={pulse.thumbnail || "/default-video-thumbnail.png"}
                  alt="New Content"
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  New Fresh Content! 🔥
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Check out this new feed! Download it and share 🔥❤️
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                setNotifOpen(true);
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              View
            </button>
          </div>
        </div>
      ), { duration: 5000, position: "top-right" });

      // Refresh the query to update the count
      refreshNotifications();
    };

    document.addEventListener("socket:newNotification", handleNewNotif);
    document.addEventListener("socket:notificationRead", handleNotifRead);
    document.addEventListener("socket:notificationPulse", handlePulse);

    return () => {
      document.removeEventListener("socket:newNotification", handleNewNotif);
      document.removeEventListener("socket:notificationRead", handleNotifRead);
      document.removeEventListener("socket:notificationPulse", handlePulse);
    };
  }, [refreshNotifications]);

  // Outside click handlers
  useEffect(() => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileMenuOpen(false);
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Navigation handlers
  const handleReelClick = () => {
    const nextState = !isReelsActive;
    setIsReelsActive(nextState);
    if (nextState) setIsImagesActive(false);
    navigate("/home");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("toggleReels", { detail: { isActive: nextState } })
      );
    }, 50);
  };

  const handleImageClick = () => {
    const nextState = !isImagesActive;
    setIsImagesActive(nextState);
    if (nextState) setIsReelsActive(false);
    navigate("/home");
    setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent("toggleImages", { detail: { isActive: nextState } })
      );
    }, 50);
  };

  const handlePortfolioClick = () => {
    window.open(`/portfolio/${user?.userName || ""}`, "_blank", "noopener,noreferrer");
  };

  const closeAll = () => {
    setDropdownOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
  };

  const handleBellClick = () => {
    setNotifOpen(p => !p);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  };



  // Handle nav item clicks
  const handleNavItemClick = (item, e) => {
    const isPromoItem = item.label === "Referral" || item.label === "Subscriptions";
    const now = new Date();

    if (isPromoItem && now < REFERRAL_LAUNCH_DATE) {
      setPromoTitle(`${item.label} Program`);
      setPromoRedirect(item.to);
      setIsPromoOpen(true);
      closeAll();
      return;
    }

    if (item.isReels) {
      handleReelClick();
    } else if (item.isImages) {
      handleImageClick();
    } else if (item.isComingSoon) {
      setComingSoonData({ title: item.label, icon: item.Icon });
      setIsComingSoonOpen(true);
    } else if (item.onClick) {
      item.onClick(e);
    } else {
      navigate(item.to);
    }
    closeAll();
  };

  return (
    <Fragment>
      {/* MAIN HEADER */}
      <motion.header
        className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-6 py-2.5 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Left Section: Logo */}
        <div className="flex items-center gap-3 md:gap-4 shrink-0">
          {/* Logo */}
          <div
            onClick={() => {
              if (window.location.pathname === "/home") {
                localStorage.setItem("scrollToFeed", "true");
                window.location.reload();
              } else {
                navigate("/home");
              }
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <motion.div whileHover={{ rotate: 5 }} whileTap={{ scale: 0.95 }}>
              <img
                src={PrithuLogo}
                alt="Prithu Logo"
                className="w-8 h-8 md:w-9 md:h-9 transition-transform duration-200 group-hover:scale-105"
              />
            </motion.div>
            <motion.h1
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent hidden md:block"
              whileHover={{ scale: 1.05 }}
            >
              PRITHU
            </motion.h1>
          </div>
        </div>

        <div className="flex-1" />

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Create Post */}
            <motion.button
              onClick={() => setIsCreatePostOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm font-medium">Create</span>
            </motion.button>

            {/* Notification */}
            <div ref={notificationRef} className="relative">
              <motion.button
                onClick={handleBellClick}
                className={`relative p-2.5 rounded-lg transition-all duration-200 ${notifOpen
                  ? "bg-blue-100 ring-2 ring-blue-200"
                  : "hover:bg-gray-100"
                  }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <BellRing className={`w-5 h-5 ${notifOpen ? "text-blue-600" : "text-gray-600"}`} />
                {notifCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-start font-medium shadow"
                  >
                    {notifCount > 99 ? '99+' : notifCount}
                  </motion.span>
                )}
              </motion.button>
            </div>

            {/* Portfolio Button (Desktop) */}
            <motion.button
              onClick={handlePortfolioClick}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <User className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Portfolio</span>
            </motion.button>

            {/* Logout Button */}
            <motion.button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </motion.button>

            {/* Profile Dropdown */}
            <div ref={dropdownRef} className="relative">
              <motion.button
                onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ProfileAvatar user={user} />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 leading-tight truncate max-w-[120px]">
                    {user?.userName || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {user?.userEmail?.split('@')[0] || "Welcome"}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: dropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute right-0 top-12 w-72 bg-white border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm z-[150] overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-blue-50/30">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar user={user} size="lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user?.name || user?.userName || "User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.userEmail || "Welcome to Prithu"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-2 space-y-1">
                      {navItems.map((item) => {
                        const isPromoItem = item.label === "Referral" || item.label === "Subscriptions";
                        const now = new Date();
                        const showPromo = isPromoItem && now < REFERRAL_LAUNCH_DATE;

                        return (item.onClick || item.isReels || item.isImages || showPromo) ? (
                          <button
                            key={item.label}
                            onClick={(e) => handleNavItemClick(item, e)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${(item.isReels && isReelsActive) || (item.isImages && isImagesActive)
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                              }`}
                          >
                            <div className={`p-1.5 rounded-lg ${(item.isReels && isReelsActive) ? "bg-pink-100" :
                              (item.isImages && isImagesActive) ? "bg-blue-100" : "bg-gray-100"
                              }`}>
                              <item.Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                            </div>
                          </button>
                        ) : (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={closeAll}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-50"
                              }`
                            }
                          >
                            <div className="p-1.5 rounded-lg bg-gray-100">
                              <item.Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.label}</p>
                              <p className="text-xs text-gray-500 truncate">{item.desc}</p>
                            </div>
                          </NavLink>
                        );
                      })}
                    </div>

                    {/* Logout */}
                    <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                      <button
                        onClick={logout}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            {/* Notification for mobile */}
            <div ref={notificationRef} className="relative">
              <motion.button
                onClick={handleBellClick}
                className={`relative p-2 rounded-lg transition-all ${notifOpen
                  ? "bg-blue-100 ring-2 ring-blue-200"
                  : "hover:bg-gray-100"
                  }`}
              >
                <BellRing className={`w-5 h-5 ${notifOpen ? "text-blue-600" : "text-gray-600"}`} />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-start font-medium">
                    {notifCount > 99 ? '99+' : notifCount}
                  </span>
                )}
              </motion.button>
            </div>

            {/* Hamburger Menu */}
            <motion.button
              onClick={() => setMobileMenuOpen(p => !p)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-blue-600" />
              ) : (
                <Menu className="w-5 h-5 text-blue-600" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Notification Dropdown */}
      <NotificationDropdown
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        onUpdateCount={refreshNotifications}
        toggleRef={notificationRef}
      />

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-50/30">
              <div className="flex items-center gap-3">
                <ProfileAvatar user={user} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">{user?.userName || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.userEmail || "Welcome"}</p>
                </div>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="p-4 space-y-1 flex-1 overflow-y-auto">
              {/* Quick Actions */}
              <div className="grid grid-cols-1 gap-2 mb-4">
                <button
                  onClick={() => {
                    handlePortfolioClick();
                    setMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm">Portfolio</span>
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 mb-4">
                {navItems.map((item) => {
                  const isPromoItem = item.label === "Referral" || item.label === "Subscriptions";
                  const now = new Date();
                  const showPromo = isPromoItem && now < REFERRAL_LAUNCH_DATE;

                  return (item.onClick || item.isReels || item.isImages || showPromo) ? (
                    <button
                      key={item.label}
                      onClick={(e) => {
                        handleNavItemClick(item, e);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left ${(item.isReels && isReelsActive) || (item.isImages && isImagesActive)
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      <div className={`p-2 rounded-lg ${(item.isReels && isReelsActive) ? "bg-pink-100" :
                        (item.isImages && isImagesActive) ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                        <item.Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </button>
                  ) : (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                          ? "bg-blue-50 text-blue-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                        }`
                      }
                    >
                      <div className="p-2 rounded-lg bg-gray-100">
                        <item.Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </NavLink>
                  );
                })}
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-lg transition-all font-medium mt-4 border-t border-gray-100"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}



      {/* Create Post Modal (You'll need to import/create this) */}
      {/* <CreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      /> */}

      <ReferralPromoPopup
        isOpen={isPromoOpen}
        onClose={() => setIsPromoOpen(false)}
        title={promoTitle}
      />

      <ComingSoonPopup
        isOpen={isComingSoonOpen}
        onClose={() => setIsComingSoonOpen(false)}
        title={comingSoonData.title}
        icon={comingSoonData.icon}
        description="exiting content comming for you with existing image"
      />

    </Fragment>
  );
}

/* ✅ Profile Avatar component */
const ProfileAvatar = ({ user, size = "md" }) => {
  const { onlineUsers } = useAuth();
  const isOnline = onlineUsers.has(user?._id || user?.userId);

  const fallback = user?.displayName?.[0]?.toUpperCase() || user?.userName?.[0]?.toUpperCase() || "U";
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base"
  };

  const dotSizes = {
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3"
  };

  return (
    <div className="relative">
      {user?.profileAvatar ? (
        <motion.img
          src={user.profileAvatar}
          alt="Avatar"
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-blue-200 shadow-sm`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
      ) : (
        <motion.div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200 shadow-sm`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {fallback}
        </motion.div>
      )}

      {/* Online Status Dot */}
      {isOnline && (
        <span className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-green-500 border-2 border-white rounded-full shadow-sm`}></span>
      )}
    </div>
  );
};

