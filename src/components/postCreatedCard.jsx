// src/components/Createpost.jsx
import React, { useState, useCallback, useEffect } from "react";
import { FaCamera, FaSmile, FaVideo, FaImage, FaPen } from "react-icons/fa";
import { FiImage, FiVideo, FiSmile } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import CreatePostModal from "./CreatePostModal";
import CasualInterestPopup from "./intrestedPop-up";
import axios from "../api/axios";

const Createpost = ({ onPostCreated }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [interestModalOpen, setInterestModalOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check posting status on component mount
  useEffect(() => {
    checkPostStatus();
  }, []);

  const checkPostStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/post/allowed/status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setPostStatus(response.data.status);
      }
    } catch (error) {
      console.error("Error checking post status:", error);
      setPostStatus("notallow");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = useCallback(async () => {
    if (loading) return;
    
    // Check if user is allowed to post
    if (postStatus === "allow") {
      // User is allowed, open post modal directly
      setModalOpen(true);
    } else if (postStatus === "interest") {
      // User has already requested, show waiting message
      setInterestModalOpen(true);
    } else {
      // User hasn't requested yet or not allowed
      setInterestModalOpen(true);
    }
  }, [postStatus, loading]);

  const handleCloseModal = useCallback(() => setModalOpen(false), []);
  const handleCloseInterestModal = useCallback(() => setInterestModalOpen(false), []);

  const handleInterestsSelected = useCallback((status) => {
    console.log("Interest status:", status);
    
    if (status === "allow") {
      // User is now allowed to post
      setPostStatus("allow");
      setModalOpen(true);
    } else if (status === "interest") {
      // User just submitted interest
      setPostStatus("interest");
      // Refresh status after some time
      setTimeout(() => {
        checkPostStatus();
      }, 2000);
    } else if (status === "skip") {
      // User skipped, just close
    }
    
    setInterestModalOpen(false);
  }, []);

  const handleSubmit = useCallback(async (postData) => {
    try {
      console.log("Post data:", postData);
      
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      console.error("❌ Upload failed:", err?.response?.data || err.message);
    }
  }, [onPostCreated]);

  const handleComingSoon = useCallback(() => {
    setComingSoon(true);
    setTimeout(() => setComingSoon(false), 1500);
  }, []);

  // Status badge color
  const getStatusBadge = () => {
    switch(postStatus) {
      case "allow":
        return "bg-green-100 text-green-800 border-green-200";
      case "interest":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "notallow":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Status text
  const getStatusText = () => {
    switch(postStatus) {
      case "allow":
        return "Posting Enabled";
      case "interest":
        return "Awaiting Approval";
      case "notallow":
        return "Request Access";
      default:
        return "Checking Status...";
    }
  };

  // Status icon
  const getStatusIcon = () => {
    switch(postStatus) {
      case "allow":
        return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
      case "interest":
        return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full"></div>;
    }
  };

  return (
    <>
      <div className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6">
        {/* Header with status badge */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-sm">
              <FaPen className="text-white text-sm" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Create Post</h3>
              <p className="text-xs text-gray-500">Share your thoughts with community</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        {/* Input area */}
        <div
          onClick={handleOpenModal}
          className="mb-5 cursor-pointer group"
        >
          <div className={`rounded-2xl p-4 transition-all duration-200 ${
            postStatus === "allow" 
              ? "bg-gray-50 group-hover:bg-gray-100 border border-gray-200 group-hover:border-gray-300"
              : postStatus === "interest"
                ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 group-hover:border-yellow-300"
                : "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 group-hover:border-blue-300"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                postStatus === "allow" 
                  ? "bg-gradient-to-br from-green-100 to-emerald-100"
                  : postStatus === "interest"
                    ? "bg-gradient-to-br from-yellow-100 to-orange-100"
                    : "bg-gradient-to-br from-blue-100 to-indigo-100"
              }`}>
                {postStatus === "allow" 
                  ? <FaPen className="text-green-600 text-lg" />
                  : postStatus === "interest"
                    ? <div className="text-yellow-600 text-lg">⏳</div>
                    : <div className="text-blue-600 text-lg">✨</div>
                }
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  postStatus === "allow" 
                    ? "text-gray-600"
                    : postStatus === "interest"
                      ? "text-yellow-700"
                      : "text-blue-700"
                }`}>
                  {postStatus === "allow" 
                    ? "What's on your mind?"
                    : postStatus === "interest"
                      ? "Your request is being reviewed..."
                      : "Click here to request posting access"
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {postStatus === "allow" 
                    ? "Share photos, videos, or thoughts"
                    : postStatus === "interest"
                      ? "We'll notify you when approved"
                      : "Get approved by admin to start posting"
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - Only show if allowed */}
        {postStatus === "allow" && (
          <div className="grid grid-cols-3 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleOpenModal}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 hover:border-green-300 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow">
                <FiImage className="text-white text-lg" />
              </div>
              <span className="text-sm font-medium text-gray-700">Photo/Video</span>
              <span className="text-xs text-gray-500 mt-1">Add media</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                handleComingSoon();
              }}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 hover:border-yellow-300 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow">
                <FiSmile className="text-white text-lg" />
              </div>
              <span className="text-sm font-medium text-gray-700">Feeling</span>
              <span className="text-xs text-gray-500 mt-1">Add mood</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                handleComingSoon();
              }}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 hover:border-pink-300 transition-all group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center mb-2 shadow-sm group-hover:shadow-md transition-shadow">
                <FiVideo className="text-white text-lg" />
              </div>
              <span className="text-sm font-medium text-gray-700">Live</span>
              <span className="text-xs text-gray-500 mt-1">Go live</span>
            </motion.button>
          </div>
        )}

        {/* Stats footer - Show when allowed */}
        {postStatus === "allow" && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Ready to post</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Community access</span>
                </div>
              </div>
              <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                🎯 Approved user
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Interest Popup */}
      <CasualInterestPopup
        open={interestModalOpen}
        onClose={handleCloseInterestModal}
        onInterestsSelected={handleInterestsSelected}
      />

      {/* Post Modal */}
      <CreatePostModal 
        open={modalOpen && postStatus === "allow"} 
        onClose={handleCloseModal} 
        onPostCreated={handleSubmit} 
      />

      {/* Coming Soon Popup */}
      <AnimatePresence>
        {comingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-3 rounded-full shadow-lg text-sm z-50 flex items-center gap-2"
          >
            <span className="text-lg">✨</span>
            <span>Feature coming soon!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Createpost);
