// src/components/jobs/JobCard.jsx
import React, { memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../Service/jobservice";
import { motion, AnimatePresence } from "framer-motion";
import TopJobRoles from "./Jobs/JobCardComponets/topRoles";
import LatestOpenings from "./Jobs/JobCardComponets/latestOpenings";
import FeaturedCompanies from "./Jobs/JobCardComponets/featureCompanies";

/* --------------------------- 🔹 Skeleton Components --------------------------- */
const SkeletonBlock = ({ width = "w-full", height = "h-4" }) => (
  <div className={`bg-gray-200 rounded-md ${width} ${height} animate-pulse`} />
);

const SkeletonJobCard = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.4 }}
    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6"
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <SkeletonBlock width="w-1/3" height="h-5" />
      <SkeletonBlock width="w-16" height="h-5" />
    </div>

    {/* Top Roles */}
    <div className="space-y-3">
      {Array(3)
        .fill()
        .map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <SkeletonBlock width="w-2/3" />
            <SkeletonBlock width="w-12" />
          </div>
        ))}
    </div>

    {/* Latest Openings */}
    <div className="space-y-4 pt-3 border-t border-gray-100">
      {Array(2)
        .fill()
        .map((_, i) => (
          <div key={i} className="space-y-2">
            <SkeletonBlock width="w-3/4" />
            <SkeletonBlock width="w-1/2" />
          </div>
        ))}
    </div>

    {/* Featured Companies */}
    <div className="flex flex-wrap gap-3 pt-3 border-t border-gray-100">
      {Array(5)
        .fill()
        .map((_, i) => (
          <div key={i} className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse" />
        ))}
    </div>
  </motion.div>
);

/* --------------------------- 🔹 Main JobCard --------------------------- */
function JobCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const rankedJobs = Array.isArray(data)
    ? data
    : Array.isArray(data?.jobs)
    ? data.jobs
    : [];

  // ✅ Derived Data
  const topRoles = rankedJobs.slice(0, 5);
  const latestOpenings = [...rankedJobs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const featuredCompanies = [
    ...new Set(rankedJobs.map((job) => job.companyName).filter(Boolean)),
  ].slice(0, 5);

  // ✅ Framer Motion variants
  const fade = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.25 } },
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SkeletonJobCard key="skeleton" />
        ) : isError ? (
          <motion.div
            key="error"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl border border-gray-200 p-6 text-center text-red-500 shadow-sm"
          >
            Failed to load jobs. Please try again later.
          </motion.div>
        ) : !rankedJobs.length ? (
          <motion.div
            key="empty"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 shadow-sm"
          >
            No active jobs found.
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={fade}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-8 md:space-y-10"
          >
            <TopJobRoles roles={topRoles} />
            <LatestOpenings openings={latestOpenings} />
            <FeaturedCompanies companies={featuredCompanies} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
export default memo(JobCard);
