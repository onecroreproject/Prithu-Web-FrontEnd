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
  BellRing, Search, Home, Video, User, Gift, Settings, LogOut, Plus, Menu, X,
  Activity, MessageCircle, Heart, UserPlus, Eye, Share2, HelpCircle, MessageSquare, Briefcase
} from "lucide-react";
import debounce from "lodash.debounce";
import PrithuLogo from "../assets/prithu_logo.webp";
import api from "../api/axios";
import CreatePostModal from "../components/CreatePostModal";
import CasualInterestPopup from "../components/intrestedPop-up";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useUnreadNotificationCount, useRefreshNotifications } from "../hooks/useNotifications";

// Import search components
import SearchBar from "../components/HeaderComponent/searchBar";
import MobileSearchBar from "../components/HeaderComponent/mobileSearchBar";
import ComingSoonPopup from "./ComingSoonPopup";

// Import the existing NotificationDropdown for mobile
import NotificationDropdown from "../components/NotificationComponet/notificationDropdwon";

// --- constants ---
const SEARCH_HISTORY_KEY = "prithu_search_history_v1";
const MAX_HISTORY = 12;

export default function Header() {
  const { user, token, logout, fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Notification count from React Query hook
  const notifCount = useUnreadNotificationCount(token);
  const refreshNotifications = useRefreshNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isReelsActive, setIsReelsActive] = useState(false);

  // Posting permission states
  const [postStatus, setPostStatus] = useState(null);
  const [loadingPostStatus, setLoadingPostStatus] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);

  // Coming Soon Popup States
  const [showReferralPopup, setShowReferralPopup] = useState(false);
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [showHelpPage, setShowHelpPage] = useState(false);

  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [selectedNotif, setSelectedNotif] = useState(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({
    categories: [], people: [], jobs: []
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [history, setHistory] = useState([]);
  const [trending, setTrending] = useState([]);

  // refs
  const mobileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const notifPanelRef = useRef(null);

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  // Check posting status on component mount
  useEffect(() => {
    checkPostStatus();
  }, []);

  const checkPostStatus = async () => {
    try {
      setLoadingPostStatus(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/post/allowed/status', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setPostStatus(response.data.status);
      }
    } catch (error) {
      console.error("Error checking post status:", error);
      setPostStatus("notallow");
    } finally {
      setLoadingPostStatus(false);
    }
  };

  // Handle Create Post Click with permission check
  const handleCreatePostClick = useCallback(async () => {
    if (loadingPostStatus) return;

    if (postStatus === "allow") {
      setIsCreatePostOpen(true);
    } else if (postStatus === "interest") {
      setInterestModalOpen(true);
    } else if (postStatus === "notallow") {
      setInterestModalOpen(true);
    } else {
      await checkPostStatus();
      setInterestModalOpen(true);
    }

    setMobileMenuOpen(false);
  }, [postStatus, loadingPostStatus]);

  // Handle interest modal response
  const handleInterestsSelected = useCallback((status) => {
    console.log("Interest status:", status);

    if (status === "allow") {
      setPostStatus("allow");
      setIsCreatePostOpen(true);
      toast.success("You can now create posts! 🎉");
    } else if (status === "interest") {
      setPostStatus("interest");
      toast.success("Interest submitted! Admin will review your request.");
      setTimeout(() => {
        checkPostStatus();
      }, 2000);
    } else if (status === "skip") {
      toast.info("You can request posting access anytime");
    }

    setInterestModalOpen(false);
  }, []);

  const handleCloseInterestModal = useCallback(() => {
    console.log("Closing interest modal");
    setInterestModalOpen(false);
  }, []);

  const handleCloseModal = useCallback(() => setIsCreatePostOpen(false), []);

  // Main menu items to show directly in sidebar
  const mainMenuItems = [
    { to: "/home", label: "Home", Icon: Home, desc: "Your feed" },
    { to: "/search", label: "Search", Icon: Search, desc: "Search content" },
    { to: "/home/reels", label: "Reels", Icon: Video, desc: "Watch short videos" },
  ];

  // Profile menu items
  const profileMenuItems = [
    { to: "/home/profile", label: "Profile", Icon: User, desc: "View your profile" },
    { to: "/home/activity", label: "My Activity", Icon: Activity, desc: "Your activity log" },
  ];

  // Settings menu items
  const settingsMenuItems = [
    { to: "/home/settings", label: "Settings", Icon: Settings, desc: "Account settings" },
    {
      to: "/subscriptions",
      label: "Subscriptions",
      Icon: BellRing,
      desc: "Manage subscriptions",
      onClick: (e) => {
        e.preventDefault();
        setShowSubscriptionPopup(true);
      }
    },
    {
      to: "/referral",
      label: "Referral",
      Icon: Gift,
      desc: "Referral program",
      onClick: (e) => {
        e.preventDefault();
        setShowReferralPopup(true);
      }
    },
    {
      to: "/home/help",
      label: "Help",
      Icon: HelpCircle,
      desc: "Get help and support"
    },
    {
      to: "/home/feedback-support",
      label: "Feedback & Support",
      Icon: MessageSquare,
      desc: "Share feedback or report issues"
    },
  ];

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get("/api/get/user/all/notification", authHeader);
      console.log(res.data)
      const list = res.data?.notifications || [];
      setNotifications(list);
    } catch (err) {
      console.error("❌ Fetch error:", err);
    }
  }, [token]);

  // Live socket updates
  useEffect(() => {
    const handleNewNotif = (e) => {
      const notif = e.detail;
      setNotifications((prev) => [notif, ...prev]);
      refreshNotifications();

      toast.success(`🔔 ${notif.title || "New notification!"}`, {
        duration: 4000,
        position: "top-right",
      });
    };

    document.addEventListener("socket:newNotification", handleNewNotif);
    return () => document.removeEventListener("socket:newNotification", handleNewNotif);
  }, [refreshNotifications]);

  // Fetch when notification panel opens
  useEffect(() => {
    if (notifOpen) fetchNotifications();
  }, [notifOpen, fetchNotifications]);

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await api.put("/api/mark/all/notification/read", {}, authHeader);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      refreshNotifications();
      toast.success("All notifications marked as read!");
    } catch (err) {
      toast.error("Failed to mark notifications as read");
    }
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      await api.delete("/api/user/delete/all/notification", authHeader);
      setNotifications([]);
      refreshNotifications();
      toast.success("All notifications deleted");
    } catch (err) {
      console.error("❌ Delete all error:", err);
      toast.error("Failed to delete all notifications");
    }
  };

  // Mark single notification as read
  const handleNotificationClick = async (notif) => {
    setSelectedNotif({ ...notif });

    if (!notif.isRead) {
      try {
        await api.put("/api/user/read", { notificationId: notif._id }, authHeader);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notif._id ? { ...n, isRead: true } : n
          )
        );
        refreshNotifications();
      } catch (err) {
        console.error("❌ Mark read error:", err);
      }
    }
  };

  // Delete individual notification
  const handleDeleteNotification = async (notifId) => {
    try {
      await api.delete("/api/user/delete/notification", {
        ...authHeader,
        data: { notificationId: notifId },
      });
      setNotifications((prev) => prev.filter((n) => n._id !== notifId));
      refreshNotifications();
      toast.success("Notification deleted successfully");
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast.error("Failed to delete notification");
    }
  };

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Helper function to get notification icon
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'job_status_update':
        return <Briefcase className="w-4 h-4 text-blue-500" />;
      case 'like':
      case 'like_post':
        return <Heart className="w-4 h-4 text-pink-500" />;
      case 'comment':
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'share':
      case 'shared':
      case 'repost':
        return <Share2 className="w-4 h-4 text-green-600" />;
      case 'story_like':
        return <Heart className="w-4 h-4 text-purple-500" />;
      case 'story_view':
        return <Eye className="w-4 h-4 text-blue-400" />;
      default:
        return <BellRing className="w-4 h-4 text-gray-500" />;
    }
  };

  // Helper function to format time
  const formatTime = (timestamp) => {
    if (!timestamp) return "Just now";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  // Group notifications by time
  const groupedNotifications = useMemo(() => {
    const groups = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: []
    };

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - 7);
    const monthStart = new Date(todayStart);
    monthStart.setDate(monthStart.getDate() - 30);

    notifications.forEach(notif => {
      const notifDate = new Date(notif.createdAt || notif.timestamp || now);

      if (notifDate >= todayStart) {
        groups.Today.push(notif);
      } else if (notifDate >= yesterdayStart) {
        groups.Yesterday.push(notif);
      } else if (notifDate >= weekStart) {
        groups["This Week"].push(notif);
      } else if (notifDate >= monthStart) {
        groups["This Month"].push(notif);
      } else {
        groups.Older.push(notif);
      }
    });

    // Remove empty groups
    Object.keys(groups).forEach(key => {
      if (groups[key].length === 0) delete groups[key];
    });

    return groups;
  }, [notifications]);

  // Navigation handlers
  const handleReelClick = (e) => {
    if (location.pathname === "/home" || location.pathname === "/") {
      e.preventDefault();
    }
    const nextState = !isReelsActive;
    setIsReelsActive(nextState);
    window.dispatchEvent(new CustomEvent("toggleReels", { detail: { isActive: nextState } }));
  };

  const handleBellClick = () => {
    setNotifOpen(p => !p);
    setMobileMenuOpen(false);
  };

  const closeAllPopups = () => {
    setShowReferralPopup(false);
    setShowSubscriptionPopup(false);
  };

  // Search helpers
  const saveToHistory = text => {
    if (!text || !text.trim()) return;
    const normalized = text.trim();
    const cur = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
    const filtered = cur.filter(s => s !== normalized);
    filtered.unshift(normalized);
    const trimmed = filtered.slice(0, MAX_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
    setHistory(trimmed);
  };

  const clearHistory = () => {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
    setHistory([]);
  };

  const loadHistory = () => {
    try {
      const cur = JSON.parse(localStorage.getItem(SEARCH_HISTORY_KEY) || "[]");
      setHistory(cur.slice(0, MAX_HISTORY));
    } catch {
      setHistory([]);
    }
  };

  const scoreAndFilter = useCallback((query, items = [], keys = ["name"]) => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items
      .map(it => {
        const text = keys.map(k => (it[k] || "")).join(" ").toLowerCase();
        let score = 0;
        if (text === q) score += 100;
        if (text.startsWith(q)) score += 50;
        if (text.includes(q)) score += 20;
        score += Math.max(0, 10 - text.length / 30);
        return { item: it, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(s => s.item);
  }, []);

  useEffect(() => {
    loadHistory();
  }, []);

  const performSearch = useCallback(async q => {
    const qs = (q || "").trim();
    if (!qs) {
      setShowSearchDropdown(false);
      setSearchResults({ categories: [], people: [], jobs: [] });
      return;
    }
    try {
      const { data } = await api.get(
        `/api/global/search?q=${encodeURIComponent(qs)}`
      );
      if (data.success) {
        setSearchResults({
          categories: data.categories || [],
          people: data.people || [],
          jobs: data.jobs || []
        });
        setShowSearchDropdown(true);
      }
    } catch (err) {
      console.error("❌ Global Search Failed:", err);
    }
  }, []);

  const debouncedSearch = useMemo(
    () => debounce(performSearch, 300),
    [performSearch]
  );

  const scoredResults = useMemo(() => {
    const q = (searchQuery || "").trim();
    return {
      categories: scoreAndFilter(q, searchResults.categories || [], ["name"]),
      people: scoreAndFilter(q, searchResults.people || [], ["userName", "name"]),
      jobs: scoreAndFilter(q, searchResults.jobs || [], ["title", "companyName"])
    };
  }, [searchResults, searchQuery, scoreAndFilter]);

  const handleSelectResult = (type, payload) => {
    const text =
      type === "people"
        ? payload.userName || payload.name || ""
        : type === "categories"
          ? payload.name || ""
          : type === "jobs"
            ? payload.title || ""
            : payload;

    saveToHistory(text);

    if (type === "people") {
      navigate(`/user/profile/${payload.userName}`);
    } else if (type === "categories") {
      navigate(`/category/${payload._id}`);
    } else if (type === "profile") {
      navigate(`/category/${payload._id}`);
    } else if (type === "jobs") {
      navigate(`/job/view/${payload._id}`);
    } else if (type === "hashtag") {
      navigate(`/hashtag/${encodeURIComponent(payload)}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(text)}`);
    }

    setShowSearchDropdown(false);
    setMobileSearchOpen(false);
    setSearchQuery("");
  };

  const handleHistoryClick = text => {
    setSearchQuery(text);
    debouncedSearch(text);
    setShowSearchDropdown(true);
  };

  const handleTrendingClick = tag => {
    setSearchQuery(`#${tag.tag || tag}`);
    performSearch(tag.tag || tag);
    saveToHistory(`#${tag.tag || tag}`);
    navigate(`/hashtag/${encodeURIComponent(tag.tag || tag)}`);
    setShowSearchDropdown(false);
    setMobileSearchOpen(false);
  };

  const handleKeyDown = e => {
    if (e.key === "Enter") {
      const tab = activeTab;
      if (tab === "people" && scoredResults.people[0]) {
        handleSelectResult("people", scoredResults.people[0]);
        return;
      }
      if (tab === "categories" && scoredResults.categories[0]) {
        handleSelectResult("categories", scoredResults.categories[0]);
        return;
      }
      if (tab === "jobs" && scoredResults.jobs[0]) {
        handleSelectResult("jobs", scoredResults.jobs[0]);
        return;
      }
      saveToHistory(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setMobileSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
    closeAllPopups();
  };

  const handlePortfolioClick = (e) => {
    e.preventDefault();
    if (user?.userName) {
      const portfolioUrl = `${window.location.origin}/portfolio/${user.userName}`;
      window.open(portfolioUrl, '_blank', 'noopener,noreferrer');
    } else {
      toast.error("Username not found. Please check your profile.");
    }
  };

  // Post status badge for Create Post button
  const getPostStatusBadge = () => {
    if (loadingPostStatus) {
      return (
        <span className="text-xs text-gray-500 ml-2">
          Checking...
        </span>
      );
    }

    switch (postStatus) {
      case "allow":
        return (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">
            ✓ Ready
          </span>
        );
      case "interest":
        return (
          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full ml-2">
            ⏳ Pending
          </span>
        );
      case "notallow":
        return (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full ml-2">
            🔒 Request access
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Fragment>
      {/* DESKTOP SIDEBAR - UPDATED WIDTH */}
      <motion.aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-[240px] bg-white border-r border-gray-100 z-50"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Logo Section with Notification - IMPROVED SPACING */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div
            onClick={() => {
              if (window.location.pathname === "/") {
                localStorage.setItem("scrollToFeed", "true");
                window.location.reload();
              } else {
                navigate("/");
              }
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <motion.div whileHover={{ rotate: 5 }} whileTap={{ scale: 0.95 }}>
              <img
                src={PrithuLogo}
                alt="Prithu Logo"
                className="w-8 h-8 transition-transform duration-200 group-hover:scale-105"
              />
            </motion.div>
            <motion.h1
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              PRITHU
            </motion.h1>
          </div>

          {/* Notification Icon */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleBellClick}
              className={`p-2 rounded-lg transition-all duration-200 ${notifOpen
                ? "bg-blue-100 ring-2 ring-blue-200"
                : "hover:bg-gray-100"
                }`}
            >
              <BellRing className={`w-5 h-5 ${notifOpen ? "text-blue-600" : "text-gray-600"}`} />
              {notifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-4 flex items-center justify-center px-0.5">
                  {notifCount > 99 ? '99+' : notifCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Instagram-like Left Sidebar Notification Panel */}
        <AnimatePresence>
          {notifOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 z-40"
                onClick={() => setNotifOpen(false)}
              />

              {/* Notification Panel */}
              <motion.div
                ref={notifPanelRef}
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                exit={{ x: -320 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed left-0 top-0 h-screen w-[320px] bg-white shadow-2xl z-50 border-r border-gray-200"
              >
                {/* Panel Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                    <button
                      onClick={() => setNotifOpen(false)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-start gap-2 mt-3">
                    <button
                      onClick={markAllAsRead}
                      className="flex-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>

                {/* Notification List */}
                <div className="h-[calc(100vh-120px)] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BellRing className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications yet</h3>
                      <p className="text-gray-500 text-sm">When you get notifications, they'll show up here</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {Object.entries(groupedNotifications).map(([groupName, groupNotifications]) => (
                        <div key={groupName} className="py-2">
                          {/* Group Header */}
                          <div className="px-4 py-2">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                              {groupName}
                            </h3>
                          </div>

                          {/* Group Notifications */}
                          {groupNotifications.map((notif) => {
                            const isJobStatusUpdate = notif.type === "JOB_STATUS_UPDATE";
                            const isRegularNotification = notif.sender || notif.feedInfo;

                            let senderName = "System";
                            let senderAvatar = null;
                            let actionText = notif.message || notif.title || "New notification";
                            let feedImage = null;

                            if (isJobStatusUpdate) {
                              const jobInfo = notif.job || {};
                              senderName = jobInfo.companyName || "Company";
                              senderAvatar = jobInfo.companyLogo;
                              actionText = notif.message || `Your job application status has been updated`;
                              feedImage = jobInfo.companyLogo;
                            } else if (isRegularNotification) {
                              const sender = notif.sender || {};
                              const feed = notif.feedInfo || {};
                              senderName = sender.userName || sender.displayName || sender.name || notif.senderName || "User";
                              senderAvatar = sender.profileAvatar || sender.avatar;
                              feedImage = feed.contentUrl || notif.image;

                              const isLike = notif.type === "LIKE_POST" || notif.type?.toLowerCase()?.includes("like");
                              const isFollow = notif.type?.toLowerCase()?.includes("follow");
                              const isComment = notif.type?.toLowerCase()?.includes("comment");

                              if (isLike) actionText = "liked your post";
                              if (isFollow) actionText = "started following you";
                              if (isComment) actionText = "commented on your post";
                            }

                            return (
                              <motion.div
                                key={notif._id || notif.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${!notif.isRead ? "bg-blue-50/50" : ""
                                  }`}
                                onClick={() => handleNotificationClick(notif)}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Avatar */}
                                  <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                                      {senderAvatar ? (
                                        <img
                                          src={senderAvatar}
                                          alt={senderName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : isJobStatusUpdate ? (
                                        <Briefcase className="w-5 h-5 text-blue-600" />
                                      ) : (
                                        <span className="text-blue-600 font-semibold">
                                          {(senderName[0] || "U").toUpperCase()}
                                        </span>
                                      )}
                                    </div>
                                    {/* Notification Type Icon */}
                                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                                      {isJobStatusUpdate ? (
                                        <Briefcase className="w-4 h-4 text-blue-500" />
                                      ) : (
                                        getNotificationIcon(notif.type)
                                      )}
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <p className="text-sm font-medium text-gray-900">
                                          {isJobStatusUpdate ? `📌 ${senderName}` : senderName}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-0.5">
                                          {actionText}
                                          {isJobStatusUpdate && notif.job?.status && (
                                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${notif.job.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                              notif.job.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                              }`}>
                                              {notif.job.status.charAt(0).toUpperCase() + notif.job.status.slice(1)}
                                            </span>
                                          )}
                                        </p>
                                        {/* Job details for job status updates */}
                                        {isJobStatusUpdate && notif.job?.jobTitle && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            Position: <span className="font-medium">{notif.job.jobTitle}</span>
                                          </p>
                                        )}
                                      </div>
                                      {!notif.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                    </div>

                                    {/* Time and Actions */}
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs text-gray-500">
                                        {formatTime(notif.createdAt)}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteNotification(notif._id);
                                        }}
                                        className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>

                                  {/* Feed Preview Image */}
                                  {feedImage && (
                                    <div className="flex-shrink-0 ml-2">
                                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                        <img
                                          src={feedImage}
                                          alt={isJobStatusUpdate ? "Company logo" : "Post"}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* View All Button */}
                {notifications.length > 0 && (
                  <div className="border-t border-gray-200 p-4">
                    <button
                      onClick={() => {
                        navigate("/notifications");
                        setNotifOpen(false);
                      }}
                      className="w-full py-2.5 text-center text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      View all notifications
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sidebar Navigation - IMPROVED SPACING */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* Main Navigation */}
          <div className="mb-3">
            {mainMenuItems.map(({ to, label, Icon, desc }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${isActive
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                  }`
                }
                onClick={label === "Reels" ? handleReelClick : undefined}
              >
                <Icon className={`w-5 h-5 ${label === "Reels" && isReelsActive ? "text-blue-600" : ""}`} />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}

            {/* Create Post Button */}
            <button
              onClick={handleCreatePostClick}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-all w-full text-gray-700 mt-1"
            >
              <Plus className="w-5 h-5" />
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Create Post</span>
                {getPostStatusBadge()}
              </div>
            </button>
          </div>

          {/* Profile Section */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">Profile</h3>
            {profileMenuItems.map((item) => {
              if (item.label === "Portfolio") {
                return (
                  <button
                    key={item.label}
                    onClick={handlePortfolioClick}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left text-gray-700 hover:bg-gray-50"
                  >
                    <item.Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </button>
                );
              }

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left ${isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <item.Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </div>

          {/* Settings Section */}
          <div className="mt-auto pt-3 border-t border-gray-100">
            {settingsMenuItems.map(({ to, label, Icon, onClick }) => (
              onClick ? (
                <button
                  key={label}
                  onClick={onClick}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left text-gray-700 hover:bg-gray-50 mb-1"
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </button>
              ) : (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left mb-1 ${isActive
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{label}</span>
                  </div>
                </NavLink>
              )
            ))}

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all w-full text-left text-red-600 hover:bg-red-50 mt-2"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </motion.aside>

      {/* MOBILE HEADER - IMPROVED SPACING */}
      <motion.header
        className="lg:hidden fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 py-2.5 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Left Section: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo */}
          <div
            onClick={() => {
              if (window.location.pathname === "/") {
                localStorage.setItem("scrollToFeed", "true");
                window.location.reload();
              } else {
                navigate("/");
              }
            }}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <motion.div whileHover={{ rotate: 5 }} whileTap={{ scale: 0.95 }}>
              <img
                src={PrithuLogo}
                alt="Prithu Logo"
                className="w-8 h-8 transition-transform duration-200 group-hover:scale-105"
              />
            </motion.div>
            <motion.h1
              className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              PRITHU
            </motion.h1>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-2">
          {/* Mobile search button */}
          <button
            onClick={() => setMobileSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-blue-600" />
          </button>

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
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium">
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
      </motion.header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 lg:hidden"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-50/30">
              <div className="flex items-center gap-3">
                <ProfileAvatar user={user} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">{user?.userName || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.userEmail || "Welcome"}</p>
                </div>
              </div>
              <button
                onClick={handleMobileMenuClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Mobile Menu Content */}
            <div className="p-4 space-y-1 h-[calc(100vh-80px)] overflow-y-auto">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={handleCreatePostClick}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all relative"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">Create Post</span>
                  {postStatus === "interest" && (
                    <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      ⏳
                    </span>
                  )}
                </button>
                <button
                  onClick={() => {
                    handleReelClick();
                    handleMobileMenuClose();
                  }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium transition-all ${isReelsActive
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                  <Video className="w-5 h-5" />
                  <span className="text-sm">Reels</span>
                </button>
              </div>

              {/* Main Navigation Links */}
              <div className="space-y-1 mb-4">
                {mainMenuItems.map(({ to, label, Icon, desc }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={handleMobileMenuClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                      }`
                    }
                  >
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </NavLink>
                ))}
              </div>

              {/* Profile Links */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Profile</h3>
                <div className="space-y-1">
                  {profileMenuItems.map((item) => {
                    if (item.label === "Portfolio") {
                      return (
                        <button
                          key={item.label}
                          onClick={() => {
                            handlePortfolioClick();
                            handleMobileMenuClose();
                          }}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left text-gray-700 hover:bg-gray-50"
                        >
                          <div className={`p-2 rounded-lg bg-gray-100`}>
                            <item.Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.label}</p>
                          </div>
                        </button>
                      );
                    }

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        onClick={handleMobileMenuClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                          }`
                        }
                      >
                        <div className={`p-2 rounded-lg bg-gray-100`}>
                          <item.Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.label}</p>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>
              </div>

              {/* Settings Links */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Settings</h3>
                <div className="space-y-1">
                  {settingsMenuItems.map(({ to, label, Icon, desc, onClick }) => (
                    onClick ? (
                      <button
                        key={label}
                        onClick={() => {
                          onClick({ preventDefault: () => { } });
                          handleMobileMenuClose();
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all w-full text-left text-gray-700 hover:bg-gray-50"
                      >
                        <div className={`p-2 rounded-lg bg-gray-100`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{label}</p>
                        </div>
                      </button>
                    ) : (
                      <NavLink
                        key={to}
                        to={to}
                        onClick={handleMobileMenuClose}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                            ? "bg-blue-50 text-blue-700 font-medium"
                            : "text-gray-700 hover:bg-gray-50"
                          }`
                        }
                      >
                        <div className={`p-2 rounded-lg bg-gray-100`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{label}</p>
                        </div>
                      </NavLink>
                    )
                  ))}
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={() => {
                  logout();
                  handleMobileMenuClose();
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

      {/* MOBILE OVERLAY */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleMobileMenuClose}
        />
      )}

      {/* MOBILE SEARCH */}
      <MobileSearchBar
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleKeyDown={handleKeyDown}
        debouncedSearch={debouncedSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        trending={trending}
        history={history}
        clearHistory={clearHistory}
        handleTrendingClick={handleTrendingClick}
        handleHistoryClick={handleHistoryClick}
        scoredResults={scoredResults}
        handleSelectResult={handleSelectResult}
      />

      {/* Create Post Modal */}
      <CreatePostModal
        open={isCreatePostOpen && postStatus === "allow"}
        onClose={handleCloseModal}
      />

      {/* Interest Popup */}
      {interestModalOpen && (
        <CasualInterestPopup
          open={interestModalOpen}
          onClose={handleCloseInterestModal}
          onInterestsSelected={handleInterestsSelected}
        />
      )}

      {/* Coming Soon Popups */}
      <ComingSoonPopup
        isOpen={showSubscriptionPopup}
        onClose={() => setShowSubscriptionPopup(false)}
        title="Subscriptions"
        icon={BellRing}
        description="Get exclusive access to premium content and features with our upcoming subscription plans."
      />

      <ComingSoonPopup
        isOpen={showReferralPopup}
        onClose={() => setShowReferralPopup(false)}
        title="Referral"
        icon={Gift}
        description="Share Prithu with your friends and earn rewards! Our referral program is launching soon."
      />
    </Fragment>
  );
}

/* ✅ Profile Avatar component */
const ProfileAvatar = ({ user, size = "md" }) => {
  const fallback = user?.displayName?.[0]?.toUpperCase() || user?.userName?.[0]?.toUpperCase() || "U";
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return user?.profileAvatar ? (
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
  );
};