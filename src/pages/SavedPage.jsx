import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

const SavedPage = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [savedReels, setSavedReels] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedFeeds = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/user/get/saved/feeds");
        const feeds = res.data.savedFeeds || [];

        setSavedPosts(feeds.filter(f => f.type === "image"));
        setSavedReels(feeds.filter(f => f.type === "video"));
      } catch (err) {
        console.error("Failed to fetch saved feeds", err);
        toast.error("Failed to load saved items");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedFeeds();
  }, []);

  const handleItemClick = (id) => {
    navigate(`/post/${id}`);
  };

  const renderGrid = (items, type) => (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
        {items.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-8">
            No saved {type} yet.
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item._id}
              className="w-full aspect-square overflow-hidden rounded-md relative cursor-pointer group"
              onClick={() => handleItemClick(item._id)}
            >
              {type === "posts" ? (
                <img
                  src={item.contentUrl}
                  alt="post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
              ) : (
                <video
                  src={item.contentUrl}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loop
                  muted
                  poster={item.thumbnailUrl || undefined}
                />
              )}
              {type === "reels" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all">
                  <svg
                    className="w-12 h-12 text-white opacity-0 group-hover:opacity-100"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6 4a2 2 0 00-2 2v1h12V6a2 2 0 00-2-2H6zM2 7v5a2 2 0 002 2h12a2 2 0 002-2V7H2zm14 0v5a2 2 0 01-2 2H4a2 2 0 01-2-2V7h16z" />
                  </svg>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full max-w-6xl">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="w-full aspect-square bg-gray-200 animate-pulse rounded-md"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen">
      {/* Back button */}
      <div className="flex items-center p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-6 border-b border-gray-300 flex-shrink-0">
        <button
          className={`px-6 py-2 font-semibold transition-colors ${
            activeTab === "posts"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          className={`px-6 py-2 font-semibold transition-colors ${
            activeTab === "reels"
              ? "border-b-2 border-blue-500 text-blue-500"
              : "text-gray-500 hover:text-blue-500"
          }`}
          onClick={() => setActiveTab("reels")}
        >
          Reels
        </button>
      </div>

      {/* Grid Content */}
      {activeTab === "posts"
        ? renderGrid(savedPosts, "posts")
        : renderGrid(savedReels, "reels")}
    </div>
  );
};

export default SavedPage;
