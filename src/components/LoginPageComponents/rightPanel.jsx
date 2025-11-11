import React from "react";
import { FaLeaf } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./forms/loginForm";
import RegisterForm from "./forms/registerForm";
import ForgotForm from "./forms/forgotFrom";

export default function RightPanel({ mode, setMode }) {
  const switchMode = (newMode) => setMode(newMode);

  // ✅ Simplified animation variants
  const variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.25, ease: "easeIn" } },
  };

  return (
    <div
      className="
        flex-1 min-h-screen md:min-h-full
        flex flex-col justify-center items-center
        relative overflow-hidden px-6 py-10 sm:px-10 md:px-12 bg-white
      "
    >
      {/* ✅ Gentle gradient background for contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-green-50/10 to-transparent" />

      {/* ✅ Main content box with minimal fade-in */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center"
      >
        {/* ✅ App Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6 shadow-md"
        >
          <FaLeaf className="text-white text-3xl" />
        </motion.div>

        {/* ✅ Animated form transitions (lightweight) */}
        <AnimatePresence mode="wait">
          {mode === "login" && (
            <motion.div
              key="login"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <LoginForm switchMode={switchMode} />
            </motion.div>
          )}
          {mode === "register" && (
            <motion.div
              key="register"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <RegisterForm switchMode={switchMode} />
            </motion.div>
          )}
          {mode === "forgot" && (
            <motion.div
              key="forgot"
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <ForgotForm switchMode={switchMode} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
