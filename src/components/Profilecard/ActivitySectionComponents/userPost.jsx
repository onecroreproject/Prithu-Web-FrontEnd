import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from ".././../../api/axios";
import Postcard from "../../FeedPageComponent/Postcard";

const UserPosts = ({ authUser, token, id }) => {
  const [activeTab, setActiveTab] = useState("image");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'allPhotos'
  const [menuOpen, setMenuOpen] = useState(null); // Track which post's menu is open
  const [deletingPost, setDeletingPost] = useState(null); // Track which post is being deleted
  const videoRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let res;

        // 🔥 If id exists → fetch single user's posts
        if (id) {
          res = await api.get(`/api/get/single/user/post?id=${id}`);
        } 
        
        // 🔥 If no id → fetch logged-in user's posts
        else {
          res = await api.get("/api/get/user/post");
        }

        console.log("User Posts:", res.data);
        setPosts(res.data?.feeds || []);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [id]);

  // Filter posts
  const imagePosts = posts.filter((p) => p.type === "image");
  const videoPosts = posts.filter((p) => p.type === "video");
  
  // Determine which posts to show based on view mode
  const getCurrentPosts = () => {
    if (viewMode === "allPhotos") {
      return imagePosts;
    }
    return activeTab === "image" ? imagePosts : videoPosts;
  };

  const currentPosts = getCurrentPosts();

  // Handle menu toggle
  const handleMenuToggle = (postId, event) => {
    event.stopPropagation();
    setMenuOpen(menuOpen === postId ? null : postId);
  };

  // Handle delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeletingPost(postId);
    setMenuOpen(null);

    try {
      await api.delete("/api/user/delete/feed", {
        data: { feedId: postId },
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove post from state immediately
      setPosts(prev => prev.filter(post => post._id !== postId));
      
      // Show success message
      alert("Post deleted successfully!");
      
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post. Please try again.");
    } finally {
      setDeletingPost(null);
    }
  };

  // Handle video click to open fullscreen
  const handleVideoClick = (post) => {
    setFullscreenVideo(post);
  };

  // Close fullscreen video
  const closeFullscreenVideo = () => {
    setFullscreenVideo(null);
  };

  // Handle see all photos click
  const handleSeeAllPhotos = () => {
    setViewMode("allPhotos");
    setActiveTab("image"); // Ensure we're on photos tab
  };

  // Handle back to grid view
  const handleBackToGrid = () => {
    setViewMode("grid");
  };

  // Handle post actions
  const handleHidePost = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handleNotInterested = (postId) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  // Handle escape key to close fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        closeFullscreenVideo();
      }
    };

    if (fullscreenVideo) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [fullscreenVideo]);

  // Render 3-dot menu for each card
  const renderMenuButton = (post) => {
    return (
      <div className="relative" ref={menuRef}>
        {/* Three dots button */}
        <button
          onClick={(e) => handleMenuToggle(post._id, e)}
          className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-1.5 rounded-full transition-all z-10"
          disabled={deletingPost === post._id}
        >
          {deletingPost === post._id ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
          )}
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen === post._id && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-10 right-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[120px]"
            >
              <button
                onClick={() => handleDeletePost(post._id)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Render header based on view mode
  const renderHeader = () => {
    if (viewMode === "allPhotos") {
      return (
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleBackToGrid}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Photos</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              All Photos ({imagePosts.length})
            </h1>
          </div>
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {activeTab === "image" ? "Photos" : "Videos"}
        </h1>
        {activeTab === "image" && imagePosts.length > 0 && (
          <button 
            onClick={handleSeeAllPhotos}
            className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors"
          >
            See all photos
          </button>
        )}
      </div>
    );
  };

  // Render tabs only in grid view
  const renderTabs = () => {
    if (viewMode === "allPhotos") return null;

    return (
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("image")}
          className={`py-3 px-6 text-sm font-medium transition-all ${
            activeTab === "image"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Photos
        </button>
        <button
          onClick={() => setActiveTab("video")}
          className={`py-3 px-6 text-sm font-medium transition-all ${
            activeTab === "video"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Videos
        </button>
      </div>
    );
  };

  // Render content based on view mode
  const renderContent = () => {
    if (loading) {
      return <p className="text-gray-500 text-center py-8">Loading posts...</p>;
    }

    if (currentPosts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No {viewMode === "allPhotos" ? "photos" : activeTab === "image" ? "photos" : "videos"} found.
          </p>
          <p className="text-gray-400 text-sm mt-2">
            {viewMode === "allPhotos" || activeTab === "image"
              ? "Upload your first photo to get started"
              : "Upload your first video to get started"}
          </p>
        </div>
      );
    }

    if (viewMode === "allPhotos") {
      // Full Postcard view for all photos
      return (
        <motion.div
          className="space-y-6 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {currentPosts.map((post, index) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative"
            >
              {/* Add menu button to Postcard view */}
              {renderMenuButton(post)}
              <Postcard
                postData={post}
                authUser={authUser}
                token={token}
                onHidePost={() => handleHidePost(post._id)}
                onNotInterested={() => handleNotInterested(post._id)}
              />
            </motion.div>
          ))}
        </motion.div>
      );
    }

    // Grid view for photos/videos
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentPosts.map((post) => (
                <motion.div
                  key={post._id}
                  className="relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100"
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Three dots menu */}
                  {renderMenuButton(post)}

                  {post.type === "image" ? (
                    <div className="aspect-[4/3]">
                      <img
                        src={post.contentUrl}
                        alt="User post"
                        className="w-full h-full object-cover cursor-pointer"
                      />
                    </div>
                  ) : (
                    <div
                      className="relative h-[250px] cursor-pointer"
                      onClick={() => handleVideoClick(post)}
                    >
                      <video
                        src={post.contentUrl}
                        className="w-full h-full object-cover"
                        poster={post.thumbnail}
                      />
                      {/* Video duration overlay */}
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                        {post.duration || "00:00"}
                      </div>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-40 rounded-full p-3">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Engagement metrics */}
                  <div className="absolute bottom-2 left-2 flex items-center space-x-2">
                    <div className="flex items-center space-x-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      <span>❤️</span>
                      <span>{post.likesCount || 0}</span>
                    </div>
                    {post.type === "video" && (
                      <div className="flex items-center space-x-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                        <span>👁️</span>
                        <span>{post.viewsCount || 0}</span>
                      </div>
                    )}
                  </div>

                  {/* Caption preview (only show if exists) */}
                  {post.caption && (
                    <div className="p-3">
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {post.caption}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      {renderHeader()}

      {/* Tabs */}
      {renderTabs()}

      {/* Content */}
      {renderContent()}

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {fullscreenVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          >
            {/* Close Button */}
            <button
              onClick={closeFullscreenVideo}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-all z-10"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* Video Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-4xl"
            >
              <video
                ref={videoRef}
                src={fullscreenVideo.contentUrl}
                controls
                autoPlay
                className="w-full h-auto max-h-[85vh] rounded-lg"
                controlsList="nodownload"
              >
                Your browser does not support the video tag.
              </video>

              {/* Video Info Overlay */}
              <div className="absolute -bottom-16 left-0 right-0 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                      <span>❤️</span>
                      <span>{fullscreenVideo.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-black bg-opacity-50 px-3 py-1 rounded-full">
                      <span>👁️</span>
                      <span>{fullscreenVideo.viewsCount || 0}</span>
                    </div>
                  </div>
                  <div className="bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                    {fullscreenVideo.duration || "00:00"}
                  </div>
                </div>

                {/* Video Caption */}
                {fullscreenVideo.caption && (
                  <div className="mt-2 bg-black bg-opacity-50 px-3 py-2 rounded-lg">
                    <p className="text-sm">{fullscreenVideo.caption}</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Click outside to close */}
            <div
              className="absolute inset-0 -z-10"
              onClick={closeFullscreenVideo}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserPosts;