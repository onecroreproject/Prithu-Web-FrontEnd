# ⚠️ CRITICAL: Header.jsx File Corruption Detected

**Date:** 2025-11-22 05:30 AM  
**Status:** File corrupted - needs restoration  
**Impact:** Blocks Option 2 implementation

---

## 🔴 PROBLEM

The `Header.jsx` file is corrupted:
- Missing imports at the beginning
- File starts with code that should be in the middle (line 1 starts with an if statement)
- Cannot proceed with React Query hooks integration

**File Location:** `src/components/Header.jsx`

---

## 🛠️ SOLUTION OPTIONS

### Option 1: Restore from Backup (RECOMMENDED)
If you have a backup or version control:
1. Restore `Header.jsx` from your backup
2. Or use `git checkout` if you have git initialized
3. Then we can proceed with React Query implementation

### Option 2: Manual Fix
The file needs these imports at the top (before line 1):

```javascript
import React, { useState, useEffect, useRef, useCallback, useMemo, Fragment } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, Plus, Video, BellRing,
  LogOut, User, Calendar, Briefcase
} from "lucide-react";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

// Components
import CreatePostModal from "./CreatePostModal";
import NotificationDropdown from "./NotificationDropdown";
import SearchBar from "./SearchBar";
import MobileSearchBar from "./MobileSearchBar";
import UpcomingEvents from "./UpcomingEvents";

// Assets & API
import PrithuLogo from "../assets/prithu-logo.png";
import api from "../api/axios";

// Context
import { useAuth } from "../context/AuthContext";

// Constants
const SEARCH_HISTORY_KEY = "prithu_search_history";
const TRENDING_CACHE_KEY = "prithu_trending_cache";
const MAX_HISTORY = 10;
const TRENDING_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Navigation items
const navItems = [
  { to: "/", label: "Home", Icon: Home },
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/settings", label: "Settings", Icon: Settings },
];

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // State declarations
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEventsOpen, setIsEventsOpen] = useState(false);
  const [isReelsActive, setIsReelsActive] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({ categories: [], people: [], jobs: [] });
  const [activeTab, setActiveTab] = useState("people");
  const [trending, setTrending] = useState([]);
  const [history, setHistory] = useState([]);

  // Refs
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchRef = useRef(null);
  const trendingFetchedAt = useRef(0);

  // Notification fetching function
  const fetchNotificationCount = useCallback(async () => {
    if (!token) return;
    try {
      const { data } = await api.get("/api/user/notifications/unread/count");
      setNotifCount(data.count || 0);
    } catch (err) {
      console.error("Failed to fetch notification count:", err);
    }
  }, [token]);

  // Initial fetch and polling
  useEffect(() => {
    if (!token) return;
    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [token, fetchNotificationCount]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      // ... rest of the code continues from line 1 of the current file
```

Then the rest of the file continues from the current line 1.

---

## 📋 WHAT WE WERE TRYING TO DO

We were implementing **Option 2: React Query Hooks** to replace the manual notification polling in Header.jsx with:

```javascript
// Instead of manual polling:
const [notifCount, setNotifCount] = useState(0);
const fetchNotificationCount = useCallback(async () => { ... });
useEffect(() => {
  const interval = setInterval(fetchNotificationCount, 30000);
  return () => clearInterval(interval);
}, []);

// Use React Query hooks:
import { useUnreadNotificationCount } from '../hooks/useNotifications';
const unreadCount = useUnreadNotificationCount(token);
```

**Benefits:**
- No polling (better performance)
- Automatic caching
- WebSocket-ready
- 50+ lines of code removed

---

## 🎯 CURRENT STATUS

### ✅ Completed:
1. **Option 1: Emoji Integration** - 100% complete (all 4 components)
2. **File Cleanup** - 9 obsolete files deleted
3. **Documentation** - Comprehensive guides created

### ⏸️ Blocked:
1. **Option 2: React Query Hooks** - Blocked by Header.jsx corruption

### 📦 Ready to Use:
- ✅ `usePostActions.js` hook - Created and ready
- ✅ `useNotifications.js` hook - Created and ready
- ✅ `useComments.js` hook - Created and ready

---

## 🔧 NEXT STEPS

1. **Restore Header.jsx** (choose one):
   - Restore from backup
   - Manually add missing imports
   - Provide a working version of the file

2. **Then Continue with Option 2:**
   - Update Header.jsx to use `useNotifications` hook
   - Update Postcard.jsx to use `usePostActions` and `useComments` hooks
   - Update PostCommentsModal.jsx to use `useComments` hooks

---

## 📊 SUMMARY

**What Works:**
- ✅ All emoji integrations (4/4 components)
- ✅ All React Query hooks created
- ✅ Documentation complete

**What's Blocked:**
- ⚠️ Header.jsx corrupted (missing imports)
- ⏸️ Cannot implement React Query hooks until fixed

**Time Estimate:**
- Fix Header.jsx: 5-10 minutes
- Implement React Query: 1-2 hours
- Total remaining: ~2 hours

---

**Please restore Header.jsx from backup or let me know how you'd like to proceed.**
