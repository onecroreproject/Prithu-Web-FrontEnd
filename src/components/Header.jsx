import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Fragment
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, NavLink } from "react-router-dom";
import {
  BellRing, Search, Home, Video, User, Gift, Settings, LogOut, Plus, Menu, X,
  Calendar, Briefcase, Activity, Users, Brain, Building, Users as CommunityIcon,
  TrendingUp, Clock
} from "lucide-react";
import debounce from "lodash.debounce";
import PrithuLogo from "../assets/prithu_logo.webp";
import NotificationDropdown from "../components/NotificationComponet/notificationDropdwon";
import api from "../api/axios";
import CreatePostModal from "../components/CreatePostModal";
import UpcomingEvents from "../components/UpcomingEvents";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { useUnreadNotificationCount, useRefreshNotifications } from "../hooks/useNotifications";

// Import search components
import SearchBar from "../components/HeaderComponent/searchBar";
import MobileSearchBar from "../components/HeaderComponent/mobileSearchBar";

// --- constants ---
const SEARCH_HISTORY_KEY = "prithu_search_history_v1";
const MAX_HISTORY = 12;

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
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isReelsActive, setIsReelsActive] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isAptitudeOpen, setIsAptitudeOpen] = useState(false);
  
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
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Enhanced navItems with icons
  const navItems = [
    { to: "/", label: "Home", Icon: Home, desc: "Your feed" },
    { to: "/profile", label: "Profile", Icon: User, desc: "View your profile" },
    { to: "/settings", label: "Settings", Icon: Settings, desc: "Account settings" },
    { to: "/subscriptions", label: "Subscriptions", Icon: BellRing, desc: "Manage subscriptions" },
    { to: "/referral", label: "Referral", Icon: Gift, desc: "Referral program" },
    { to: "/activity", label: "My Activity", Icon: Activity, desc: "Your activity log" }
  ];

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  // Real-time notification updates
  useEffect(() => {
    const handleNewNotif = e => {
      const notif = e.detail;
      console.log("🔔 New notification received:", notif);

      toast.success(`🔔 ${notif.title || "New notification!"}`, {
        duration: 4000,
        position: "top-right",
      });

      refreshNotifications();
    };

    const handleNotifRead = () => {
      console.log("📨 Notifications marked as read");
      refreshNotifications();
    };

    document.addEventListener("socket:newNotification", handleNewNotif);
    document.addEventListener("socket:notificationRead", handleNotifRead);

    return () => {
      document.removeEventListener("socket:newNotification", handleNewNotif);
      document.removeEventListener("socket:notificationRead", handleNotifRead);
    };
  }, [refreshNotifications]);

  // Outside click handlers
  useEffect(() => {
    const handleOutsideClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) setMobileMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSearchDropdown(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Navigation handlers
  const handleReelClick = () => {
    const nextState = !isReelsActive;
    setIsReelsActive(nextState);
    window.dispatchEvent(new CustomEvent("toggleReels", { detail: { isActive: nextState } }));
  };

  const handleEventsClick = () => {
    // Show "Coming Soon" toast for events
    toast("📅 Events feature coming soon!", {
      icon: "🎉",
      duration: 3000,
      position: "top-center"
    });
    // Uncomment below when events feature is ready
    // navigate("/event");
    closeAll();
  };

  const handleJobsClick = () => {
    navigate("/jobs");
  };

  const handlePortfolioClick = () => {
    navigate(`/portfolio/${user?.userName || ""}`);
  };

  const handleCommunityClick = () => {
    // Show "Coming Soon" toast for community
    toast("👥 Community feature coming soon!", {
      icon: "🚀",
      duration: 3000,
      position: "top-center"
    });
    // Uncomment below when community feature is ready
    // navigate("/community");
  };

  const handleAptitudeClick = () => {
 
       navigate("/aptitude");;

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

  return (
    <Fragment>
      {/* MAIN HEADER */}
      <motion.header
        className="fixed top-0 left-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-6 py-2.5 z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Left Section: Logo + Search */}
        <div className="flex items-center gap-3 md:gap-6 flex-1">
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
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <motion.div whileHover={{ rotate: 5 }} whileTap={{ scale: 0.95 }}>
              <img 
                src={PrithuLogo} 
                alt="Prithu Logo" 
                className="w-8 h-8 md:w-9 md:h-9 transition-transform duration-200 group-hover:scale-105" 
              />
            </motion.div>
            <motion.h1 
              className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
              whileHover={{ scale: 1.05 }}
            >
              PRITHU
            </motion.h1>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleKeyDown={handleKeyDown}
              debouncedSearch={debouncedSearch}
              loadHistory={loadHistory}
              setShowSearchDropdown={setShowSearchDropdown}
              showSearchDropdown={showSearchDropdown}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              trending={trending}
              history={history}
              clearHistory={clearHistory}
              handleTrendingClick={handleTrendingClick}
              handleHistoryClick={handleHistoryClick}
              scoredResults={scoredResults}
              handleSelectResult={handleSelectResult}
              searchRef={searchRef}
            />
          </div>
        </div>

        {/* Center Section: Navigation Icons */}
        <div className="hidden lg:flex items-center justify-center gap-1 mx-4">
          {[
            { Icon: Briefcase, label: "Jobs", onClick: handleJobsClick },
            { Icon: User, label: "Portfolio", onClick: handlePortfolioClick },
            { 
              Icon: CommunityIcon, 
              label: "Community", 
              onClick: handleCommunityClick,
              comingSoon: true 
            },
            { 
              Icon: Brain, 
              label: "Aptitude", 
              onClick: handleAptitudeClick,
              comingSoon: true 
            },
            { 
              Icon: Calendar, 
              label: "Events", 
              onClick: handleEventsClick,
              comingSoon: true 
            }
          ].map((item, index) => (
            <motion.button
              key={item.label}
              onClick={item.onClick}
              className="flex flex-col items-center px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-blue-50 group relative"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="relative">
                <item.Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs mt-1 text-gray-600 group-hover:text-blue-700 font-medium transition-colors">
                  {item.label}
                </span>
               
              </div>
            </motion.button>
          ))}
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Mobile search button */}
          <button 
            onClick={() => setMobileSearchOpen(true)} 
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-blue-600" />
          </button>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Create Post */}
            <motion.button
              onClick={() => setIsCreatePostOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
             
            </motion.button>

            {/* Reels */}
            <motion.button
              onClick={handleReelClick}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${isReelsActive 
                ? "bg-blue-100 text-blue-700 border border-blue-200" 
                : "hover:bg-gray-100 text-gray-700"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Video className={`w-5 h-5 ${isReelsActive ? "text-blue-600" : "text-gray-600"}`} />
              <span className="text-sm font-medium">Reels</span>
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
                    className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow"
                  >
                    {notifCount > 99 ? '99+' : notifCount}
                  </motion.span>
                )}
              </motion.button>
              <NotificationDropdown
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                onUpdateCount={refreshNotifications}
              />
            </div>

            {/* Profile Dropdown */}
            <div ref={dropdownRef} className="relative">
              <motion.button
                onClick={() => setDropdownOpen(p => !p)}
                className="flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-gray-100"
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
                      {navItems.map(({ to, label, Icon, desc }) => (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={closeAll}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                              ? "bg-blue-50 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-gray-50"
                            }`
                          }
                        >
                          <div className={`p-1.5 rounded-lg bg-gray-100`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{label}</p>
                            <p className="text-xs text-gray-500 truncate">{desc}</p>
                          </div>
                        </NavLink>
                      ))}
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
          <div className="flex lg:hidden items-center gap-2">
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
        </div>
      </motion.header>

      {/* Mobile Menu */}
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
            <div className="p-4 space-y-1 h-[calc(100vh-80px)] overflow-y-auto">
              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => {
                    setIsCreatePostOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-sm">Create Post</span>
                </button>
                <button
                  onClick={() => {
                    handleReelClick();
                    setMobileMenuOpen(false);
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

              {/* Navigation Links */}
              <div className="space-y-1 mb-4">
                {navItems.map(({ to, label, Icon, desc }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
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
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </NavLink>
                ))}
              </div>

              {/* Quick Navigation */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">Quick Access</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { Icon: Briefcase, label: "Jobs", onClick: handleJobsClick },
                    { Icon: User, label: "Portfolio", onClick: handlePortfolioClick },
                    { 
                      Icon: CommunityIcon, 
                      label: "Community", 
                      onClick: handleCommunityClick,
                      comingSoon: true 
                    },
                    { 
                      Icon: Brain, 
                      label: "Aptitude", 
                      onClick: handleAptitudeClick,
                      comingSoon: true 
                    },
                    { 
                      Icon: Calendar, 
                      label: "Events", 
                      onClick: handleEventsClick,
                      comingSoon: true 
                    }
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        item.onClick();
                        setMobileMenuOpen(false);
                      }}
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50 transition-colors relative"
                    >
                      <item.Icon className="w-5 h-5 text-gray-600 mb-1" />
                      <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                     
                    </button>
                  ))}
                </div>
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
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
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
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      {/* Modals (commented out for now) */}
      {/* <EventsModal open={isEventsOpen} onClose={() => setIsEventsOpen(false)} /> */}
      {/* <CommunityModal open={isCommunityOpen} onClose={() => setIsCommunityOpen(false)} /> */}
      {/* <AptitudeModal open={isAptitudeOpen} onClose={() => setIsAptitudeOpen(false)} /> */}
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