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
  Calendar, Briefcase, Activity, Users
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
const TRENDING_CACHE_KEY = "prithu_trending_cache_v1";
const TRENDING_CACHE_TTL = 60 * 60 * 1000;

export default function Header() {
  const { user, token, logout, fetchUserProfile } = useAuth();
  const navigate = useNavigate();

  // Notification count from React Query hook (replaces manual polling)
  const notifCount = useUnreadNotificationCount(token);
  const refreshNotifications = useRefreshNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isReelsActive, setIsReelsActive] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
 
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
  const trendingFetchedAt = useRef(0);

  // refs
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const notificationRef = useRef(null);
  const searchRef = useRef(null);

  // Updated navItems - Removed duplicate "Portfolio" from main navigation
  const navItems = [
    { to: "/", label: "Home", Icon: Home },
    { to: "/profile", label: "Profile", Icon: User },
    { to: "/settings", label: "Settings", Icon: Settings },
    { to: "/subscriptions", label: "Subscriptions", Icon: BellRing },
    { to: "/referral", label: "Referral", Icon: Gift },
    { to: "/activity", label: "My Activity", Icon: Activity }
  ];

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  // -- Real-time notification updates via WebSocket --
  // React Query hook handles fetching/caching, WebSocket handles real-time updates
  useEffect(() => {
    const handleNewNotif = e => {
      const notif = e.detail;
      console.log("🔔 New notification received:", notif);

      // Show toast notification
      toast.success(`🔔 ${notif.title || "New notification!"}`, {
        duration: 4000,
        position: "top-right",
      });

      // Refresh notifications from React Query cache
      refreshNotifications();
    };

    const handleNotifRead = () => {
      console.log("📨 Notifications marked as read");
      refreshNotifications();
    };

    // Listen for socket events
    document.addEventListener("socket:newNotification", handleNewNotif);
    document.addEventListener("socket:notificationRead", handleNotifRead);

    return () => {
      document.removeEventListener("socket:newNotification", handleNewNotif);
      document.removeEventListener("socket:notificationRead", handleNotifRead);
    };
  }, [refreshNotifications]);

  // -- Outside clicks --
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

  // -- Reels --
  const handleReelClick = () => {
    const nextState = !isReelsActive;
    setIsReelsActive(nextState);
    window.dispatchEvent(new CustomEvent("toggleReels", { detail: { isActive: nextState } }));
  };

  // -- Events --
  const handleEventsClick = () => {
     navigate("/event")
    closeAll();
  };

  // -- Jobs --
  const handleJobsClick = () => {
    navigate("/jobs")
  };

  // -- Portfolio --
  const handlePortfolioClick = () => {
    navigate(`/portfolio/${user?.userName || ""}`);
  };

  // -- Community --
  const handleCommunityClick = () => {
    setIsCommunityOpen(true);
  };

  const closeAll = () => {
    setDropdownOpen(false);
    setNotifOpen(false);
    setMobileMenuOpen(false);
  };

  const handleBellClick = () => {
    setNotifOpen((p) => !p);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    // Refresh count when opening notification dropdown
    if (!notifOpen) {
      fetchNotificationCount();
    }
  };

  // -- Search helpers --
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

  const fetchTrending = async () => {
    try {
      const cacheRaw = localStorage.getItem(TRENDING_CACHE_KEY);
      if (cacheRaw) {
        const parsed = JSON.parse(cacheRaw);
        if (parsed?.ts && Date.now() - parsed.ts < TRENDING_CACHE_TTL) {
          setTrending(parsed.data || []);
          trendingFetchedAt.current = parsed.ts;
          return;
        }
      }
      const { data } = await api.get("/api/trending/hashtags");
      if (Array.isArray(data)) {
        setTrending(data);
        localStorage.setItem(
          TRENDING_CACHE_KEY,
          JSON.stringify({ ts: Date.now(), data })
        );
        trendingFetchedAt.current = Date.now();
      }
    } catch (err) {
      console.error("❌ failed to fetch trending hashtags", err);
    }
  };

  useEffect(() => {
    loadHistory();
    fetchTrending();
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
      {/* HEADER */}
      <motion.header
        className="fixed top-0 left-0 w-full bg-white flex items-center justify-between px-4 md:px-6 py-3 shadow-md z-50"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Left Section: Logo + Heading */}
        <div className="flex items-center gap-4">
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
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src={PrithuLogo} alt="Prithu Logo" className="w-8 h-8 md:w-10 md:h-10" />
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-400 bg-clip-text text-transparent">
              PRITHU
            </h1>
          </div>

          {/* Desktop Search Bar - Now responsive */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-24">
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

          {/* Desktop: Jobs, Portfolio, Community, Events - Updated order */}
          <div className="hidden lg:flex items-center gap-2 ml-4">
            <HeaderIconWithLabel
              Icon={Briefcase}
              label="Jobs"
              onClick={handleJobsClick}
            />
            <HeaderIconWithLabel
              Icon={User}
              label="Portfolio"
              onClick={handlePortfolioClick}
            />
            <HeaderIconWithLabel
              Icon={Users}
              label="Community"
              onClick={handleCommunityClick}
            />
            <HeaderIconWithLabel
              Icon={Calendar}
              label="Events"
              onClick={handleEventsClick}
            />
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile search button - Visible on mobile */}
          <button 
            onClick={() => setMobileSearchOpen(true)} 
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden"
          >
            <Search className="w-5 h-5 text-blue-600" />
          </button>

          {/* Desktop Actions - Hidden on mobile */}
          <div className="hidden lg:flex items-center gap-3">
            <HeaderIcon Icon={Plus} onClick={() => setIsCreatePostOpen(true)} />
            <HeaderIcon Icon={Video} onClick={handleReelClick} active={isReelsActive} />

            {/* Notification */}
            <div ref={notificationRef} className="relative">
              <HeaderIcon Icon={BellRing} badge={notifCount} onClick={handleBellClick} />
              <NotificationDropdown
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                onUpdateCount={refreshNotifications}
              />
            </div>

            {/* Profile Dropdown - Clickable User Name and Profile Pic */}
            <div ref={dropdownRef} className="relative">
              <motion.button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-all duration-300 hover:bg-blue-50"
                whileTap={{ scale: 0.97 }}
              >
                <ProfileAvatar user={user} />
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
                  {user?.userName || "User"}
                </span>
              </motion.button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                    className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-xl shadow-lg backdrop-blur-sm z-[150]"
                  >
                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-50">
                      <div className="flex items-center gap-3">
                        <ProfileAvatar user={user} size="md" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {user?.name || user?.userName || "User"}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {user?.userEmail || ""}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="p-2 space-y-1">
                      {navItems.map(({ to, label, Icon }) => (
                        <NavLink
                          key={to}
                          to={to}
                          onClick={closeAll}
                          className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition ${isActive
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "text-gray-700 hover:bg-blue-50"
                            }`
                          }
                        >
                          <Icon className="w-4 h-4 text-blue-600" />
                          {label}
                        </NavLink>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="p-2 border-t border-gray-100">
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition w-full text-left"
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

          {/* Mobile Actions - Only Notification and Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Notification */}
            <div ref={notificationRef} className="relative">
              <HeaderIcon Icon={BellRing} badge={notifCount} onClick={handleBellClick} />
              <NotificationDropdown
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                onUpdateCount={refreshNotifications}
              />
            </div>

            {/* Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-blue-600" /> : <Menu className="w-5 h-5 text-blue-600" />}
            </button>
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
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-full bg-white shadow-2xl z-50 lg:hidden"
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-50">
              <div className="flex items-center gap-3">
                <ProfileAvatar user={user} size="lg" />
                <div>
                  <p className="font-semibold text-gray-900">{user?.userName || "User"}</p>
                  <p className="text-sm text-gray-500">{user?.userEmail || ""}</p>
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
              {/* Mobile Search */}
              <div className="pb-4 border-b border-gray-200">
                <button
                  onClick={() => {
                    setMobileSearchOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition text-left"
                >
                  <Search className="w-5 h-5 text-blue-600" />
                  <span className="font-medium">Search</span>
                </button>
              </div>

              {/* Mobile Actions */}
              <div className="flex gap-2 pb-4 border-b border-gray-200">
                <button
                  onClick={() => {
                    setIsCreatePostOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  <Plus className="w-5 h-5" />
                  Create Post
                </button>
                <button
                  onClick={() => {
                    handleReelClick();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium ${isReelsActive
                    ? "bg-blue-100 text-blue-700 border border-blue-300"
                    : "bg-gray-100 text-gray-700"
                    }`}
                >
                  <Video className="w-5 h-5" />
                  Reels
                </button>
              </div>

              {/* Quick Actions - Jobs, Portfolio, Community, Events (Updated Order) */}
              <div className="pb-4 border-b border-gray-200">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleJobsClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition text-left"
                  >
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Jobs</span>
                  </button>
                  <button
                    onClick={() => {
                      handlePortfolioClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition text-left"
                  >
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Portfolio</span>
                  </button>
                  <button
                    onClick={() => {
                      handleCommunityClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition text-left"
                  >
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Community</span>
                  </button>
                  <button
                    onClick={() => {
                      handleEventsClick();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition text-left"
                  >
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Events</span>
                  </button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {navItems.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition ${isActive
                        ? "bg-blue-100 text-blue-700 font-medium"
                        : "text-gray-700 hover:bg-blue-50"
                      }`
                    }
                  >
                    <Icon className="w-5 h-5 text-blue-600" />
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
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

      {/* Events Modal */}
      <EventsModal
        open={isEventsOpen}
        onClose={() => setIsEventsOpen(false)}
      />

      {/* Community Modal */}
      <CommunityModal
        open={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
      />
    </Fragment>
  );
}

/* ✅ Events Modal Component */
const EventsModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <UpcomingEvents  />
      </motion.div>
    </div>
  );
};

/* ✅ Community Modal Component */
const CommunityModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-50">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Community</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Community Content */}
        <div className="p-6">
          <div className="text-center py-8">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Features Coming Soon!</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Connect with other users, join groups, and participate in community discussions. 
              This feature is currently under development.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ✅ HeaderIcon component */
const HeaderIcon = ({ Icon, onClick, badge, active }) => (
  <button
    onClick={onClick}
    className={`relative p-2 rounded-full transition-all duration-300 ${active ? "bg-blue-100 ring-2 ring-blue-400" : "hover:bg-gray-100"
      }`}
  >
    <Icon
      className={`w-5 h-5 transition-all ${active ? "text-blue-700 scale-110" : "text-blue-600"
        }`}
    />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </button>
);

/* ✅ HeaderIcon with Label for Desktop - Text on right side */
const HeaderIconWithLabel = ({ Icon, label, onClick, active }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 ${active ? "bg-blue-100 ring-2 ring-blue-400" : "hover:bg-gray-100"
      }`}
  >
    <Icon
      className={`w-5 h-5 transition-all ${active ? "text-blue-700 scale-110" : "text-blue-600"
        }`}
    />
    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{label}</span>
  </button>
);

/* ✅ Avatar component */
const ProfileAvatar = ({ user, size = "md" }) => {
  const fallback = user?.displayName?.[0]?.toUpperCase() || "U";
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base"
  };

  return user?.profileAvatar ? (
    <img
      src={user.profileAvatar}
      alt="Avatar"
      className={`${sizeClasses[size]} rounded-full object-cover border-2 border-blue-200`}
    />
  ) : (
    <div className={`${sizeClasses[size]} rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200`}>
      {fallback}
    </div>
  );
};