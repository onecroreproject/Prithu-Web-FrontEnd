import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import PrithuLogo from "../../assets/prithu_logo.webp";
import { Search, X, PlayCircle, ArrowLeft } from "lucide-react";
import api from "../../api/axios";

const SearchResultsScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchInputRef = useRef(null);

  // Fetch search results
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setCategories([]);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const response = await api.get(
          `/api/global/search?q=${encodeURIComponent(searchQuery)}`
        );

        if (response.data?.success) {
          setCategories(response.data.categories || []);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setError("Failed to fetch search results.");
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(performSearch, 200);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Update URL
  useEffect(() => {
    const newUrl = `/search?q=${encodeURIComponent(searchQuery)}`;
    window.history.replaceState(null, "", newUrl);
  }, [searchQuery]);

  const handleCategoryClick = (categoryId) => {
    navigate("/home", { state: { selectedCategoryId: categoryId } });
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-green-600 font-bold">{part}</span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full text-gray-400 group"
            >
              <ArrowLeft className="w-6 h-6 group-hover:text-gray-600" />
            </button>
            <div className="flex items-center gap-2 mr-6 shrink-0 cursor-pointer" onClick={() => navigate("/home")}>
              <img src={PrithuLogo} alt="Logo" className="w-10 h-10" />
              <span className="font-bold text-xl tracking-tight text-gray-800">PRITHU</span>
            </div>

            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories..."
                className="w-full pl-12 pr-12 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500/20 focus:bg-white transition-all outline-none text-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500 mb-4"></div>
            <p className="text-gray-400">Searching for categories...</p>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20 bg-red-50 rounded-3xl p-8 border border-red-100">
            <p className="text-red-500 font-medium">{error}</p>
          </div>
        )}

        {!loading && searchQuery && categories.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">
              Search Results
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {categories.map((cat) => (
                <motion.div
                  key={cat._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-between p-5 bg-white border border-gray-100 rounded-3xl cursor-pointer shadow-sm hover:shadow-md hover:border-green-100 transition-all group"
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all duration-300">
                      <PlayCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                        {highlightText(cat.name, searchQuery)}
                      </h3>
                      <p className="text-sm text-gray-400 font-medium">Click to explore feed</p>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-100 px-4 py-2 rounded-2xl">
                    <span className="text-green-600 font-black text-sm">
                      {cat.videoCount || 0} VIDEOS
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {!loading && searchQuery && categories.length === 0 && !error && (
          <div className="text-center py-24 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">No categories found</h3>
            <p className="text-gray-400 max-w-xs mx-auto">
              We couldn't find any categories matching "{searchQuery}". Try something else!
            </p>
          </div>
        )}

        {!searchQuery && !loading && (
          <div className="text-center py-32 opacity-20 grayscale flex flex-col items-center">
            <Search className="w-24 h-24 text-gray-300 mb-6" />
            <h3 className="text-2xl font-black text-gray-400">FIND CONTENT BY CATEGORY</h3>
            <p className="text-gray-400 mt-2 font-medium italic">Bhakti, Motivation, Sports, and more...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsScreen;

