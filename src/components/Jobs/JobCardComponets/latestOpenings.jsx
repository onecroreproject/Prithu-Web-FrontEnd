// src/components/jobs/LatestOpenings.jsx
import React from "react";
import { Flame, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LatestOpenings({ openings = [] }) {
  return (
    <div className="pb-5 border-b border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gray-50 text-orange-600">
          <Flame className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">Latest Openings</h3>
      </div>

      {/* Job List */}
      <AnimatePresence>
        {openings.length > 0 ? (
          <ul className="space-y-3">
            {openings.map((job, i) => (
              <motion.li
                key={job._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-3 rounded-lg hover:bg-orange-50 hover:shadow-sm transition-all duration-300 cursor-pointer group"
              >
                {/* Job Title */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-600 group-hover:scale-125 transition-transform" />
                  <span className="text-sm sm:text-base font-medium text-gray-800 group-hover:text-orange-700 transition-colors">
                    {job.title || "Untitled Opening"}
                  </span>
                </div>

                {/* Location */}
                {job.location && (
                  <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{job.location}</span>
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No recent openings</p>
        )}
      </AnimatePresence>
    </div>
  );
}
