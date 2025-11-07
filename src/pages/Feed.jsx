/* ✅ src/pages/Feed.jsx */
import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

import Stories from "../components/Stories";
import Createpost from "../components/Createpost";
import Postcard from "../components/FeedPageComponent/Postcard";
import JobCard from "../components/Jobs/jobCard"; 

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

const Feed = ({ authUser }) => {
  const { token } = useContext(AuthContext);
  const [feeds, setFeeds] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [mixed, setMixed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const JOB_RATIO = 3; // 3 feeds → 1 job

  // 🔹 Remove hidden post
  const handleRemovepost = (feedId) => {
    setFeeds((prev) => prev.filter((f) => f.feedId !== feedId));
  };

  // 🔹 Shuffle feeds randomly
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // ✅ Fetch Feeds
  const fetchFeeds = useCallback(
    async (pageNum = 1, isLoadMore = false) => {
      if (isLoadMore) setIsLoadingMore(true);
      else setLoading(true);
      setError(null);

      try {
        const { data } = await api.get(
          `/api/get/all/feeds/user?page=${pageNum}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const formatted = data.feeds.map((feed) => ({
          feedId: feed.feedId,
          type: feed.type || "image",
          contentUrl: feed.contentUrl || "",
          caption: feed.caption || "",
          description: feed.dec || "",
          _id: feed._id || "guest",
          userName: feed.userName || "Unknown",
          profileAvatar: feed.profileAvatar || "",
          timeAgo: feed.timeAgo || "",
          likesCount: feed.likesCount || 0,
          commentsCount: feed.commentsCount || 0,
        }));

        const processed = isLoadMore ? formatted : shuffleArray(formatted);
        setFeeds((prev) => (isLoadMore ? [...prev, ...processed] : processed));
        setHasMore(formatted.length === 10);
        setPage(pageNum);
      } catch (err) {
        console.error("❌ Feed fetch error:", err);
        setError("Failed to fetch feeds");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );

  // ✅ Fetch Ranked Jobs (with user profile info)
  const fetchJobs = useCallback(async () => {
    try {
      const { data } = await api.get("/job/top/ranked/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data && Array.isArray(data.jobs)) {
        setJobs(data.jobs);
      } else {
        console.warn("⚠️ No jobs found or invalid response format.");
        setJobs([]);
      }
    } catch (err) {
      console.error("❌ Error fetching jobs:", err);
      setJobs([]);
    }
  }, [token]);

  // ✅ Mix Feeds & Jobs
  const mixFeedsAndJobs = useCallback(
    (feedArr = [], jobArr = [], ratio = JOB_RATIO) => {
      const out = [];
      let f = 0;
      let j = 0;

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

  // ✅ Initial Load
  useEffect(() => {
    if (token) {
      fetchJobs();
      fetchFeeds(1, false);
    }
  }, [token, fetchFeeds, fetchJobs]);

  // ✅ Mix data when feeds or jobs update
  useEffect(() => {
    if (feeds.length || jobs.length) {
      const mixedData = mixFeedsAndJobs(feeds, jobs);
      setMixed(mixedData);
    }
  }, [feeds, jobs, mixFeedsAndJobs]);

  // ✅ Infinite Scroll
  const handleScroll = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    const { scrollTop, scrollHeight, clientHeight } =
      document.documentElement || document.body;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      fetchFeeds(page + 1, true);
    }
  }, [page, hasMore, isLoadingMore, fetchFeeds]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // ✅ Dummy Stories
  const dummyStories = Array(7)
    .fill()
    .map((_, i) => ({
      userName: `User ${i + 1}`,
      profileAvatar: null,
      hasStory: true,
      feedId: i,
    }));

  // ✅ Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // ✅ Render Feed
  return (
    <div className="mx-auto px-3 sm:px-4 md:px-6 py-5 max-w-3xl">
      {/* ---------- Stories ---------- */}
      <div className="w-full">
        <Stories feeds={dummyStories} />
      </div>

      {/* ---------- Create Post ---------- */}
      <div className="mt-4 mb-6">
        <Createpost authUser={authUser} token={token} />
      </div>

      {/* ---------- Mixed Feed ---------- */}
      {error && <p className="text-center py-6 text-red-500">{error}</p>}

      <AnimatePresence>
        <div className="flex flex-col gap-5">
          {mixed.length > 0 ? (
            mixed.map((item, idx) => (
              <motion.div
                key={item._id || idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                }}
              >
                {item.__kind === "job" ? (
                  <JobCard jobData={mapJobForCard(item)} />
                ) : (
                  <Postcard
                    postData={item}
                    authUser={authUser}
                    token={token}
                    onHidePost={handleRemovepost}
                    onNotInterested={handleRemovepost}
                  />
                )}
              </motion.div>
            ))
          ) : (
            <motion.p
              className="text-center text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              No content available.
            </motion.p>
          )}
        </div>
      </AnimatePresence>

      {/* ---------- Load More Spinner ---------- */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* ---------- End of Feed ---------- */}
      {!hasMore && feeds.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          You’ve reached the end of the feed 🎉
        </div>
      )}
    </div>
  );
};

export default Feed;
