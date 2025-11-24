// src/components/SearchResultsScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search,
  ArrowRight,
  Users,
  Briefcase,
  Folder,
  Clock,
  X
} from "lucide-react";
import api from "../../api/axios";

const SearchResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "all");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [results, setResults] = useState({ all: [], people: [], categories: [], jobs: [] });
  const [loading, setLoading] = useState(false);

  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);

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
      const filtered = recentSearches.filter((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
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
        setResults({ all: [], people: [], categories: [], jobs: [] });
        return;
      }

      setLoading(true);
      try {
        const response = await api.get(`/api/global/search?q=${encodeURIComponent(searchQuery)}`);

        if (response.data?.success) {
          const { people = [], categories = [], jobs = [] } = response.data;

          // Combine into "all" (people + categories + jobs) for the All tab
          const allCombined = [
            ...people.map((p) => ({ ...p, __type: 'person' })),
            ...categories.map((c) => ({ ...c, __type: 'category' })),
            ...jobs.map((j) => ({ ...j, __type: 'job' })),
          ];

          setResults({ all: allCombined, people, categories, jobs });

          // Save query to recent searches
          saveToRecentSearches(searchQuery);
        } else {
          setResults({ all: [], people: [], categories: [], jobs: [] });
        }
      } catch (error) {
        console.error("Search error:", error);
        setResults({ all: [], people: [], categories: [], jobs: [] });
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update URL when tab changes or query changes
  useEffect(() => {
    const newUrl = `/search?q=${encodeURIComponent(searchQuery)}&tab=${activeTab}`;
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
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => handleSearchSubmit(suggestion);
  const handleInputFocus = () => setShowSuggestions(true);
  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const tabs = [
    { id: 'all', label: 'All Results', icon: Search, count: results.all.length, color: 'green' },
    { id: 'people', label: 'People', icon: Users, count: results.people.length, color: 'blue' },
    { id: 'categories', label: 'Categories', icon: Folder, count: results.categories.length, color: 'purple' },
    { id: 'jobs', label: 'Jobs', icon: Briefcase, count: results.jobs.length, color: 'orange' },
  ];

  const hasResults = results.all.length > 0 || results.people.length > 0 || results.categories.length > 0 || results.jobs.length > 0;
  const showRecentSearches = showSuggestions && (recentSearches.length > 0 || filteredSuggestions.length > 0);

  return (
   <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
  {/* Header */}
  <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60 sticky top-0 z-40">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between mb-6">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-8">
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
                placeholder="Search people, categories, jobs..."
                className="w-full pl-12 pr-12 py-4 border-2 border-green-300 rounded-2xl focus:ring-4 focus:ring-green-200 focus:border-green-500 bg-white/80 backdrop-blur-sm outline-none transition-all duration-300 text-lg shadow-sm hover:shadow-md"
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
                        <button onClick={clearRecentSearches} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 transition-colors">Clear all</button>
                      )}
                    </div>

                    <div className="space-y-1">
                      {(searchQuery ? filteredSuggestions : recentSearches).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(search)}
                          className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-green-50 text-gray-700 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Search className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-left truncate">{search}</span>
                          </div>
                          <button onClick={(e) => removeRecentSearch(search, e)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-100 rounded-lg transition-all flex-shrink-0 ml-2">
                            <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                          </button>
                        </button>
                      ))}
                    </div>

                    {recentSearches.length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-gray-500 text-sm">No recent searches</p>
                        <p className="text-gray-400 text-xs mt-1">Your search history will appear here</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex">
          <button onClick={handleBack} className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200">
            <span className="font-medium">Back</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Main Content */}
  <div className="max-w-7xl mx-auto px-6 py-8">
    <div className="flex gap-8">
      {/* Left Side - Tabs - Fixed Position */}
      <div className="w-80 flex-shrink-0">
        <div className="sticky top-32">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Results</h3>
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    activeTab === tab.id
                      ? "bg-green-50 border-2 border-green-200 shadow-sm"
                      : "hover:bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activeTab === tab.id
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{tab.label}</div>
                    <div
                      className={`text-sm ${
                        activeTab === tab.id ? "text-green-600" : "text-gray-500"
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
                    <span className="font-medium">{results.all.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>People</span>
                    <span className="font-medium">{results.people.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Categories</span>
                    <span className="font-medium">{results.categories.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Jobs</span>
                    <span className="font-medium">{results.jobs.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Side - Results - Scrollable */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results{searchQuery && (<span className="text-green-600 ml-2">"{searchQuery}"</span>)}</h1>
            <p className="text-gray-500">
              {hasResults && activeTab !== 'all' ? `Found ${results[activeTab]?.length || 0} ${activeTab}` : hasResults ? `Found ${results.all.length} results` : 'Start typing to search'}
            </p>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/60 p-6"
            >
              {renderContent({ loading, hasResults, results, activeTab, searchQuery })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

// Content renderer
const renderContent = ({ loading, hasResults, results, activeTab, searchQuery }) => {
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
        <h3 className="text-2xl font-bold text-gray-700 mb-3">Start Exploring</h3>
        <p className="text-gray-500 text-lg max-w-md mx-auto">Enter a search term to discover people, categories, and jobs</p>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="text-center py-20">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found for "{searchQuery}"</h3>
        <p className="text-gray-500">Try different keywords or explore trending topics</p>
      </div>
    );
  }

  const currentResults = results[activeTab] || [];
  if (currentResults.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {activeTab === 'people' && <Users className="w-6 h-6 text-gray-400" />}
          {activeTab === 'categories' && <Folder className="w-6 h-6 text-gray-400" />}
          {activeTab === 'jobs' && <Briefcase className="w-6 h-6 text-gray-400" />}
          {activeTab === 'all' && <Search className="w-6 h-6 text-gray-400" />}
        </div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No {activeTab} found</h3>
        <p className="text-gray-500">Try a different search term or browse other categories</p>
      </div>
    );
  }

  switch (activeTab) {
    case 'all':
      return <AllResults results={results} />;
    case 'people':
      return <PeopleResults results={currentResults} />;
    case 'categories':
      return <CategoriesResults results={currentResults} />;
    case 'jobs':
      return <JobsResults results={currentResults} />;
    default:
      return <AllResults results={results} />;
  }
};

// Subcomponents
const AllResults = ({ results }) => (
  <div className="space-y-8">
    {results.people.length > 0 && (
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">People</h2>
            <p className="text-gray-500">{results.people.length} people found</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.people.slice(0, 4).map((person) => (
            <PersonCard key={person._id} person={person} />
          ))}
        </div>
      </section>
    )}

    {results.categories.length > 0 && (
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Folder className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
            <p className="text-gray-500">{results.categories.length} categories found</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.categories.slice(0, 8).map((category) => (
            <CategoryCard key={category._id} category={category} />
          ))}
        </div>
      </section>
    )}

    {results.jobs.length > 0 && (
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Jobs</h2>
            <p className="text-gray-500">{results.jobs.length} jobs found</p>
          </div>
        </div>
        <div className="space-y-4">
          {results.jobs.slice(0, 4).map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </div>
      </section>
    )}
  </div>
);

const PeopleResults = ({ results }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {results.map((person) => (
      <PersonCard key={person._id} person={person} />
    ))}
  </div>
);

const CategoriesResults = ({ results }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {results.map((category) => (
      <CategoryCard key={category._id} category={category} />
    ))}
  </div>
);

const JobsResults = ({ results }) => (
  <div className="space-y-4">
    {results.map((job) => (
      <JobCard key={job._id} job={job} />
    ))}
  </div>
);

// Card Components
const PersonCard = ({ person }) => (
  <motion.div whileHover={{ scale: 1.02, y: -2 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group">
    <div className="flex items-center gap-4">
      <div className="relative">
        <img src={person.profileAvatar || "/default.png"} alt={person.userName || person.name} className="w-16 h-16 rounded-2xl object-cover border-2 border-white group-hover:border-blue-200 transition-colors" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
          <Users className="w-3 h-3 text-white" />
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-gray-900 text-lg">{person.userName || person.name}</h3>
        <p className="text-gray-600">{person.name || ''}</p>
        <p className="text-sm text-gray-500 mt-2 line-clamp-2">{person.bio || "No bio available"}</p>
      </div>
    </div>
  </motion.div>
);

const CategoryCard = ({ category }) => (
  <motion.div whileHover={{ scale: 1.05 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer text-center group" onClick={() => { window.dispatchEvent(new CustomEvent("filterFeedByCategory", { detail: { categoryId: category._id } })); window.location.href = "/"; }}>
    <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:from-purple-200 group-hover:to-blue-200 transition-all">
      <Folder className="w-8 h-8 text-purple-600" />
    </div>
    <h3 className="font-bold text-gray-900 text-lg mb-2">{category.name}</h3>
    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium inline-block">{category.postCount || 0} posts</div>
  </motion.div>
);

const JobCard = ({ job }) => (
  <motion.div whileHover={{ scale: 1.01, y: -1 }} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
          <Briefcase className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{job.title}</h3>
          <p className="text-gray-600">{job.companyName}</p>
        </div>
      </div>
      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">{job.jobType || '—'}</span>
    </div>
    <div className="flex items-center gap-4 text-sm text-gray-600">
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" />
        <span>{job.location || '—'}</span>
      </div>
      <div className="flex items-center gap-1">
        <svg className="w-4 h-4" />
        <span>{job.salary || '—'}</span>
      </div>
    </div>
  </motion.div>
);

export default SearchResultsScreen;
