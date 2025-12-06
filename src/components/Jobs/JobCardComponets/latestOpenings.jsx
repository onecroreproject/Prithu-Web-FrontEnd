import React, { useState, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../../../Service/jobservices";
import { Flame, MapPin, AlertCircle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function JobLatestOpeningsCard() {
  const { 
    data: jobs = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const latestOpenings = jobs
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  
  const navigate = useNavigate();

  const handleJobOpen = (jobId) => {
   const currentParams = new URLSearchParams(window.location.search);
    currentParams.set("jobId", jobId);
    
    navigate(`/jobs?${currentParams.toString()}`);
  };

  return (
    <div className="bg-white dark:bg-[#1b1b1f] rounded-xl border border-gray-100 dark:border-gray-800 p-4 shadow-sm hover:shadow-green-100 dark:hover:shadow-green-900/20 transition-all duration-300">
      <LatestOpenings 
        openings={latestOpenings} 
        onOpeningSelect={handleJobOpen} // Pass navigation function
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
}

/* ============================================================================
   ⭐ Combined LatestOpenings Component
   ============================================================================ */
const LatestOpenings = memo(function LatestOpenings({ 
  openings = [], 
  onOpeningSelect, // This now receives jobId for navigation
  isLoading,
  isError,
  error,
  onRetry 
}) {
 
  const fade = {
    hidden: { opacity: 0, y: 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    },
  };

  const stagger = {
    visible: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="pb-3">
        <Header />
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-2.5 rounded-lg bg-gray-50 dark:bg-[#202024] animate-pulse"
            >
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
              </div>
              <div className="flex items-center gap-1 mt-1.5">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="pb-3">
        <Header />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Failed to load openings
              </h4>
              <p className="text-xs text-red-600 dark:text-red-300 mb-3">
                {error?.message || "Unable to fetch latest job openings"}
              </p>
              <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-xs bg-red-100 dark:bg-red-800/30 hover:bg-red-200 dark:hover:bg-red-700/30 text-red-700 dark:text-red-300 px-3 py-1.5 rounded-md transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pb-3">
      {/* Header */}
      <Header />

      {/* Openings List */}
      {openings.length > 0 ? (
        <motion.ul
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid gap-1.5"
        >
          {openings.map((job, i) => (
            <motion.li
              key={job._id || i}
              variants={fade}
              onClick={() => onOpeningSelect(job._id)} // Pass job ID to navigation function
              className="p-2.5 rounded-lg bg-gray-50/70 dark:bg-[#202024]/70 
                         hover:bg-green-50 dark:hover:bg-green-900/20 
                         border border-transparent hover:border-green-200 dark:hover:border-green-800/50
                         hover:shadow-sm transition-all duration-200 cursor-pointer group"
            >
              {/* Job Title */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 group-hover:bg-green-600 transition-colors" />
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate leading-tight">
                  {job.jobTitle || "Untitled Opening"}
                </span>
              </div>

              {/* Company Name */}
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1 truncate">
                {job.companyName || job.postedBy?.companyName || "Company"}
              </div>

              {/* Location */}
              {(job.city || job.state || job.country) && (
                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                  <MapPin className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span className="truncate">
                    {[job.city, job.state, job.country]
                      .filter(Boolean)
                      .slice(0, 2)
                      .join(", ")}
                  </span>
                </div>
              )}

              {/* Salary info if available */}
              {(job.salaryMin || job.salaryMax) && (
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  ₹{job.salaryMin?.toLocaleString() || ""}
                  {job.salaryMax && ` - ₹${job.salaryMax.toLocaleString()}`}
                </div>
              )}
            </motion.li>
          ))}
        </motion.ul>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 text-center rounded-lg bg-gray-50 dark:bg-[#202024]"
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent openings available
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
            Check back later for new opportunities
          </p>
        </motion.div>
      )}
    </div>
  );
});

// Separate Header Component for reusability
const Header = memo(() => (
  <div className="flex items-center gap-2 mb-3">
    <div className="p-1.5 rounded-md bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800/30">
      <Flame className="w-4 h-4" />
    </div>
    <div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 text-sm leading-tight">
        Latest Openings
      </h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        Recently posted opportunities
      </p>
    </div>
  </div>
));