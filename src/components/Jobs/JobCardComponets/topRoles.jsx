// src/components/jobs/TopJobRoles.jsx
import React from "react";
import { Briefcase, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopJobRoles({ roles = [] }) {
  return (
    <div className="pb-5 border-b border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gray-50 text-blue-600">
          <Briefcase className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-800 text-sm">Top Job Roles</h3>
      </div>

      {/* List */}
      <AnimatePresence>
        {roles.length > 0 ? (
          <ul className="space-y-3">
            {roles.map((role, i) => (
              <motion.li
                key={role._id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="p-3 rounded-lg hover:bg-blue-50 hover:shadow-sm cursor-pointer group transition-all duration-300"
              >
                {/* Role Title */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                  <span className="text-sm sm:text-base font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                    {role.title || role.keyword || "Untitled Role" || role.jobRole}
                  </span>
                </div>

                {/* Location */}
                {role.location && (
                  <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    <span>{role.location}</span>
                  </div>
                )}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No roles available</p>
        )}
      </AnimatePresence>
    </div>
  );
}
