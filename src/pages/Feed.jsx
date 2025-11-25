// ✅ src/pages/Feed.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllFeeds,
  getTopRankedJobs,
  getSingleFeed,
  getFeedsByCreator,
  getFeedsByHashtag,
} from "../Service/feedService";
import PostcardWrapper from "../components/FeedPageComponent/postCardWraper";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Stories from "../components/Stories";
import Createpost from "../components/postCreatedCard";
import Postcard from "../components/FeedPageComponent/Postcard";
import JobCard from "../components/Jobs/jobCard";
import { Skeleton } from "@mui/material";

/* ------------------------------- Helpers ---------------------------------- */

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

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
  image: job.image || "https://cdn-icons-png.flaticon.com/512/1187/1187541.png",
  postedBy: {
    _id: job.postedBy?._id || null,
    userName: job.postedBy?.userName || "Unknown User",
    email: job.postedBy?.email || "Not available",
    profileAvatar: job.postedBy?.profileAvatar || defaultAvatar,
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

/* ------------------------------- Skeleton ------------------------------- */

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

/* -------------------------------- Feed Component ------------------------------- */

const Feed = ({ authUser, notifyfeedid ,searchFeedId}) => {
  const { tagname } = useParams();
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const queryClient = useQueryClient();

  // If route is /retrivefeed/:id, this grabs the id from pathname.
  // This works with your app routing where the feed page is visible in the same Layout.
  const currentFeedId = (location.pathname.includes("/retrivefeed/") && location.pathname.split("/retrivefeed/")[1]) || null;

  const [showReels, setShowReels] = useState(false);
  const [feedCategory, setFeedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [highlightedFeedId, setHighlightedFeedId] = useState(null);
  const [hasScrolledToNotifyFeed, setHasScrolledToNotifyFeed] = useState(false);
  const navigate = useNavigate();
  // Creator-mode state (when currentFeedId exists)
  const [creatorModeFeeds, setCreatorModeFeeds] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [isCreatorModeLoading, setIsCreatorModeLoading] = useState(false);

  const JOB_RATIO = 3;



  // stable refs for token & other volatile things
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  /* ---------------------- Infinite feeds query (existing behavior) ---------------------- */
const {
  data: feedPages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  isLoading: isFeedsLoading,
  isError: feedsError,
} = useInfiniteQuery({
queryKey: ["feeds", token, tagname || "all"],
queryFn: ({ pageParam = 1 }) =>
  tagname
    ? getFeedsByHashtag(tagname, pageParam, token)
    : getAllFeeds(pageParam, token),
getNextPageParam: (lastPage, pages) =>
    lastPage.length < 10 ? undefined : pages.length + 1,
enabled: !!token,
refetchOnWindowFocus: false,
});



  const feeds = feedPages?.pages.flat() || [];

  /* ---------------------- Jobs query (existing) ---------------------- */
  const { data: jobs = [], isLoading: isJobsLoading, isError: jobsError } = useQuery({
    queryKey: ["jobs", token],
    queryFn: () => getTopRankedJobs(token),
    enabled: !!token,
  });

  /* ---------------------- normalize single feed (fallback) ---------------------- */
  const normalizeSingleFeed = useCallback((raw) => {
    if (!raw) return null;
    return {
      feedId: raw.feedId || raw._id || raw.id || raw.feedID,
      _id: raw._id || raw.feedId || raw.id || raw.feedID,
      userId: raw.createdByAccount || raw.userId || null,
      type: raw.type || "image",
      contentUrl: raw.contentUrl || raw.contentUrl || "",
      caption: raw.caption || raw.dec || raw.dec || "",
      description: raw.dec || raw.description || "",
      category: raw.category || "",
      language: raw.language || "en",
      avatarToUse: raw.avatarToUse || raw.profileAvatar || defaultAvatar,
      userName: raw.userName || raw.userName || "Unknown",
      profileAvatar: raw.profileAvatar || defaultAvatar,
      timeAgo: raw.timeAgo || timeAgoFrom(raw.createdAt),
      likesCount: raw.likesCount ?? 0,
      commentsCount: raw.commentsCount ?? 0,
      viewsCount: raw.viewsCount ?? 0,
      shareCount: raw.shareCount ?? 0,
      downloadsCount: raw.downloadsCount ?? 0,
      dislikesCount: raw.dislikesCount ?? 0,
      isLiked: raw.isLiked || false,
      isSaved: raw.isSaved || false,
      isFollowing: raw.isFollowing || false,
      isDisliked: raw.isDisliked || false,
      themeColor: raw.themeColor || {
        primary: "#262e39",
        secondary: "#6e7782",
        accent: "#a7373a",
        gradient: "linear-gradient(135deg, #262e39, #6e7782, #a7373a)",
        text: "#FFFFFF",
      },
      createdAt: raw.createdAt,
    };
  }, []);

  /* ---------------------- Helper: inject single feed into cache (safe) ---------------------- */
  const injectSingleFeedIntoCache = useCallback((singleFeed) => {
    if (!singleFeed) return;
    queryClient.setQueryData(["feeds", tokenRef.current], (oldData) => {
      if (!oldData || !oldData.pages) {
        return { pages: [[singleFeed]], pageParams: [1] };
      }
      const seenId = singleFeed._id || singleFeed.feedId || singleFeed.id || singleFeed.feedID;
      // remove duplicates anywhere
      const cleanedPages = oldData.pages.map((p) => p.filter((it) => (it._id || it.feedId || it.id || it.feedID) !== seenId));
      const newFirstPage = [{ ...singleFeed, __highlight: true }, ...(cleanedPages[0] || [])];
      return { ...oldData, pages: [newFirstPage, ...cleanedPages.slice(1)], pageParams: oldData.pageParams ?? [1] };
    });
  }, [queryClient]);

  /* ---------------------- Helper: move feed in cache to top ---------------------- */
  const moveFeedToTop = useCallback((feedId) => {
    if (!feedId) return;
    queryClient.setQueryData(["feeds", tokenRef.current], (oldData) => {
      if (!oldData || !oldData.pages) return oldData;
      const flat = oldData.pages.flat();
      const idx = flat.findIndex((it) => (it._id || it.feedId || it.id || it.feedID) === feedId);
      if (idx === -1) return oldData;
      const [found] = flat.splice(idx, 1);
      const highlighted = { ...found, __highlight: true };
      const newFirstPage = [highlighted, ...flat];
      return { ...oldData, pages: [newFirstPage, ...oldData.pages.slice(1)], pageParams: oldData.pageParams ?? [1] };
    });
  }, [queryClient]);

  /* ---------------------- highlight helper ---------------------- */
  const highlightAndUnhighlight = useCallback((feedId) => {
    if (!feedId) return;
    setHighlightedFeedId(feedId);
    moveFeedToTop(feedId);
    // remove highlight later
    setTimeout(() => {
      setHighlightedFeedId(null);
      queryClient.setQueryData(["feeds", tokenRef.current], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => page.map((item) => {
            if ((item._id || item.feedId || item.id || item.feedID) === feedId) {
              return { ...item, __highlight: false };
            }
            return item;
          })),
          pageParams: oldData.pageParams ?? [1],
        };
      });
    }, 4000);
  }, [moveFeedToTop, queryClient]);

  /* ---------------------- Creator mode: fetch creator feeds when currentFeedId exists ---------------------- */
  useEffect(() => {
    // If there's no feed id in pathname, reset creator mode
    if (!currentFeedId) {
      setCreatorModeFeeds(null);
      setCreatorId(null);
      setIsCreatorModeLoading(false);
      return;
    }

    // Avoid repeated fetches for same id
    let cancelled = false;
    const run = async () => {
      setIsCreatorModeLoading(true);
      try {
        // getFeedsByCreator is expected to return enriched feeds (you said it's enriched)
        const res = await getFeedsByCreator(currentFeedId, tokenRef.current);
        // normalize defensive path: if res.feeds exist use them; otherwise accept res as array
        const creatorFeedsRaw = res?.feeds ?? (Array.isArray(res) ? res : []);
        const cId = res?.creatorId ?? (creatorFeedsRaw[0]?.createdByAccount || creatorFeedsRaw[0]?.userId || null);

        if (cancelled) return;

        // We expect enriched objects matching main feed shape; still normalize minimally to ensure _id present
        const normalized = creatorFeedsRaw.map((f) => ({
          ...f,
          _id: f._id || f.feedId || f.id,
          feedId: f.feedId || f._id || f.id,
          avatarToUse: f.avatarToUse || f.profileAvatar || defaultAvatar,
          timeAgo: f.timeAgo || timeAgoFrom(f.createdAt),
        }));

        // Place the clicked feed id on top (if present in array)
        const clickedIndex = normalized.findIndex((it) => (it._id || it.feedId) === currentFeedId);
        if (clickedIndex > -1) {
          const [clicked] = normalized.splice(clickedIndex, 1);
          // mark highlight
          const highlighted = { ...clicked, __highlight: true };
          normalized.unshift(highlighted);
          // auto-scroll to top once
          setTimeout(() => {
            const feedTop = document.getElementById("feedTop");
            feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 250);
          // clear highlight after a few seconds
          setTimeout(() => {
            setCreatorModeFeeds((prev) => prev?.map((item) => {
              if ((item._id || item.feedId) === currentFeedId) return { ...item, __highlight: false };
              return item;
            }));
          }, 3500);
        }

        setCreatorModeFeeds(normalized);
        setCreatorId(cId || null);
      } catch (err) {
        console.error("Error fetching creator feeds:", err);
        // fallback: set creatorModeFeeds to null so regular feed shows
        setCreatorModeFeeds(null);
        setCreatorId(null);
      } finally {
        if (!cancelled) setIsCreatorModeLoading(false);
      }
    };

    run();

    return () => { cancelled = true; };
  }, [currentFeedId]);

  /* ---------------------- notifyfeedid handling: keep your previous behavior (no break) ---------------------- */
  // This effect makes sure when notifyfeedid is present (notifications), the feed moves to top or is fetched
  useEffect(() => {
    if (!notifyfeedid) return;
    if (!token) return;
    if (hasScrolledToNotifyFeed) return;

    let cancelled = false;
    const run = async () => {
      // Try cache first
      const cache = queryClient.getQueryData(["feeds", tokenRef.current]);
      const flat = cache?.pages?.flat?.() || [];
      const found = flat.find((it) => (it._id || it.feedId || it.id || it.feedID) === notifyfeedid);

      if (found) {
        moveFeedToTop(notifyfeedid);
        setHighlightedFeedId(notifyfeedid);
        setTimeout(() => {
          if (cancelled) return;
          const feedTop = document.getElementById("feedTop");
          feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          setHasScrolledToNotifyFeed(true);
        }, 300);

        setTimeout(() => {
          if (cancelled) return;
          setHighlightedFeedId(null);
          queryClient.setQueryData(["feeds", tokenRef.current], (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) =>
                  (item._id || item.feedId || item.id || item.feedID) === notifyfeedid
                    ? { ...item, __highlight: false }
                    : item
                )
              ),
              pageParams: oldData.pageParams ?? [1],
            };
          });
        }, 4000);

        return;
      }

      // If not found in cache but feeds not loaded yet - wait for feeds to load (effect will re-run)
      const feedsLoaded = !!feedPages && Array.isArray(feedPages.pages) && feedPages.pages.length > 0;
      if (!feedsLoaded) return;

      // Otherwise fetch single feed and inject
      try {
        const raw = await getSingleFeed(notifyfeedid, tokenRef.current);
        if (!raw) {
          setHasScrolledToNotifyFeed(true);
          return;
        }
        const normalized = normalizeSingleFeed(raw);
        injectSingleFeedIntoCache(normalized);

        setTimeout(() => {
          if (cancelled) return;
          const feedTop = document.getElementById("feedTop");
          feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          setHasScrolledToNotifyFeed(true);
        }, 300);

        setTimeout(() => {
          if (cancelled) return;
          setHighlightedFeedId(null);
          queryClient.setQueryData(["feeds", tokenRef.current], (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) =>
                  (item._id || item.feedId || item.id || item.feedID) === notifyfeedid
                    ? { ...item, __highlight: false }
                    : item
                )
              ),
              pageParams: oldData.pageParams ?? [1],
            };
          });
        }, 4000);
      } catch (err) {
        console.error("Error fetching single feed:", err);
        setHasScrolledToNotifyFeed(true);
      }
    };

    run();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyfeedid, feedPages, hasScrolledToNotifyFeed, token]);

  /* ---------------------- legacy auto scroll flag ---------------------- */
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

  /* ---------------------- listeners / filters / follow sync ---------------------- */
  useEffect(() => {
    const handler = (e) => {
      const categoryId = e.detail?.categoryId;
      setFeedCategory(categoryId || null);
    };
    window.addEventListener("filterFeedByCategory", handler);
    return () => window.removeEventListener("filterFeedByCategory", handler);
  }, []);

  useEffect(() => {
    if (feedCategory !== null) {
      queryClient.removeQueries(["feeds", token]);
    }
  }, [feedCategory, queryClient, token]);

  useEffect(() => {
    const handleHighlightFeed = (e) => {
      const feedId = e?.detail?.feedId;
      if (!feedId) return;
      highlightAndUnhighlight(feedId);
    };
    window.addEventListener("highlightFeed", handleHighlightFeed);
    return () => window.removeEventListener("highlightFeed", handleHighlightFeed);
  }, [highlightAndUnhighlight]);

  useEffect(() => {
    if (location.state?.highlightFeed) {
      const feedId = location.state.highlightFeed;
      highlightAndUnhighlight(feedId);
      window.history.replaceState({}, document.title);
    }
  }, [location, highlightAndUnhighlight]);

  useEffect(() => {
    const handleToggle = (e) => setShowReels(e.detail.isActive);
    window.addEventListener("toggleReels", handleToggle);
    return () => window.removeEventListener("toggleReels", handleToggle);
  }, []);

  useEffect(() => {
    const handleFollowStatusChange = (e) => {
      const { userId, isFollowing } = e.detail;
      queryClient.setQueryData(["feeds", tokenRef.current], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.map((item) => (item.userId === userId ? { ...item, isFollowing } : item))
          ),
          pageParams: oldData.pageParams ?? [1],
        };
      });
    };
    window.addEventListener("userFollowStatusChanged", handleFollowStatusChange);
    return () => window.removeEventListener("userFollowStatusChanged", handleFollowStatusChange);
  }, [queryClient]);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement || document.body;
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        fetchNextPage();
      }
    };
    const throttled = throttle(handleScroll, 400);
    window.addEventListener("scroll", throttled);
    return () => window.removeEventListener("scroll", throttled);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

  /* ---------------------- mixing: preserve feed[0], then mix A1 ---------------------- */
  const filteredJobs = selectedRole ? jobs.filter((job) => job.title?.toLowerCase().includes(selectedRole.toLowerCase())) : jobs;
let filteredFeeds = feeds;

// If hashtag mode → bypass category & reel filters
if (!tagname) {
  const categoryFilteredFeeds = feedCategory
    ? feeds.filter((f) => f?.category === feedCategory)
    : feeds;

  filteredFeeds = showReels
    ? categoryFilteredFeeds.filter((f) => f.type === "video")
    : categoryFilteredFeeds;
}

  // mixing function preserves the very first feed in list (so highlighted stays top)
  const mixFeedsAndJobs = useCallback((feedArr = [], jobArr = [], ratio = JOB_RATIO) => {
    const out = [];

    // Preserve first feed always (if exists)
    if (feedArr.length > 0) {
      out.push({ ...feedArr[0], __kind: "feed" });
    }

    let f = 1;
    let j = 0;

    while (f < feedArr.length) {
      out.push(...feedArr.slice(f, f + ratio).map((ff) => ({ ...ff, __kind: "feed" })));
      f += ratio;

      if (j < jobArr.length) {
        out.push({ ...jobArr[j], __kind: "job" });
        j++;
      }
    }

    return out;
  }, []);

  // Decide what to render in "feeds" area:
  // - If creatorMode active (currentFeedId present AND creatorModeFeeds set) -> show creatorModeFeeds (no jobs)
  // - Else -> use normal infinite cached feeds mixed with jobs
 let mixed = [];
const isCreatorMode = !!currentFeedId && Array.isArray(creatorModeFeeds);

if (tagname) {
  // ⭐ HASHTAG MODE — ONLY FEEDS, NO JOBS
  mixed = filteredFeeds.map((f) => ({ ...f, __kind: "feed" }));
} else if (isCreatorMode) {
  mixed = (creatorModeFeeds || []).map((f) => ({ ...f, __kind: "feed" }));
} else {
  mixed = mixFeedsAndJobs(filteredFeeds, showReels ? [] : filteredJobs, JOB_RATIO);
}


  /* ---------------------- hide from UI ---------------------- */
  const handleHideFromUI = (feedId) => {
    // hide both in local creator list (if present) and cache
    if (isCreatorMode) {
      setCreatorModeFeeds((prev) => prev?.filter((it) => (it._id || it.feedId || it.id || it.feedID) !== feedId));
    }

    queryClient.setQueryData(["feeds", tokenRef.current], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => page.filter((item) => (item.feedId || item._id || item.id || item.feedID) !== feedId)),
        pageParams: oldData.pageParams ?? [1],
      };
    });
  };

  const isLoading = isFeedsLoading || isJobsLoading || isCreatorModeLoading;

  /* ------------------------------- Render --------------------------------- */
  return (
    <>
      <div id="feedTop">
        <div className={`mx-auto px-3 sm:px-4 md:px-6 py-5 max-w-3xl transition-all duration-300 ${showReels ? "bg-gray-50" : "bg-white"}`}>
          <Stories />

          <div className="mt-4 mb-6">
            <Createpost authUser={authUser} token={token} />
          </div>

          {isCreatorMode && (
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img src={creatorModeFeeds?.[0]?.profileAvatar || defaultAvatar} alt="creator avatar" className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{creatorModeFeeds?.[0]?.userName || "Creator"}</div>
                  <div className="text-xs text-gray-500">{creatorModeFeeds?.length ?? 0} posts</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">Creator feeds</div>
            </div>
          )}

          <AnimatePresence>
            <div className="flex flex-col gap-5">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <FeedSkeleton key={i} />)
              ) : mixed.length > 0 ? (
                mixed.map((item, idx) => (
                  <motion.div key={item._id || item.feedId || idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}>
                    {item.__kind === "job" ? (
                      <JobCard jobData={mapJobForCard(item)} />
                    ) : (
                      <PostcardWrapper 
  key={item._id || item.feedId || idx}
  postData={item}
  authUser={authUser}
  token={token}
  onHideFromUI={handleHideFromUI}
/>

                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {feedsError || jobsError ? "⚠️ Failed to load content." : feedCategory ? "No feeds found for this category." : showReels ? "No reels found 🎬" : "No content available."}
                </p>
              )}
            </div>
          </AnimatePresence>

          {isFetchingNextPage && !isCreatorMode && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Feed;
