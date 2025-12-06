// src/components/Createpost.jsx
import React, { useState, useCallback } from "react";
import { FaCamera, FaSmile, FaVideo } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CreatePostModal from "./CreatePostModal";

const Createpost = ({ onPostCreated }) => { // Add onPostCreated prop
  const [modalOpen, setModalOpen] = useState(false);
  const [comingSoon, setComingSoon] = useState(false);

  /* --------------------------------------------
     ⚡ Optimized Handlers (stable with useCallback)
  --------------------------------------------- */
  const handleOpenModal = useCallback(() => setModalOpen(true), []);
  const handleCloseModal = useCallback(() => setModalOpen(false), []);

  const handleSubmit = useCallback(async (postData) => {
    try {
      // This function should be in your API service
      // For now, let the modal handle the submission
      console.log("Post data in Createpost:", postData);
      
      // After successful post creation, call the callback
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

  /* --------------------------------------------
     ⚡ Component UI
  --------------------------------------------- */
  return (
    <>
      <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5 shadow-sm mb-6 transition hover:shadow-md">

        {/* Header */}
        <h3 className="font-semibold text-[16px] sm:text-[17px] text-[#23236A] dark:text-gray-100 mb-3">
          Create New Post
        </h3>

        {/* Input — opens modal */}
        <div
          onClick={handleOpenModal}
          className="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="text"
            readOnly
            placeholder="What's on your mind?"
            className="flex-1 rounded-full border border-gray-300 dark:border-gray-600 px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 cursor-pointer text-[14px] sm:text-[15px]"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-6 sm:gap-10 mt-4 text-[14px] sm:text-[15px] font-medium">

          {/* Photo/Video */}
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 text-[#23236A] dark:text-gray-100 hover:opacity-80"
          >
            <FaCamera className="text-green-500 text-lg" />
            <span>Photo/Video</span>
          </button>

          {/* Feeling */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComingSoon();
            }}
            className="flex items-center gap-2 text-[#23236A] dark:text-gray-100 hover:opacity-80"
          >
            <FaSmile className="text-yellow-500 text-lg" />
            <span>Feeling/Activity</span>
          </button>

          {/* Live Stream */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleComingSoon();
            }}
            className="flex items-center gap-2 text-[#23236A] dark:text-gray-100 hover:opacity-80"
          >
            <FaVideo className="text-pink-500 text-lg" />
            <span>Live Stream</span>
          </button>
        </div>
      </div>

      {/* Modal - Pass onPostCreated callback */}
      <CreatePostModal 
        open={modalOpen} 
        onClose={handleCloseModal} 
        onPostCreated={onPostCreated} 
      />

      {/* Coming Soon Popup */}
      <AnimatePresence>
        {comingSoon && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-5 py-3 rounded-full shadow-lg text-sm z-50"
          >
            🚀 Coming Soon
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Createpost);