// ✅ src/components/Profile/PhotoGallery.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { PlayCircle } from "lucide-react";

const PhotoGallery = () => {
  const { token } = useAuth();
  const [feeds, setFeeds] = useState([]);
  const [activeTab, setActiveTab] = useState("image");
  const [loading, setLoading] = useState(true);

  // ✅ Fetch user’s own posts
  useEffect(() => {
    const fetchUserFeeds = async () => {
      try {
        const { data } = await api.get("/api/get/user/post", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success && Array.isArray(data.feeds)) {
          setFeeds(data.feeds);
        } else {
          setFeeds([]);
        }
      } catch (err) {
        console.error("❌ Failed to fetch user feeds:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchUserFeeds();
  }, [token]);

  // ✅ Separate image & video feeds
  const imageFeeds = feeds.filter((feed) => feed.type === "image");
  const videoFeeds = feeds.filter((feed) => feed.type === "video");

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">My Posts</h3>

      {/* 🧭 Tabs */}
      <div className="flex gap-4 border-b border-gray-200 mb-4">
        {[
          { id: "image", label: "Images" },
          { id: "video", label: "Videos" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative pb-2 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "text-purple-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="tab-underline"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-600 rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* 🧠 Content */}
      {loading ? (
        <p className="text-gray-500 text-sm">Loading posts...</p>
      ) : feeds.length === 0 ? (
        <p className="text-gray-500 text-sm">You haven’t posted anything yet.</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            layout
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "image" ? (
              <div className="grid grid-cols-3 gap-2">
                {imageFeeds.length === 0 ? (
                  <p className="text-gray-400 text-sm col-span-3">
                    No images uploaded yet.
                  </p>
                ) : (
                  imageFeeds.map((feed, index) => (
                    <motion.div
                      key={feed._id || index}
                      whileHover={{ scale: 1.03 }}
                      className="relative aspect-square group"
                    >
                      <img
                        src={feed.contentUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer transition-opacity duration-200 group-hover:opacity-90"
                      />

                      {/* ❤️ Likes Overlay */}
                      <div className="absolute bottom-1 right-2 text-white text-xs bg-black/50 rounded-full px-2 py-[1px]">
                        ❤️ {feed.likesCount}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {videoFeeds.length === 0 ? (
                  <p className="text-gray-400 text-sm col-span-3">
                    No videos uploaded yet.
                  </p>
                ) : (
                  videoFeeds.map((feed, index) => (
                    <motion.div
                      key={feed._id || index}
                      whileHover={{ scale: 1.03 }}
                      className="relative aspect-square group"
                    >
                      <video
                        src={feed.contentUrl}
                        className="w-full h-full object-cover rounded-lg cursor-pointer transition-opacity duration-200 group-hover:opacity-90"
                        muted
                        playsInline
                      />
                      <PlayCircle className="absolute text-white/90 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 opacity-80" />
                      {/* ❤️ Likes Overlay */}
                      <div className="absolute bottom-1 right-2 text-white text-xs bg-black/50 rounded-full px-2 py-[1px]">
                        ❤️ {feed.likesCount}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default PhotoGallery;
