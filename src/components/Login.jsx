import React, { useState, lazy, Suspense, memo } from "react";
import { motion } from "framer-motion";
import SEO from "./SEO";
import Footer from "./Footer";

// ✅ Lazy load for performance
const LeftPanel = lazy(() => import("./LoginPageComponents/leftPanel"));
const RightPanel = lazy(() => import("./LoginPageComponents/rightPanel"));

function LoginPage({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot'

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-y-auto overflow-x-hidden text-gray-800 bg-black">
      <div className="flex-1 flex justify-center items-center w-full py-10 px-4">
        {mode === 'register' ? (
          <SEO
            title="Prithu App Sign Up – Earn Rewards & Join Now"
            description="Explore Prithu — watch status videos, motivational, spiritual & educational reels, movie dialogues & daily life impressions with smart personalization and instant sharing."
            name="Prithu"
            type="website"
          />
        ) : (
          <SEO
            title="Prithu - Login"
            description="Explore Prithu — watch status videos, motivational, spiritual & educational reels, movie dialogues & daily life impressions with smart personalization and instant sharing."
            name="Prithu"
            type="website"
          />
        )}
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

      </div>

      {/* Refined Footer */}
      <Footer />
    </div>
  );
}

export default memo(LoginPage);
