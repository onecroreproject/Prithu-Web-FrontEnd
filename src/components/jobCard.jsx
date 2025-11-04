// src/components/jobs/JobCard.jsx
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRankedJobs } from "../Service/jobservice";
import { motion, AnimatePresence } from "framer-motion";
import TopJobRoles from "./Jobs/JobCardComponets/topRoles";
import LatestOpenings from "./Jobs/JobCardComponets/latestOpenings";
import FeaturedCompanies from "./Jobs/JobCardComponets/featureCompanies";

export default function JobCard() {
  // ✅ Fetch jobs using React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["rankedJobs"],
    queryFn: fetchRankedJobs,
    staleTime: 1000 * 60 * 5, // cache for 5 minutes
  });

  // ✅ Extract actual jobs (if backend sends { success, jobs })
  const rankedJobs = Array.isArray(data)
    ? data
    : Array.isArray(data?.jobs)
    ? data.jobs
    : [];

  // ✅ Split data logically for display
  const topRoles = rankedJobs.slice(0, 5);
  const latestOpenings = [...rankedJobs]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const featuredCompanies = [
    ...new Set(rankedJobs.map((job) => job.companyName).filter(Boolean)),
  ].slice(0, 5);

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 shadow-sm"
          >
            Loading top jobs...
          </motion.div>
        ) : isError ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center text-red-500 shadow-sm"
          >
            Failed to load jobs. Please try again later.
          </motion.div>
        ) : !rankedJobs.length ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500 shadow-sm"
          >
            No active jobs found.
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-white rounded-xl border border-gray-200 p-5 shadow-md space-y-8 md:space-y-10"
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
