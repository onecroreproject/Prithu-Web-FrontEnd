// src/layouts/Header.jsx
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
  BellRing, Search, Home, Video, User, Gift, Settings, LogOut, Plus, Menu, X
} from "lucide-react";
import debounce from "lodash.debounce";
import PrithuLogo from "../assets/prithu_logo.webp";
import NotificationDropdown from "../components/NotificationComponet/notificationDropdwon";
import api from "../api/axios";
import CreatePostModal from "../components/CreatePostModal";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

// Import new split components
import HeaderIcon from "../components/HeaderComponent/headerIcon";
import ProfileAvatar from "../components/HeaderComponent/profileAvatar";
import SearchBar from "../components/HeaderComponent/searchBar";
import MobileSearchBar from "../components/HeaderComponent/mobileSearchBar";
import MobileMenu from "../components/HeaderComponent/mobileMenu";

// --- constants ---
const SEARCH_HISTORY_KEY = "prithu_search_history_v1";
const MAX_HISTORY = 12;
const TRENDING_CACHE_KEY = "prithu_trending_cache_v1";
const TRENDING_CACHE_TTL = 60 * 60 * 1000;

const navItems = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/search", label: "Search", Icon: Search },
  { to: "/subscriptions", label: "Subscriptions", Icon: BellRing },
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/referral", label: "Referral", Icon: Gift },
  { to: "/settings", label: "Settings", Icon: Settings }
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

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  // -- Notifications --
  const fetchNotificationCount = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/api/get/user/all/notification", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const unreadCount = (data?.notifications || []).filter(n => !n.isRead).length;
      setNotifCount(unreadCount);
    } catch (err) {
      console.error("❌ Notification fetch failed:", err);
    }
  }, [token]);

  const debouncedNotifFetch = useMemo(
    () => debounce(fetchNotificationCount, 500),
    [fetchNotificationCount]
  );

  useEffect(() => {
    const handleNewNotif = e => {
      const notif = e.detail;
      toast.success(`🔔 ${notif.title || "New notification!"}`);
      setNotifCount(prev => prev + 1);
    };
    const handleNotifRead = () => debouncedNotifFetch();
    document.addEventListener("socket:newNotification", handleNewNotif);
    document.addEventListener("socket:notificationRead", handleNotifRead);
    fetchNotificationCount();
    return () => {
      document.removeEventListener("socket:newNotification", handleNewNotif);
      document.removeEventListener("socket:notificationRead", handleNotifRead);
    };
  }, [debouncedNotifFetch, fetchNotificationCount]);

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
    const next = !isReelsActive;
    setIsReelsActive(next);
    window.dispatchEvent(new CustomEvent("toggleReels", { detail: { isActive: next } }));
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

  // -- Score & filter --
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

  // -- Trending fetch with cache --
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

  // -- Search API --
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

  // -- Derived scored results --
  const scoredResults = useMemo(() => {
    const q = (searchQuery || "").trim();
    return {
      categories: scoreAndFilter(q, searchResults.categories || [], ["name"]),
      people: scoreAndFilter(q, searchResults.people || [], ["userName", "name"]),
      jobs: scoreAndFilter(q, searchResults.jobs || [], ["title", "companyName"])
    };
  }, [searchResults, searchQuery, scoreAndFilter]);

  // -- Click handlers for search results, history, trending --
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

  // --- RENDER ---
  return (
    <Fragment>
      {/* HEADER */}
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
        {/* Desktop Search */}
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
        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile search button */}
          <button onClick={() => setMobileSearchOpen(true)} className="p-2 rounded-md hover:bg-gray-100 sm:hidden">
            <Search className="w-5 h-5" />
          </button>
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3">
            <HeaderIcon Icon={Plus} onClick={() => setIsCreatePostOpen(true)} />
            <HeaderIcon Icon={Video} onClick={handleReelClick} active={isReelsActive} />
            <div ref={notificationRef} className="relative">
              <HeaderIcon Icon={BellRing} badge={notifCount} onClick={() => setNotifOpen((p) => !p)} />
              <NotificationDropdown
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                onUpdateCount={fetchNotificationCount}
              />
            </div>
          </div>
          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2">
            <div ref={notificationRef} className="relative">
              <HeaderIcon Icon={BellRing} badge={notifCount} onClick={() => setNotifOpen((p) => !p)} />
              <NotificationDropdown
                isOpen={notifOpen}
                onClose={() => setNotifOpen(false)}
                onUpdateCount={fetchNotificationCount}
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {/* Desktop Profile Dropdown */}
          <div ref={dropdownRef} className="relative hidden sm:flex items-center gap-2">
            <motion.button
              onClick={() => setDropdownOpen((p) => !p)}
              className="flex items-center gap-2 rounded-lg px-2 py-1 text-gray-700"
              whileTap={{ scale: 0.97 }}
            >
              <span className="font-medium">{user?.userName || "User"}</span>
              <ProfileAvatar user={user} />
            </motion.button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.25 }}
                  className="absolute right-0 top-12 w-56 bg-white border border-green-200 rounded-2xl shadow-lg z-[150]"
                >
                  {navItems.map(({ to, label, Icon }) => (
                    <NavLink
                      key={to}
                      to={to}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-green-50"
                    >
                      <Icon className="w-4 h-4 text-green-600" />
                      {label}
                    </NavLink>
                  ))}
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>
      {/* Mobile Menu */}
      <MobileMenu
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        mobileMenuRef={mobileMenuRef}
        user={user}
        navItems={navItems}
        setIsCreatePostOpen={setIsCreatePostOpen}
        isReelsActive={isReelsActive}
        handleReelClick={handleReelClick}
        logout={logout}
      />
      {/* Mobile menu backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 sm:hidden z-[150]"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {/* MOBILE SEARCH (full-screen slide) */}
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
      <CreatePostModal open={isCreatePostOpen} onClose={() => setIsCreatePostOpen(false)} />
    </Fragment>
  );
}
