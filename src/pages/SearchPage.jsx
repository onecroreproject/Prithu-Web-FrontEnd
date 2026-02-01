import React, { useState, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { Search as SearchIcon, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [categoryResults, setCategoryResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const debounceTimeout = useRef(null);

  // Search handling
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (value.trim().length > 0) {
      setLoading(true);
      debounceTimeout.current = setTimeout(async () => {
        try {
          const res = await api.post(
            "/api/search/all/category",
            { query: value },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCategoryResults(res.data.categories || []);
          setError("");
        } catch (err) {
          console.error("Category search error:", err);
          setCategoryResults([]);
          if (err.response?.status === 404) {
            setError("No categories found matching your search.");
          } else {
            setError("Failed to fetch categories.");
          }
        } finally {
          setLoading(false);
        }
      }, 400);
    } else {
      setCategoryResults([]);
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    // Navigate to Home and pass the categoryId in state
    navigate("/", { state: { selectedCategoryId: categoryId } });
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
    <div className="min-h-screen bg-white p-4 lg:p-8">
      {/* Search Header */}
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Search Categories</h1>
        <p className="text-gray-500">Find and explore content by category</p>
      </div>

      {/* Search Bar */}
      <div className="sticky top-14 lg:top-0 z-20 bg-white/80 backdrop-blur-sm py-4 mb-6">
        <div className="flex items-center w-full max-w-2xl mx-auto relative">
          <div className="flex items-center w-full bg-gray-100 rounded-2xl px-5 py-3 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-green-500/20 shadow-sm border border-transparent focus-within:border-green-500/30">
            <SearchIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Type category name (e.g. Bhakti, Motivation...)"
              value={query}
              onChange={handleSearch}
              className="flex-1 ml-3 outline-none bg-transparent text-gray-800 font-medium placeholder:text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-2xl mx-auto">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-10">
            <p className="text-gray-400 italic">{error}</p>
          </div>
        )}

        {!loading && categoryResults.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {categoryResults.map((cat) => (
              <div
                key={cat._id}
                className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-green-50 hover:border-green-100 border border-transparent transition-all cursor-pointer group shadow-sm active:scale-[0.98]"
                onClick={() => handleCategoryClick(cat._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                    <PlayCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {highlightText(cat.name, query)}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    {cat.videoCount || 0} Videos
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && query.trim() !== "" && categoryResults.length === 0 && !error && (
          <div className="text-center py-10">
            <p className="text-gray-400">No matching categories found.</p>
          </div>
        )}

        {!loading && query.trim() === "" && (
          <div className="text-center py-20 opacity-40 grayscale flex flex-col items-center">
            <SearchIcon className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-lg font-medium text-gray-500">Search for categories above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
