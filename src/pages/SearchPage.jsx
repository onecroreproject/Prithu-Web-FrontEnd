import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../api/axios";
import { Search as SearchIcon } from "lucide-react";
import Postcard from "../components/Postcard"; // your existing Postcard component

const SearchPage = () => {
  const { token, user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [allFeeds, setAllFeeds] = useState([]);
  const [filteredFeeds, setFilteredFeeds] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scrollViewMode, setScrollViewMode] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const debounceTimeout = useRef(null);

  // Fetch all feeds
  const fetchFeeds = async () => {
    if (!token) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get("/api/get/all/feeds/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const images = (res.data.feeds || [])
        .map(feed => ({
          ...feed,
          type: (feed.type || "image").toLowerCase(),
          caption: feed.caption || "",
          contentUrl: feed.contentUrl || "",
          userName: feed.userName || "Unknown",
          _id: feed._id,
          category: feed.category || null,
        }))
        .filter(feed => feed.type === "image" && feed.contentUrl);

      setAllFeeds(images);
      setFilteredFeeds(images);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch feeds");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeeds();
  }, [token]);

  // Search handling
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);

    const filtered = allFeeds.filter(feed =>
      feed.caption.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredFeeds(filtered);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    if (value.trim().length > 0) {
      debounceTimeout.current = setTimeout(async () => {
        try {
          const res = await axios.post(
            "/api/search/all/category",
            { query: value, userId: user?._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setCategorySuggestions(res.data.categories || []);
        } catch (err) {
          console.error("Category suggestion error:", err);
          setCategorySuggestions([]);
        }
      }, 300);
    } else {
      setCategorySuggestions([]);
    }
  };

  const handleCategoryClick = (categoryId) => {
    const filtered = allFeeds.filter(feed => feed.category === categoryId);
    setFilteredFeeds(filtered);
    setQuery("");
    setCategorySuggestions([]);
  };

  const highlightText = (text, highlight) => {
    if (!highlight) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        part
      )
    );
  };

  // Open scroll view for full-screen posts
  const openScrollView = (index) => {
    setActiveIndex(index);
    setScrollViewMode(true);
  };

  // Close scroll view
  const closeScrollView = () => {
    setScrollViewMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">

      {/* Search Bar */}
      <div className="sticky top-0 z-20 bg-gray-50 py-4">
        <div className="flex items-center w-full max-w-2xl mx-auto relative">
          <div className="flex items-center w-full bg-white rounded-full shadow px-4 py-2">
            <SearchIcon className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search posts..."
              value={query}
              onChange={handleSearch}
              className="flex-1 ml-2 outline-none bg-transparent text-gray-700"
            />
          </div>

          {categorySuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white shadow-md rounded mt-1 z-30 max-h-60 overflow-y-auto">
              {categorySuggestions.map((cat) => (
                <div
                  key={cat._id}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleCategoryClick(cat._id)}
                >
                  {highlightText(cat.name, query)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid or Scrollable Feed */}
      {!scrollViewMode ? (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {loading && <p className="text-center col-span-full text-gray-500">Loading feeds...</p>}
          {error && <p className="text-center col-span-full text-red-500">{error}</p>}
          {!loading && filteredFeeds.length === 0 && !error && (
            <p className="text-center col-span-full text-gray-500">No posts found.</p>
          )}
          {filteredFeeds.map((feed, index) => (
            <div
              key={feed._id}
              className="relative w-full h-40 rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => openScrollView(index)}
            >
              <img
                src={feed.contentUrl}
                alt={feed.userName}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory">
          {filteredFeeds.slice(activeIndex).map((feed, index) => (
            <div
              key={feed._id}
              className="h-screen w-full flex items-center justify-center snap-start"
            >
              <div className="w-full max-w-md h-full flex items-center justify-center relative">
                <Postcard postData={feed} authUser={user} fullScreen compact={false} />
                {/* Close Button */}
                <button
                  onClick={closeScrollView}
                  className="absolute top-6 right-6 bg-black bg-opacity-50 text-white p-2 rounded-full z-50"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
