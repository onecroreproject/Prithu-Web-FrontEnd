import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from ".././../../api/axios";

const UserPosts = () => {
  const [activeTab, setActiveTab] = useState("image");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await api.get("/api/get/user/post");
        console.log(res.data);
        setPosts(res.data?.feeds || []);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  // Filter posts
  const imagePosts = posts.filter((p) => p.type === "image");
  const videoPosts = posts.filter((p) => p.type === "video");
  const currentPosts = activeTab === "image" ? imagePosts : videoPosts;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        <button
          onClick={() => setActiveTab("image")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "image"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Images
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`py-2 px-4 text-sm font-medium ${
            activeTab === "video"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Videos
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <p className="text-gray-500 text-center">Loading posts...</p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
          >
            {currentPosts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center col-span-full">
                No {activeTab} posts found.
              </p>
            ) : (
              currentPosts.map((post) => (
                <motion.div
                  key={post._id}
                  className="relative bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  {post.type === "image" ? (
                    <img
                      src={post.contentUrl}
                      alt="User post"
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <video
                      src={post.contentUrl}
                      controls
                      className="w-full h-56 object-cover"
                    />
                  )}

                  {/* Like Count */}
                  <div className="absolute bottom-2 left-2 bg-transparent bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                    ❤️ {post.likesCount || 0} Likes
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default UserPosts;
