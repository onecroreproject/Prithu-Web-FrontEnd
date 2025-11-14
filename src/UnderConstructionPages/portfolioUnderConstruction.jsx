import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PortfolioUnderConstruction = ({ username}) => {
  const [darkMode, setDarkMode] = useState(false);
  const navigate=useNavigate();

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-500 ${
        darkMode ? "bg-gray-900 text-gray-300" : "bg-gray-100 text-gray-700"
      }`}
    >

      {/* ✨ Animated Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center max-w-md"
      >
        <motion.h1
          className="text-3xl font-semibold mb-3"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        >
          Welcome, <span className="text-blue-500 dark:text-blue-400">{username}</span>!
        </motion.h1>

        <p className="text-lg leading-relaxed mb-6">
          Your <strong>portfolio</strong> is currently under construction by our
          team. 🚧 <br />
          Please update your <strong>curriculum</strong> in your{" "}
          <button  onClick={() => navigate("/profile")} className="text-blue-500 dark:text-blue-400 font-medium cursor-pointer">
            Profile Settings
          </button>{" "}
          to get started.
        </p>

        {/* Loading animation */}
        <motion.div
          className="flex justify-center mt-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-10 h-10 border-4 border-blue-400 dark:border-blue-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PortfolioUnderConstruction;
