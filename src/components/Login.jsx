import React, { useState } from "react";
import { motion } from "framer-motion";
import LeftPanel from "./LoginPageComponents/leftPanel";
import RightPanel from "./LoginPageComponents/rightPanel";

export default function LoginPage() {
  const [mode, setMode] = useState("login"); // 'login' | 'register' | 'forgot'

  return (
    <div className="relative min-h-screen flex justify-center items-center overflow-hidden text-gray-800">
      {/* Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://cdn.pixabay.com/video/2021/07/28/82408-583908341_large.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-emerald-800/60 to-lime-900/60 backdrop-blur-sm" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative flex w-full max-w-2xl mx-auto bg-white/10 rounded-3xl shadow-2xl overflow-hidden z-10 border border-white/20 backdrop-blur-md"
      >
        <LeftPanel />
        <RightPanel mode={mode} setMode={setMode} />
      </motion.div>
    </div>
  );
}
