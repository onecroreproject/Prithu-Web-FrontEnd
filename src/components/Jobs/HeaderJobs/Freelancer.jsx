import React from "react";

const Freelancer = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-12 text-center max-w-md w-full">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Coming Soon
        </h1>
        <p className="text-gray-600 text-lg mb-8">
          Freelancer platform is under development
        </p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Freelancer;