// src/components/SearchResultsScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PrithuLogo from "../../assets/prithu_logo.webp";
import {
  Search,
  ArrowRight,
  Users,
  Briefcase,
  Folder,
  Clock,
  X,
  Hash,
  Image,
  Video,
  MapPin,
} from "lucide-react";
import api from "../../api/axios";
import Postcard from "../FeedPageComponent/Postcard";
import defaultAvater from "../../assets/user.png";
import { useAuth } from "../../context/AuthContext";


const SearchResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [results, setResults] = useState({
    categories: [],
    people: [],
    feeds: [],
    all: [],
  });
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const rightContentRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading recent searches:", error);
        setRecentSearches([]);
      }
    }
  }, []);

  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery && recentSearches.length > 0) {
      const filtered = recentSearches.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(recentSearches);
    }
  }, [searchQuery, recentSearches]);

  // Save to recent searches
  const saveToRecentSearches = (query) => {
    if (!query || !query.trim()) return;
    const updated = [
      query,
      ...recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 8);

    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
    setFilteredSuggestions([]);
  };

  const removeRecentSearch = (searchToRemove, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== searchToRemove);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch search results from your backend
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setResults({
          categories: [],
          people: [],
          feeds: [],
          all: [],
        });
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(
          `/api/global/search?q=${encodeURIComponent(searchQuery)}`
        );


        if (response.data?.success) {
          const {
            categories = [],
            people = [],
            feeds = [],
          } = response.data;

          // Combine into "all" for the All tab
          const allCombined = [
            ...categories.map((c) => ({ ...c, __type: "category" })),
            ...people.map((p) => ({ ...p, __type: "person" })),
            ...feeds.map((f) => ({ ...f, __type: "feed" })),
          ];

          setResults({
            categories,
            people,
            feeds,
            all: allCombined,
          });

          // Save query to recent searches
          saveToRecentSearches(searchQuery);
        } else {
          setResults({
            categories: [],
            people: [],
            feeds: [],
            all: [],
          });
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults({
          categories: [],
          people: [],
          jobs: [],
          feeds: [],
          all: [],
        });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update URL when tab changes or query changes
  useEffect(() => {
    const newUrl = `/search?q=${encodeURIComponent(
      searchQuery
    )}&tab=${activeTab}`;
    window.history.replaceState(null, "", newUrl);
  }, [activeTab, searchQuery]);

  const handleBack = () => navigate(-1);

  const handleSearchSubmit = (query = searchQuery) => {
    if (query.trim()) {
      setSearchQuery(query);
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query)}&tab=all`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleHome = () => {
    navigate("/home");
  };

  const handleSuggestionClick = (suggestion) => handleSearchSubmit(suggestion);
  const handleInputFocus = () => setShowSuggestions(true);
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const tabs = [
    {
      id: "all",
      label: "All Results",
      icon: Search,
      count: results.all.length,
      color: "green",
    },
    {
      id: "people",
      label: "People",
      icon: Users,
      count: results.people.length,
      color: "blue",
    },
    {
      id: "categories",
      label: "Hashtags",
      icon: Hash,
      count: results.categories.length,
      color: "purple",
    },
    {
      id: "feeds",
      label: "Posts",
      icon: Folder,
      count: results.feeds.length,
      color: "pink",
    },
  ];

  const hasResults = results.all.length > 0;
  const showRecentSearches =
    showSuggestions &&
    (recentSearches.length > 0 || filteredSuggestions.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header - Fixed with higher z-index */}
      <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200/60 fixed top-0 left-0 right-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center ">
            {/* Search Bar */}
            <div className="flex gap-35 items-center justify-center">
              <div className="flex items-center gap-2 ">
                <div>
                  <motion.div
                    onClick={handleHome}
                    whileHover={{ rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <img
                      src={PrithuLogo}
                      alt="Prithu Logo"
                      className="w-16 h-15 transition-transform duration-200 hover:scale-105"
                    />


                  </motion.div>
                </div>
                <motion.h1
                  className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-500 bg-clip-text text-transparent"
                  whileHover={{ scale: 1.05 }}
                >
                  PRITHU
                </motion.h1>
              </div>
              <div className="flex-1 max-w-8xl">
                <div className="relative" ref={suggestionsRef}>
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={handleInputFocus}
                      onKeyDown={handleKeyDown}
                      placeholder="Search people, hashtags, posts..."
                      className="w-[700px] pl-12 pr-12 py-3 border-2 border-green-300 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 text-lg shadow-sm hover:shadow-md"
                    />

                    {searchQuery && (
                      <button
                        onClick={handleClearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {/* Suggestions Dropdown */}
                  <AnimatePresence>
                    {showRecentSearches && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 max-h-80 overflow-y-auto"
                      >
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                              <Clock className="w-4 h-4" />
                              Recent Searches
                            </div>
                            {recentSearches.length > 0 && (
                              <button
                                onClick={clearRecentSearches}
                                className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors"
                              >
                                Clear all
                              </button>
                            )}
                          </div>

                          <div className="space-y-1">
                            {(searchQuery
                              ? filteredSuggestions
                              : recentSearches
                            ).map((search, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(search)}
                                className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-green-50 text-gray-700 transition-all duration-200 group"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <Search className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-left truncate">
                                    {search}
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => removeRecentSearch(search, e)}
                                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-100 rounded-lg transition-all flex-shrink-0 ml-2"
                                >
                                  <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                                </button>
                              </button>
                            ))}
                          </div>

                          {recentSearches.length === 0 && (
                            <div className="text-center py-4">
                              <p className="text-gray-500 text-sm">
                                No recent searches
                              </p>
                              <p className="text-gray-400 text-xs mt-1">
                                Your search history will appear here
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Back Button */}
            {/* <div className="ml-6">
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <span className="font-medium">Back</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Main Content with proper spacing for fixed header */}
      <div className="pt-24">
        {" "}
        {/* Add padding top for fixed header */}
        <div className="max-w-7xl mx-auto px-6">
          {/* Grid layout for sidebar and content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Sidebar - Fixed width, no scroll */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                {" "}
                {/* Stick below header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Filter Results
                  </h3>
                  <div className="space-y-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${activeTab === tab.id
                          ? "bg-green-50 border-2 border-green-200 shadow-sm"
                          : "hover:bg-gray-50 border-2 border-transparent"
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeTab === tab.id
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                            }`}
                        >
                          <tab.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {tab.label}
                          </div>
                          <div
                            className={`text-sm ${activeTab === tab.id
                              ? "text-green-600"
                              : "text-gray-500"
                              }`}
                          >
                            {tab.count} results
                          </div>
                        </div>
                        {activeTab === tab.id && (
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        )}
                      </button>
                    ))}
                  </div>

                  {hasResults && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">
                        Search Stats
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                          <span>Total Results</span>
                          <span className="font-medium">
                            {results.all.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>People</span>
                          <span className="font-medium">
                            {results.people.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Hashtags</span>
                          <span className="font-medium">
                            {results.categories.length}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                          <span>Posts</span>
                          <span className="font-medium">
                            {results.feeds.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Content - Scrollable independently */}
            <div className="lg:col-span-3">
              <div
                ref={rightContentRef}
                className="h-[calc(100vh-140px)] overflow-y-auto"
              >
                {/* Header inside content */}
                <div className="mb-8">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    Search Results
                    {searchQuery && (
                      <span className="text-green-600 ml-2">
                        "{searchQuery}"
                      </span>
                    )}
                  </h1>
                </div>

                {/* Results Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {renderContent({
                      loading,
                      hasResults,
                      results,
                      activeTab,
                      searchQuery,
                    })}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Content renderer
const renderContent = ({
  loading,
  hasResults,
  results,
  activeTab,
  searchQuery,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Searching for "{searchQuery}"...</p>
        </div>
      </div>
    );
  }

  if (!searchQuery) {
    return (
      <div className="text-center py-20">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Search className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-700 mb-3">
          Start Exploring
        </h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">
          Enter a search term to discover people, hashtags, and posts
        </p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">
          No results found for "{searchQuery}"
        </h3>
        <p className="text-gray-500">
          Try different keywords or explore trending topics
        </p>
      </div>
    );
  }

  const currentResults = results[activeTab] || [];
  if (currentResults.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {activeTab === "people" && (
            <Users className="w-6 h-6 text-gray-400" />
          )}
          {activeTab === "categories" && (
            <Hash className="w-6 h-6 text-gray-400" />
          )}
          {activeTab === "feeds" && (
            <Folder className="w-6 h-6 text-gray-400" />
          )}
          {activeTab === "all" && <Search className="w-6 h-6 text-gray-400" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          No {activeTab} found
        </h3>
        <p className="text-gray-500">
          Try a different search term or browse other categories
        </p>
      </div>
    );
  }

  switch (activeTab) {
    case "all":
      return <AllResults results={results} />;
    case "people":
      return <PeopleResults results={currentResults} />;
    case "categories":
      return <CategoriesResults results={currentResults} />;
    case "feeds":
      return <FeedsResults results={currentResults} />;
    default:
      return <AllResults results={results} />;
  }
};

// Subcomponents
const AllResults = ({ results }) => (
  <div className="space-y-8 flex items-center flex-col">
    {results.people.length > 0 && (
      <section className="flex flex-col bg-white rounded-lg w-[80%] p-4">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">People</h2>
          </div>
        </div>
        <div className="flex flex-col max-auto bg-white">
          {results.people.slice(0, 4).map((person) => (
            <PersonCard key={person._id} person={person} />
          ))}
        </div>
      </section>
    )}

    {results.categories.length > 0 && (
      <section className="flex bg-white flex-col w-[80%] p-4 ">
        <div className="flex items-center gap-3 mb-6">
          <Hash className="w-6 h-6 text-purple-600" />

          <div>
            <h2 className="text-xl font-bold text-gray-900">Hashtags</h2>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {results.categories.slice(0, 8).map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </section>
    )}



    {results.feeds.length > 0 && (
      <section className="flex flex-col  rounded-lg w-[80%] p-4">
        <div className="flex items-center gap-3 mb-6">
          <Folder className="w-6 h-6 text-pink-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Posts</h2>
          </div>
        </div>
        <div className="space-y-6">
          {results.feeds.slice(0, 4).map((feed) => (
            <FeedCard key={feed._id} feed={feed} />
          ))}
        </div>
      </section>
    )}
  </div>
);

const PeopleResults = ({ results }) => (
  <div className="flex flex-col mx-auto ">
    {results.map((person) => (
      <PersonCard key={person._id} person={person} />
    ))}
  </div>
);

const CategoriesResults = ({ results }) => (
  <div className="space-y-3">
    {results.map((category) => (
      <CategoryCard key={category._id} category={category} />
    ))}
  </div>
);


const FeedsResults = ({ results }) => (
  <div className="space-y-6">
    {results.map((feed) => (
      <FeedCard key={feed._id} feed={feed} />
    ))}
  </div>
);

const PersonCard = ({ person }) => {
  const navigate = useNavigate();
  const { onlineUsers } = useAuth();
  const isOnline = onlineUsers.has(person?._id || person?.userId);

  const handleClick = () => {
    if (!person?._id && !person?.userId) return;
    navigate(`/home/user/profile/${person.userId || person._id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={handleClick}
      className="flex  items-center justify-between px-4 py-3  bg-white cursor-pointer transition group"
    >
      {/* Left Section - Avatar */}
      <div className="flex items-center min-w-0 gap-4">
        <div className="relative">
          <img
            src={person.profileAvatar || defaultAvater}
            alt={person.userName || person.name}
            className="w-12 h-12 rounded-full border object-cover"
            onError={(e) => {
              e.target.src = defaultAvater;
            }}
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
          )}
        </div>


        <div className="min-w-0 flex flex-col">
          {/* User name */}
          <span className="font-semibold text-gray-900 text-base truncate">
            {person.userName || "Unknown User"}
          </span>
          {/* Location or subtitle */}
          {person.location && (
            <span className="text-gray-600 text-xs mt-0.5 truncate flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {person.location}
            </span>
          )}
          {/* Mutual friends */}
          {person.mutualFriends > 0 && (
            <span className="text-gray-600 text-xs mt-0.5 truncate">
              {person.mutualFriends} mutual friend
              {person.mutualFriends !== 1 ? "s" : ""}
              {person.mutualFriendsNames && (
                <> including {person.mutualFriendsNames.join(", ")}</>
              )}
            </span>
          )}
          {/* Workplace */}
          {person.workplace && (
            <span className="text-gray-600 text-xs mt-0.5 truncate flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {person.workplace}
            </span>
          )}
          {/* Followers */}
          {person.followersCount && (
            <span className="text-gray-600 text-xs mt-0.5 truncate">
              {person.followersCount} followers
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Updated CategoryCard as list item
const CategoryCard = ({ category }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const clean = (category.tag || "").replace(/^#+/, "");
    navigate(`/home/hashtag/${clean}`);
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={handleClick}
      className="bg-white  cursor-pointer group"
    >
      <div className="flex items-center">
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">#{category.tag}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span>{category.count || 0} posts</span>
            {category.updatedAt && (
              <span>
                • Updated {new Date(category.updatedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="text-gray-400 group-hover:text-purple-600 transition-colors">
          <ArrowRight className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
};


// FeedCard with single column layout
const FeedCard = ({ feed }) => {
  if (!feed) return null;

  const mappedFeed = {
    feedId: feed.feedId || feed._id || "",
    userId: feed.createdByAccount || "",
    type: feed.type || "image",
    contentUrl: feed.contentUrl || "",
    caption: feed.caption || "",
    description: feed.dec || "",
    category: feed.category || "",
    language: feed.language || "",
    avatarToUse: feed.avatarToUse || "",
    _id: feed._id || "",
    userName: feed.userName || "Unknown",
    profileAvatar:
      feed.profileAvatar && feed.profileAvatar.trim() !== ""
        ? feed.profileAvatar
        : defaultAvater,
    timeAgo: feed.timeAgo || "",
    likesCount: feed.likesCount || 0,
    commentsCount: feed.commentsCount || 0,
    viewsCount: feed.viewsCount || 0,
    shareCount: feed.shareCount || 0,
    downloadsCount: feed.downloadsCount || 0,
    dislikesCount: feed.dislikesCount || 0,
    isLiked: feed.isLiked || false,
    isSaved: feed.isSaved || false,
    isFollowing: feed.isFollowing || false,
    isDisliked: feed.isDisliked || false,
    themeColor: feed.themeColor || {
      primary: feed.primary || "#262e39",
      secondary: feed.secondary || "#6e7782",
      accent: feed.accent || "#a7373a",
      gradient:
        feed.gradient || "linear-gradient(135deg, #262e39, #6e7782, #a7373a)",
      text: feed.text || "#FFFFFF",
    },
    images: feed.images || [],
    video: feed.video || null,
    hashtags: feed.hashtags || [],
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Postcard postData={mappedFeed} />
    </div>
  );
};

export default SearchResultsScreen;
