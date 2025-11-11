import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle } from "lucide-react";

const PhotoGallery = ({ feed = [] }) => {
  const [activeTab, setActiveTab] = useState("image");

  // ✅ Pre-filter feeds into image & video arrays
  const { imageFeeds, videoFeeds } = useMemo(() => {
    return {
      imageFeeds: feed.filter((f) => f.type === "image"),
      videoFeeds: feed.filter((f) => f.type === "video"),
    };
  }, [feed]);

  return (
    <div className="bg-white dark:bg-[#1b1b1f] rounded-lg shadow-sm p-4 mt-4 border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        User Posts
      </h3>

      {/* 🧭 Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-4">
        {[{ id: "image", label: "Images" }, { id: "video", label: "Videos" }].map(
          (tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative pb-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-purple-600"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
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
          )
        )}
      </div>

      {/* 🧠 Content */}
      {feed.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No posts available.
          </p>
        </div>
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
                  <p className="text-gray-400 text-sm col-span-3 text-center">
                    No images uploaded yet.
                  </p>
                ) : (
                  imageFeeds.map((item, index) => (
                    <motion.div
                      key={item._id || index}
                      whileHover={{ scale: 1.03 }}
                      className="relative aspect-square group"
                    >
                      <img
                        src={item.contentUrl}
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg cursor-pointer transition-opacity duration-200 group-hover:opacity-90"
                      />

                      {/* ❤️ Likes Overlay */}
                      <div className="absolute bottom-1 right-2 text-white text-xs bg-black/50 rounded-full px-2 py-[1px]">
                        ❤️ {item.likesCount || 0}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {videoFeeds.length === 0 ? (
                  <p className="text-gray-400 text-sm col-span-3 text-center">
                    No videos uploaded yet.
                  </p>
                ) : (
                  videoFeeds.map((item, index) => (
                    <motion.div
                      key={item._id || index}
                      whileHover={{ scale: 1.03 }}
                      className="relative aspect-square group"
                    >
                      <video
                        src={item.contentUrl}
                        className="w-full h-full object-cover rounded-lg cursor-pointer transition-opacity duration-200 group-hover:opacity-90"
                        muted
                        playsInline
                      />
                      <PlayCircle className="absolute text-white/90 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 opacity-80" />

                      {/* ❤️ Likes Overlay */}
                      <div className="absolute bottom-1 right-2 text-white text-xs bg-black/50 rounded-full px-2 py-[1px]">
                        ❤️ {item.likesCount || 0}
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
