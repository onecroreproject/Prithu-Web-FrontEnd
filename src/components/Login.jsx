import React, { useState, lazy, Suspense, memo } from "react";
import { motion } from "framer-motion";

// ✅ Lazy load for performance
const LeftPanel = lazy(() => import("./LoginPageComponents/leftPanel"));
const RightPanel = lazy(() => import("./LoginPageComponents/rightPanel"));

function LoginPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'forgot'

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden text-gray-800 bg-black">
      {/* ✅ Optimized Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="absolute inset-0 w-full h-full object-cover scale-105 will-change-transform"
      >
        <source
          src="https://cdn.pixabay.com/video/2021/07/28/82408-583908341_large.mp4"
          type="video/mp4"
        />
      </video>

      {/* ✅ Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-900/70 via-emerald-800/70 to-lime-900/70 backdrop-blur-[2px]" />

      {/* ✅ Animated Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{
          duration: 0.45,
          type: "spring",
          stiffness: 120,
          damping: 14,
        }}
        className="relative flex flex-col md:flex-row w-[100%] max-w-[900px] bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md overflow-hidden z-10 shadow-lg md:shadow-xl"
      >
        <Suspense
        >
          {/* ✅ Left Panel (hidden on small screens) */}
          <div className="hidden md:block md:w-1/2">
            <LeftPanel />
          </div>

          {/* ✅ Right Panel (always visible) */}
          <div className="w-full md:w-1/2">
            <RightPanel mode={mode} setMode={setMode} />
          </div>
        </Suspense>
      </motion.div>

      {/* ✅ Floating Footer Text (Animated) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: [0, -10, 0] }}
        className="absolute bottom-5 text-white/80 text-xs md:text-sm tracking-wide text-center px-2"
      >
        © 2025 | Secure Login Portal — All Rights Reserved
      </motion.div>
    </div>
  );
}

export default memo(LoginPage);
