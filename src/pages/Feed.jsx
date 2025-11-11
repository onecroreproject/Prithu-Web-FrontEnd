// ✅ src/pages/Feed.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getAllFeeds, getTopRankedJobs } from "../Service/feedService";

import Stories from "../components/Stories";
import Createpost from "../components/Createpost";
import Postcard from "../components/FeedPageComponent/Postcard";
import JobCard from "../components/Jobs/jobCard";
import { Skeleton } from "@mui/material";

// 🕒 Helper for "time ago"
const timeAgoFrom = (iso) => {
  if (!iso) return "Recently posted";
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / (1000 * 60));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

// 🧩 Normalize job data for JobCard
const mapJobForCard = (job) => ({
  _id: job._id,
  title: job.title || "Untitled Job",
  companyName: job.companyName || "Unknown Company",
  location: job.location || "Remote",
  salaryRange: job.salaryRange || "—",
  experience:
    typeof job.experience === "number"
      ? `${job.experience}+ yrs`
      : job.experience || "—",
  jobType: job.jobType || "Full-time",
  description: job.description || "",
  image: job.image || "",
  userName: job.userName || "Unknown User",
  profileAvatar:
    job.profileAvatar ||
    "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  createdAt: job.createdAt,
  postedAt: timeAgoFrom(job.createdAt),
  score: job.score || 0,
  isPaid: job.isPaid || false,
});

// 🦴 Skeleton Loader
const FeedSkeleton = () => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="w-full bg-white rounded-2xl shadow-sm p-4"
  >
    <div className="flex items-center gap-3 mb-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1">
        <Skeleton variant="text" width="40%" height={14} />
        <Skeleton variant="text" width="25%" height={12} />
      </div>
    </div>
    <Skeleton variant="rectangular" height={350} className="rounded-lg" />
    <div className="mt-3 space-y-2">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </div>
  </motion.div>
);

const Feed = ({ authUser }) => {
  const { token } = useContext(AuthContext);
  const [showReels, setShowReels] = useState(false);
  const JOB_RATIO = 3;

  // ✅ Track selected role (for filtering)
  const [selectedRole, setSelectedRole] = useState(null);

  // ✅ Listen to TopJobRoles click
  useEffect(() => {
    const handleRoleClick = (e) => {
      const clickedRole = e.detail?.role;
      setSelectedRole((prev) => (prev === clickedRole ? null : clickedRole));
    };
    window.addEventListener("filterByRole", handleRoleClick);
    return () => window.removeEventListener("filterByRole", handleRoleClick);
  }, []);

  // ✅ Fetch jobs
  const {
    data: jobs = [],
    isLoading: isJobsLoading,
    isError: jobsError,
  } = useQuery({
    queryKey: ["jobs", token],
    queryFn: () => getTopRankedJobs(token),
    enabled: !!token,
  });
console.log(jobs)
  // ✅ Filter jobs if a role is selected
  const filteredJobs =
    selectedRole && jobs.length > 0
      ? jobs.filter((job) =>
          job.title?.toLowerCase().includes(selectedRole.toLowerCase())
        )
      : jobs;

  // ✅ Fetch feeds (infinite)
  const {
    data: feedPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFeedsLoading,
    isError: feedsError,
  } = useInfiniteQuery({
    queryKey: ["feeds", token],
    queryFn: ({ pageParam = 1 }) => getAllFeeds(pageParam, token),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < 10 ? undefined : pages.length + 1,
    enabled: !!token,
    refetchOnWindowFocus: false,
  });

  const feeds = feedPages?.pages.flat() || [];

  // ✅ Combine feeds and jobs
  const mixFeedsAndJobs = useCallback(
    (feedArr = [], jobArr = [], ratio = JOB_RATIO) => {
      const out = [];
      let f = 0,
        j = 0;
      while (f < feedArr.length) {
        const feedChunk = feedArr
          .slice(f, f + ratio)
          .map((f) => ({ ...f, __kind: "feed" }));
        out.push(...feedChunk);
        f += ratio;
        if (j < jobArr.length) {
          out.push({ ...jobArr[j], __kind: "job" });
          j++;
        }
      }
      return out;
    },
    [JOB_RATIO]
  );

  // ✅ Filter reels
  const filteredFeeds = showReels
    ? feeds.filter((f) => f.type === "video")
    : feeds;

  // ✅ Merge with filtered jobs
  const mixed = mixFeedsAndJobs(filteredFeeds, showReels ? [] : filteredJobs);

  // ✅ Toggle Reels Mode
  useEffect(() => {
    const handleToggle = (e) => setShowReels(e.detail?.isActive || false);
    window.addEventListener("toggleReels", handleToggle);
    return () => window.removeEventListener("toggleReels", handleToggle);
  }, []);

  // ✅ Infinite Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement || document.body;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        fetchNextPage();
      }
    };

    const throttledScroll = throttle(handleScroll, 400);
    window.addEventListener("scroll", throttledScroll);
    return () => window.removeEventListener("scroll", throttledScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isLoading = isFeedsLoading || isJobsLoading;

  // ✅ Utility to prevent scroll spam
  function throttle(fn, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = new Date().getTime();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  return (
    <div
      className={`mx-auto px-3 sm:px-4 md:px-6 py-5 max-w-3xl transition-all duration-300 ${
        showReels ? "bg-gray-50" : "bg-white"
      }`}
    >
      {/* ✅ Always show Stories and Createpost */}
      <div className="w-full">
        <Stories />
      </div>

      <div className="mt-4 mb-6">
        <Createpost authUser={authUser} token={token} />
      </div>

      {/* ✅ Feed Content */}
      <AnimatePresence>
        <div className="flex flex-col gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <FeedSkeleton key={i} />)
          ) : mixed.length > 0 ? (
            mixed.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
              >
                {item.__kind === "job" ? (
                  <JobCard key={idx} jobData={mapJobForCard(item)} />
                ) : (
                  <Postcard
                    key={idx}
                    postData={item}
                    authUser={authUser}
                    token={token}
                    onHidePost={() => {}}
                  />
                )}
              </motion.div>
            ))
          ) : (
            <motion.p
              className="text-center text-gray-500 py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {feedsError || jobsError
                ? "⚠️ Failed to load content."
                : selectedRole
                ? `No jobs found for "${selectedRole}".`
                : showReels
                ? "No reels found 🎬"
                : "No content available."}
            </motion.p>
          )}
        </div>
      </AnimatePresence>

      {/* ✅ Infinite scroll spinner */}
      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}
    </div>
  );
};

export default Feed;
