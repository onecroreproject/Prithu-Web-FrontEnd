import React, { useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../../../Service/jobservice";
import UnifiedJobPopup from "./unifiedJobPopUp";
import { Flame, MapPin } from "lucide-react";
import { motion } from "framer-motion";

export default function JobLatestOpeningsCard() {
  
   const { data: jobs = [], isLoading, isError } = useQuery({
      queryKey: ["rankedJobs"],
      queryFn: fetchRankedJobs,
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    });

  const latestOpenings = jobs
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const [popup, setPopup] = useState({ open: false, data: null });
  const openPopup = (data) => setPopup({ open: true, data });
  const closePopup = () => setPopup({ open: false, data: null });

  if (isLoading) return <div className="p-4 bg-white rounded-xl">Loading…</div>;
  if (isError) return <div className="p-4 bg-red-100 rounded-xl">Error</div>;

  return (
    <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <LatestOpenings openings={latestOpenings} onOpeningSelect={openPopup} />

      <UnifiedJobPopup
        open={popup.open}
        onClose={closePopup}
        type="role"
        data={popup.data}
        allJobs={jobs}
      />
    </div>
  );
}

/* ============================================================================
   ⭐ Combined LatestOpenings Component (Previously LatestOpenings.jsx)
   ============================================================================ */
const LatestOpenings = memo(function LatestOpenings({ openings = [], onOpeningSelect }) {
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
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1.5 rounded-md bg-gray-50 dark:bg-[#252530] text-orange-600">
          <Flame className="w-4 h-4" />
        </div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm sm:text-base">
          Latest Openings
        </h3>
      </div>

      {/* Openings List */}
      {openings.length > 0 ? (
        <ul className="grid gap-2 sm:gap-3">
          {openings.map((job, i) => (
            <motion.li
              key={job._id || i}
              variants={fade}
              initial="hidden"
              animate="visible"
              onClick={() => onOpeningSelect && onOpeningSelect(job)}
              className="p-3 rounded-lg bg-gray-50/50 dark:bg-[#202024]/50 
                         hover:bg-orange-50 dark:hover:bg-orange-900/20 
                         hover:shadow-sm transition-all duration-200 cursor-pointer"
            >
              {/* Job Title */}
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-600" />
                <span className="text-sm sm:text-base font-medium text-gray-800 dark:text-gray-200 truncate">
                  {job.title || "Untitled Opening"}
                </span>
              </div>

              {/* Location */}
              {job.location && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span className="truncate">{job.location}</span>
                </div>
              )}
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
          No recent openings.
        </p>
      )}
    </div>
  );
});
