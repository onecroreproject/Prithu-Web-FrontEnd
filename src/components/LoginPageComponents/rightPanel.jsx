import React from "react";
import { FaLeaf } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./forms/loginForm";
import RegisterForm from "./forms/registerForm";
import ForgotForm from "./forms/forgotFrom";

export default function RightPanel({ mode, setMode }) {
  const switchMode = (newMode) => setMode(newMode);

  // ✅ Smooth animation variants
  const variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
  };

  return (
    <div
      className="
        flex-1 min-h-screen md:min-h-full
        flex flex-col justify-center items-center
        relative overflow-hidden px-6 py-10 sm:px-10 md:px-12 bg-white
      "
    >
      {/* ✅ Subtle gradient overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-green-50/10 to-transparent backdrop-blur-[1px]" />

      {/* ✅ Content Box - now transparent (no bg or shadow) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
        className="
          relative z-10 w-full max-w-md p-4 sm:p-6 md:p-8
          flex flex-col justify-center items-center
        "
      >
        {/* ✅ App Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-6"
        >
          <FaLeaf className="text-white text-3xl" />
        </motion.div>

        {/* ✅ Animated Form Transitions */}
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
