import React from "react";
import { motion } from "framer-motion";
import { FaLeaf, FaShoppingBag, FaHeart } from "react-icons/fa";
import PrithuLogo from "../../assets/prithu_logo.webp";
import FeatureItem from "./feautureItem";

export default function LeftPanel() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="
        flex-1 min-h-screen md:min-h-full
        bg-gradient-to-br from-green-700 via-emerald-600 to-lime-600
        text-white flex flex-col justify-center px-8 sm:px-10 md:px-12 lg:px-16 py-10
        relative overflow-hidden
      "
    >
      {/* ✅ Subtle background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-emerald-200/10 to-lime-100/10 mix-blend-overlay opacity-20" />

      <div className="relative z-10 max-w-md mx-auto md:mx-0">
        {/* ✅ Logo Section */}
        <div className="flex items-center gap-3 mb-6 transition-all duration-500">
          <img
            src={PrithuLogo}
            alt="Prithu Logo"
            className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-1.5 shadow-md"
            loading="lazy"
          />
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Prithu
          </h1>
        </div>

        {/* ✅ Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold mb-2">
            Join the Healing Circle 🌱
          </h2>
          <p className="mb-8 text-sm sm:text-base opacity-90 leading-relaxed max-w-sm">
            Heal to Positive — a mindful platform to connect, grow, and nurture your
            well-being with compassionate communities.
          </p>
        </motion.div>

        {/* ✅ Feature Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-5 sm:space-y-6"
        >
          <FeatureItem
            icon={<FaLeaf className="text-white" />}
            title="Community"
            text="Connect and grow with mindfulness."
          />
          <FeatureItem
            icon={<FaShoppingBag className="text-white" />}
            title="Wellness Shop"
            text="Curated products for a mindful lifestyle."
          />
          <FeatureItem
            icon={<FaHeart className="text-white" />}
            title="Mindful Journey"
            text="Track and nurture your personal wellness path."
          />
        </motion.div>
      </div>

      {/* ✅ Soft floating glow (static — no heavy animation) */}
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl" />
    </motion.div>
  );
}
