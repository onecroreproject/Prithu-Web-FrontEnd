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

/* ---------------------------------- Utils --------------------------------- */

// ⏳ Time Ago
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

// 🧩 Normalize job data (NO EXPORT — FIXES HMR)
const mapJobForCard = (job) => ({
  _id: job._id,
  title: job.title || "Untitled Job",
  companyName: job.companyName || "Unknown Company",
  category: job.category || "General",
  location: job.location || "Remote",
  jobRole: job.jobRole || job.role || "—",
  jobType: job.jobType || "Full-time",
  language: job.language || "en",
  salary:
    typeof job.salary === "number" && job.salary > 0
      ? `₹${job.salary.toLocaleString()}`
      : job.salaryRange || "—",
  experience:
    typeof job.experience === "number" && job.experience >= 0
      ? `${job.experience}+ yrs`
      : job.experience || "—",
  image:
    job.image ||
    "https://cdn-icons-png.flaticon.com/512/1187/1187541.png",
  postedBy: {
    _id: job.postedBy?._id || null,
    userName: job.postedBy?.userName || "Unknown User",
    email: job.postedBy?.email || "Not available",
    profileAvatar:
      job.postedBy?.profileAvatar ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  },
  tags: Array.isArray(job.tags)
    ? job.tags.filter(Boolean)
    : typeof job.tags === "string"
    ? job.tags.split(",").map((t) => t.trim())
    : [],
  startDate: job.startDate ? new Date(job.startDate) : null,
  endDate: job.endDate ? new Date(job.endDate) : null,
  createdAt: job.createdAt,
  postedAt: timeAgoFrom(job.createdAt),
  status: job.status || "active",
  isApproved: !!job.isApproved,
  reasonForBlock: job.reasonForBlock || null,
  isPaid: !!job.isPaid,
  priorityScore: job.priorityScore || 0,
  stats: {
    views: job.stats?.views || 0,
    likes: job.stats?.likes || 0,
    shares: job.stats?.shares || 0,
    downloads: job.stats?.downloads || 0,
    appliedCount: job.stats?.appliedCount || 0,
    engagementScore: job.stats?.engagementScore || 0,
  },
  description:
    job.description?.slice(0, 250).trim() +
      (job.description?.length > 250 ? "..." : "") ||
    "No description provided.",
  score:
    job.priorityScore + (job.isPaid ? 5 : 0) + (job.isApproved ? 2 : 0),
});

// 🦴 Skeleton
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

/* ------------------------------- Feed Component ------------------------------ */

const Feed = ({ authUser }) => {
  const { token } = useContext(AuthContext);
  const [showReels, setShowReels] = useState(false);
  const JOB_RATIO = 3;

  const [selectedRole, setSelectedRole] = useState(null);

  useEffect(() => {
    const handleRoleClick = (e) => {
      const clickedRole = e.detail?.role;
      setSelectedRole((prev) => (prev === clickedRole ? null : clickedRole));
    };
    window.addEventListener("filterByRole", handleRoleClick);
    return () => window.removeEventListener("filterByRole", handleRoleClick);
  }, []);

  const {
    data: jobs = [],
    isLoading: isJobsLoading,
    isError: jobsError,
  } = useQuery({
    queryKey: ["jobs", token],
    queryFn: () => getTopRankedJobs(token),
    enabled: !!token,
  });

  const filteredJobs =
    selectedRole && jobs.length > 0
      ? jobs.filter((job) =>
          job.title?.toLowerCase().includes(selectedRole.toLowerCase())
        )
      : jobs;

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

  const filteredFeeds = showReels
    ? feeds.filter((f) => f.type === "video")
    : feeds;

  const mixed = mixFeedsAndJobs(
    filteredFeeds,
    showReels ? [] : filteredJobs
  );

  useEffect(() => {
    const handleToggle = (e) => setShowReels(e.detail?.isActive || false);
    window.addEventListener("toggleReels", handleToggle);
    return () => window.removeEventListener("toggleReels", handleToggle);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;
      const { scrollTop, scrollHeight, clientHeight } =
        document.documentElement || document.body;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        fetchNextPage();
      }
    };

    const throttled = throttle(handleScroll, 400);
    window.addEventListener("scroll", throttled);
    return () => window.removeEventListener("scroll", throttled);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isLoading = isFeedsLoading || isJobsLoading;

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
      <div className="w-full">
        <Stories />
      </div>

      <div className="mt-4 mb-6">
        <Createpost authUser={authUser} token={token} />
      </div>

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
                  <JobCard jobData={mapJobForCard(item)} />
                ) : (
                  <Postcard
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

      {isFetchingNextPage && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}
    </div>
  );
};

export default Feed;
