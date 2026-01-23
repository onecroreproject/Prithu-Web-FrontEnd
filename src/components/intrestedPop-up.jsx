import React, { useState, useEffect } from "react";
import { Upload, SkipForward, Sparkles, Clock, CheckCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import axios from "../api/axios";

const CasualInterestPopup = ({ open, onClose, onInterestsSelected }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postStatus, setPostStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    if (open) checkPostStatus();
  }, [open]);

  const checkPostStatus = async () => {
    try {
      setLoadingStatus(true);
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
      setLoadingStatus(false);
    }
  };

  const handleWantToPost = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/post/intrested', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setPostStatus(response.data.status);
        onInterestsSelected(response.data.status);
        onClose(); // Close the modal
      }
    } catch (error) {
      console.error("Error submitting interest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onInterestsSelected("skip");
    onClose(); // Close the modal
  };

  if (!open) return null;
  if (postStatus === "allow") {
    onInterestsSelected("allow");
    onClose();
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-sm w-full relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-gray-100 hover:bg-gray-200"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        <div className="p-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          
          {loadingStatus ? (
            <div className="space-y-3">
              <div className="flex justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 text-sm">Checking your status...</p>
            </div>
          ) : postStatus === "interest" ? (
            <>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full mb-3">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Request Submitted!
              </h2>
              <p className="text-gray-600 text-sm mb-1">
                Your interest has been sent to admin
              </p>
              <p className="text-xs text-gray-500">
                We'll notify you when posting is enabled
              </p>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Want to share your story?
              </h2>
              <p className="text-gray-600 text-sm mb-1">
                Let us know if you're interested in creating posts
              </p>
              <p className="text-xs text-gray-500">
                (Admin will review your interest)
              </p>
            </>
          )}
        </div>

        <div className="px-6 pb-6 space-y-3">
          {loadingStatus ? (
            <div className="w-full py-3 flex justify-center">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : postStatus === "interest" ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg hover:shadow-lg flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Got it! Continue browsing</span>
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWantToPost}
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending request...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    <span>I Want to Post</span>
                  </>
                )}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSkip && onClose}
                className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
              >
                <SkipForward className="w-5 h-5" />
                <span>Skip for now</span>
              </motion.button>
            </>
          )}
        </div>

        {postStatus !== "interest" && !loadingStatus && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-2">How it works:</p>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                  <span>Request posting access by clicking "I Want to Post"</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                  <span>Admin will review and enable posting</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                  <span>Check back later to see if approved</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CasualInterestPopup;
