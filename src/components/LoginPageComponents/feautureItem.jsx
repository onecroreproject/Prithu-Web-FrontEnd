import React from "react";
import { motion } from "framer-motion";

export default function FeatureItem({ icon, title, text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-3"
    >
      <div className="w-10 h-10 flex items-center justify-center border-2 border-white/50 rounded-lg">
        {icon}
      </div>
      <div>
        <h3 className="text-md font-semibold">{title}</h3>
        <p className="text-sm opacity-80">{text}</p>
      </div>
    </motion.div>
  );
}
