// src/components/jobs/FeaturedCompanies.jsx
import React from "react";
import { Star, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeaturedCompanies({ companies = [] }) {
  return (
    <div className="pb-2">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gray-50 text-yellow-600">
          <Star className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">Featured Companies</h3>
      </div>

      {/* Companies List */}
      <AnimatePresence>
        {companies.length > 0 ? (
          <ul className="space-y-3">
            {companies.map((company, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-3 rounded-lg hover:bg-yellow-50 hover:shadow-sm transition-all duration-300 cursor-pointer group"
              >
                {/* Company Info */}
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-600 group-hover:scale-125 transition-transform" />
                  <Building2 className="w-4 h-4 text-yellow-500 group-hover:text-yellow-600 transition-colors" />
                  <span className="text-sm sm:text-base font-medium text-gray-800 group-hover:text-yellow-700 transition-colors">
                    {company || "Unnamed Company"}
                  </span>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No featured companies</p>
        )}
      </AnimatePresence>
    </div>
  );
}
