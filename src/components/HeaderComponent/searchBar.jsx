// src/components/SearchBar.jsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  showSearchDropdown,
  setShowSearchDropdown,
  searchRef
}) {
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = React.useState([]);
  const [filteredSuggestions, setFilteredSuggestions] = React.useState([]);

  // Load recent searches from localStorage
  const loadRecentSearches = () => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        const searches = JSON.parse(saved);
        setRecentSearches(searches);
        setFilteredSuggestions(searches);
      } catch (error) {
        console.error("Error loading recent searches:", error);
        setRecentSearches([]);
        setFilteredSuggestions([]);
      }
    }
  };

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

  // Clear all recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    setFilteredSuggestions([]);
    localStorage.removeItem("recentSearches");
  };

  // Remove single recent search
  const removeRecentSearch = (searchToRemove, e) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== searchToRemove);
    setRecentSearches(updated);
    setFilteredSuggestions(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  // Handle search input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Filter recent searches based on input
    if (value && recentSearches.length > 0) {
      const filtered = recentSearches.filter((s) => 
        s.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions(recentSearches);
    }
  };

  // Handle search submission
  const handleSearchSubmit = (query = searchQuery) => {
    if (query.trim()) {
      // Save to recent searches
      saveToRecentSearches(query);
      
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(query)}&tab=all`);
      setShowSearchDropdown(false);
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  // Handle input focus
  const handleInputFocus = () => {
    loadRecentSearches();
    setShowSearchDropdown(true);
  };

  // Handle recent search click
  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    handleSearchSubmit(search);
  };

  // Handle clear search input
  const handleClearSearch = () => {
    setSearchQuery("");
    searchRef.current?.focus();
  };

  return (
    <div className="hidden sm:flex flex-1 justify-center px-4" ref={searchRef}>
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

        {/* Search Input */}
        <input
          type="text"
          value={searchQuery}
          placeholder="Search people, hashtags, jobs, posts..."
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="w-full rounded-full pl-10 pr-10 py-2 border border-gray-200 focus:ring-2 focus:ring-green-400 bg-gray-50 outline-none transition-all duration-200"
        />

        {/* Clear search button */}
        {searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Search Suggestions Dropdown */}
        <AnimatePresence>
          {showSearchDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute mt-2 w-full bg-white shadow-xl rounded-2xl border border-gray-200 max-h-96 overflow-y-auto z-50"
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </div>
                  {recentSearches.length > 0 && (
                    <button 
                      onClick={clearRecentSearches}
                      className="text-xs text-red-500 hover:text-red-700 transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Recent Searches List */}
                <div className="space-y-1">
                  {(searchQuery ? filteredSuggestions : recentSearches).map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleRecentSearchClick(search)}
                      className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-green-50 text-gray-700 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Search className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="text-left truncate text-sm">{search}</span>
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

                {/* Empty State */}
                {recentSearches.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No recent searches</p>
                    <p className="text-gray-400 text-xs mt-1">Your search history will appear here</p>
                  </div>
                )}

                {/* View All Results Button (when typing) */}
                {searchQuery && filteredSuggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleSearchSubmit()}
                      className="w-full text-center py-2 text-green-600 hover:text-green-700 font-medium text-sm hover:bg-green-50 rounded-lg transition-colors"
                    >
                      View all results for "{searchQuery}"
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}