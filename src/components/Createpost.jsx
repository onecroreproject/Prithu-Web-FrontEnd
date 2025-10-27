// src/components/Createpost.jsx
import React, { useState } from "react";
import { FaCamera, FaSmile, FaVideo } from "react-icons/fa";
import CreatePostModal from "./CreatePostModal"; // Import modal

const Createpost = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  const handleSubmit = (postData) => {
    console.log("Post submitted:", postData);
    // Send to backend here
    setModalOpen(false);
  };

  return (
    <>
      {/* Input Box – Click to Open Modal */}
      <div
        onClick={handleOpenModal}
        className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm w-full mb-6 cursor-pointer hover:shadow-md transition-shadow"
      >
        {/* Header */}
        <div className="mb-2 font-semibold text-[17px] text-[#23236A]">
          Create New Post
        </div>

        {/* Input */}
        <div className="flex items-center mb-4">
          <span className="mr-2 text-blue-600">
            <svg width="22" height="22" fill="none" stroke="currentColor" className="inline-block align-middle">
              <path d="M7 17V9.5a4.5 4.5 0 119 0V17m-9 0h9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
          <input
            type="text"
            placeholder="Create New Post"
            readOnly
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-gray-700 bg-gray-50 focus:outline-none cursor-pointer"
          />
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-start space-x-8 mt-2">
          <button className="flex items-center space-x-2 text-[15px] text-[#23236A] font-medium hover:underline focus:outline-none">
            <FaCamera className="text-green-500" />
            <span>Photo/Video</span>
          </button>
          <button className="flex items-center space-x-2 text-[15px] text-[#23236A] font-medium hover:underline focus:outline-none">
            <FaSmile className="text-yellow-500" />
            <span>Feeling/Activity</span>
          </button>
          <button className="flex items-center space-x-2 text-[15px] text-[#23236A] font-medium hover:underline focus:outline-none">
            <FaVideo className="text-pink-500" />
            <span>Live Stream</span>
          </button>
        </div>
      </div>

      {/* Modal Popup */}
      <CreatePostModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default Createpost;