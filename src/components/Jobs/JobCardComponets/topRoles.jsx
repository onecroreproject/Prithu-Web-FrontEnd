import React, { useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../../../Service/jobservice";
import UnifiedJobPopup from "./unifiedJobPopUp";
import { Briefcase, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function JobTopRolesCard() {
  /* ---------------------- 🔹 Fetch Ranked Jobs ---------------------- */
  const { data: jobs = [], isLoading, isError } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const topRoles = jobs.slice(0, 5);

  const [popup, setPopup] = useState({ open: false, data: null });

  const openPopup = (data) => setPopup({ open: true, data });
  const closePopup = () => setPopup({ open: false, data: null });

  if (isLoading)
    return <div className="p-4 rounded-xl bg-white shadow">Loading...</div>;

  if (isError)
    return <div className="p-4 rounded-xl bg-red-100">Error loading jobs</div>;

  return (
    <motion.div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <TopJobRoles roles={topRoles} onRoleSelect={openPopup} />

      <UnifiedJobPopup
        open={popup.open}
        onClose={closePopup}
        type="role"
        data={popup.data}
        allJobs={jobs}
      />
    </motion.div>
  );
}

/* ============================================================================
   ⭐ Combined TopJobRoles Component
   ============================================================================ */
const TopJobRoles = memo(function TopJobRoles({ roles = [], onRoleSelect }) {
  const fade = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.25, ease: "easeOut" },
    },
  };

  return (
    <div className="pb-5 border-b border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gray-50 dark:bg-[#252530] text-blue-600">
          <Briefcase className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
          Top Job Roles
        </h3>
      </div>

      {/* List */}
      {roles.length > 0 ? (
        <ul className="space-y-3">
          {roles.map((role, i) => (
            <motion.li
              key={role._id || i}
              variants={fade}
              initial="hidden"
              animate="visible"
              onClick={() => onRoleSelect && onRoleSelect(role)}
              className="p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm cursor-pointer group transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-125 transition-transform" />
                <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                  {role.title || role.keyword || role.jobRole || "Untitled Role"}
                </span>
              </div>

              {role.location && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs sm:text-sm">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>{role.location}</span>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">No roles available</p>
      )}
    </div>
  );
});
