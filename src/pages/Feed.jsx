// ✅ src/pages/Feed.jsx
import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { getAllFeeds, getTopRankedJobs } from "../Service/feedService";
import { useLocation } from "react-router-dom";

import Stories from "../components/Stories";
import Createpost from "../components/postCreatedCard";
import Postcard from "../components/FeedPageComponent/Postcard";
import JobCard from "../components/Jobs/jobCard";
import { Skeleton } from "@mui/material";

/* ---------------------------------- Utils --------------------------------- */

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
  createdAt: job.createdAt,
  postedAt: timeAgoFrom(job.createdAt),
  score: job.priorityScore + (job.isPaid ? 5 : 0) + (job.isApproved ? 2 : 0),
});

/* ------------------- Skeleton ------------------- */
const FeedSkeleton = () => (
  <motion.div className="w-full bg-white rounded-2xl shadow-sm p-4">
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
  const queryClient = useQueryClient();

  const [showReels, setShowReels] = useState(false);
  const [feedCategory, setFeedCategory] = useState(null); // ID only
  const [selectedRole, setSelectedRole] = useState(null);
  const JOB_RATIO = 3;

  const location = useLocation();
  const [highlightedFeedId, setHighlightedFeedId] = useState(null);

  // Helper: move feed to top of cache and mark as highlighted
  const moveFeedToTop = useCallback((feedId) => {
    if (!feedId) return;

    queryClient.setQueryData(["feeds", token], (oldData) => {
      if (!oldData || !oldData.pages) return oldData;

      // Flatten all pages to find the feed
      const allItems = oldData.pages.flat();
      const foundIndex = allItems.findIndex(
        (it) => it.feedId === feedId || it._id === feedId
      );

      if (foundIndex !== -1) {
        // Remove the feed from its current position
        const [foundFeed] = allItems.splice(foundIndex, 1);

        // Mark it as highlighted
        const highlightedFeed = { ...foundFeed, __highlight: true };

        // Add to the beginning of the first page
        const firstPage = oldData.pages[0] || [];
        const newFirstPage = [
          highlightedFeed,
          ...firstPage.filter(it => it.feedId !== feedId && it._id !== feedId)
        ];

        // Rebuild pages
        const newPages = [
          newFirstPage,
          ...oldData.pages.slice(1).map(page =>
            page.filter(it => it.feedId !== feedId && it._id !== feedId)
          )
        ];

        return { ...oldData, pages: newPages };
      }

      return oldData;
    });
  }, [queryClient, token]);



  useEffect(() => {
    const shouldScroll = localStorage.getItem("scrollToFeed");

    if (shouldScroll === "true") {
      setTimeout(() => {
        const feed = document.getElementById("feedTop");
        feed?.scrollIntoView({ behavior: "smooth" });
      }, 300);

      localStorage.removeItem("scrollToFeed");
    }
  }, []);


  /* ---------------------- LISTEN FOR CATEGORY FILTER ------------------------ */
  useEffect(() => {
    const handler = (e) => {
      const categoryId = e.detail?.categoryId;
      setFeedCategory(categoryId || null);
    };
    window.addEventListener("filterFeedByCategory", handler);
    return () => window.removeEventListener("filterFeedByCategory", handler);
  }, []);

  /* 🚀 RESET FEEDS WHEN CATEGORY CHANGES */
  useEffect(() => {
    if (feedCategory !== null) {
      queryClient.removeQueries(["feeds", token]); // resets infinite scroll
    }
  }, [feedCategory]);

  /* ---------------------- LISTEN FOR HIGHLIGHT FEED EVENT ------------------- */
  useEffect(() => {
    const handleHighlightFeed = (e) => {
      const feedId = e?.detail?.feedId;
      if (!feedId) return;

      setHighlightedFeedId(feedId);
      moveFeedToTop(feedId);

      // Scroll to top after a short delay
      setTimeout(() => {
        const feedTop = document.getElementById("feedTop");
        feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);

      // Remove highlight after 5 seconds
      setTimeout(() => {
        setHighlightedFeedId(null);
        queryClient.setQueryData(["feeds", token], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page =>
              page.map(item =>
                (item.feedId === feedId || item._id === feedId)
                  ? { ...item, __highlight: false }
                  : item
              )
            )
          };
        });
      }, 5000);
    };

    window.addEventListener("highlightFeed", handleHighlightFeed);
    return () => window.removeEventListener("highlightFeed", handleHighlightFeed);
  }, [token, queryClient, moveFeedToTop]);

  /* ---------------------- CHECK LOCATION STATE ON MOUNT ---------------------- */
  useEffect(() => {
    if (location.state?.highlightFeed) {
      const feedId = location.state.highlightFeed;
      setHighlightedFeedId(feedId);
      moveFeedToTop(feedId);

      setTimeout(() => {
        const feedTop = document.getElementById("feedTop");
        feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);

      // Clear the location state
      window.history.replaceState({}, document.title);

      // Remove highlight after 5 seconds
      setTimeout(() => {
        setHighlightedFeedId(null);
        queryClient.setQueryData(["feeds", token], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page =>
              page.map(item =>
                (item.feedId === feedId || item._id === feedId)
                  ? { ...item, __highlight: false }
                  : item
              )
            )
          };
        });
      }, 5000);
    }
  }, [location, queryClient, token, moveFeedToTop]);

  /* --------------------------- FETCH JOBS ---------------------------------- */

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
    selectedRole
      ? jobs.filter((job) =>
        job.title?.toLowerCase().includes(selectedRole.toLowerCase())
      )
      : jobs;

  /* -------------------------- FETCH FEEDS ---------------------------------- */

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

  /* ---------------------- CATEGORY FEED FILTERING -------------------------- */
  const categoryFilteredFeeds = feedCategory
    ? feeds.filter((f) => f?.category === feedCategory)
    : feeds;

  const filteredFeeds = showReels
    ? categoryFilteredFeeds.filter((f) => f.type === "video")
    : categoryFilteredFeeds;

  /* ---------------------- MIX FEEDS & JOBS ------------------------- */
  const mixFeedsAndJobs = useCallback(
    (feedArr = [], jobArr = [], ratio = JOB_RATIO) => {
      const out = [];
      let f = 0,
        j = 0;

      while (f < feedArr.length) {
        out.push(
          ...feedArr.slice(f, f + ratio).map((f) => ({ ...f, __kind: "feed" }))
        );
        f += ratio;

        if (j < jobArr.length) {
          out.push({ ...jobArr[j], __kind: "job" });
          j++;
        }
      }
      return out;
    },
    []
  );

  const mixed = mixFeedsAndJobs(
    filteredFeeds,
    showReels ? [] : filteredJobs
  );


  const handleHideFromUI = (feedId) => {
    queryClient.setQueryData(["feeds", token], (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.filter((item) => item.feedId !== feedId)
        ),
      };
    });
  };

  /* ----------------------------- FOLLOW STATUS SYNC ------------------------- */
  useEffect(() => {
    const handleFollowStatusChange = (e) => {
      const { userId, isFollowing } = e.detail;

      // Update all feed posts from this user
      queryClient.setQueryData(["feeds", token], (oldData) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((item) =>
              item.userId === userId
                ? { ...item, isFollowing }
                : item
            )
          ),
        };
      });
    };

    window.addEventListener("userFollowStatusChanged", handleFollowStatusChange);
    return () => window.removeEventListener("userFollowStatusChanged", handleFollowStatusChange);
  }, [queryClient, token]);

  /* ----------------------------- REELS TOGGLE ------------------------------ */
  useEffect(() => {
    const handleToggle = (e) => setShowReels(e.detail.isActive);
    window.addEventListener("toggleReels", handleToggle);
    return () => window.removeEventListener("toggleReels", handleToggle);
  }, []);

  /* --------------------------- INFINITE SCROLL ----------------------------- */
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
  }, [hasNextPage, isFetchingNextPage]);

  function throttle(fn, delay) {
    let lastCall = 0;
    return (...args) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        fn(...args);
      }
    };
  }

  const isLoading = isFeedsLoading || isJobsLoading;

  /* ------------------------------- UI ------------------------------------- */

  return (
    <> <div id="feedTop">
      <div
        className={`mx-auto px-3 sm:px-4 md:px-6 py-5 max-w-3xl transition-all duration-300 ${showReels ? "bg-gray-50" : "bg-white"
          }`}
      >
        <Stories />

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
                      onHideFromUI={handleHideFromUI}
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
                  : feedCategory
                    ? "No feeds found for this category."
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
    </div></>);
};

export default Feed;
