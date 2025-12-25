// ✅ src/pages/Feed.jsx
import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllFeeds,
  getTopRankedJobs,
  getSingleFeed,
  getFeedsByCreator,
  getFeedsByHashtag,
} from "../Service/feedService";
import PostcardWrapper from "../components/FeedPageComponent/postCardWraper";
import Stories from "../components/Stories";
import Createpost from "../components/postCreatedCard";
import JobCard from "../components/Jobs/jobCard";
import { Skeleton, IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TagIcon from "@mui/icons-material/Tag";

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

  /* --------------------------------------------------
   * BASIC JOB INFO
   * -------------------------------------------------- */
  title: job.jobTitle || "Untitled Job",
  jobRole: job.jobRole || "—",
  category: job.jobCategory || "General",
  subCategory: job.jobSubCategory || null,
  employmentType: job.employmentType || "full-time",
  workMode: job.workMode || "onsite",
  shiftType: job.shiftType || "day",
  city: job.city || "—",
  state: job.state || null,
  country: job.country || null,

  /* --------------------------------------------------
   * SALARY
   * -------------------------------------------------- */
  salaryType: job.salaryType || "monthly",
  salaryMin: job.salaryMin || 0,
  salaryMax: job.salaryMax || 0,
  salaryRange:
    job.salaryMin && job.salaryMax
      ? `₹${job.salaryMin.toLocaleString()} - ₹${job.salaryMax.toLocaleString()}`
      : "Based on Experience",

  /* --------------------------------------------------
   * EXPERIENCE
   * -------------------------------------------------- */
  experienceMin: job.minimumExperience || 0,
  experienceMax: job.maximumExperience || null,
  experience:
    typeof job.minimumExperience === "number"
      ? `${job.minimumExperience}+ yrs`
      : "—",

  /* --------------------------------------------------
   * COMPANY (BASIC FROM JOBPOST SNAPSHOT)
   * -------------------------------------------------- */
  companyName: job.postedBy?.companyName || "Unknown Company",
  companyLogo:
    job.companyLogo ||
    job.companyProfile?.logo ||
    "https://cdn-icons-png.flaticon.com/512/1187/1187541.png",

  /* --------------------------------------------------
   * POSTED BY (FROM COMPANY LOGIN)
   * -------------------------------------------------- */
  postedBy: {
    name: job.postedBy?.name || "Unknown",
    email: job.postedBy?.email || null,
    phone: job.postedBy?.phone || null,
    position: job.postedBy?.position || "HR",
  },

  postedUserName: job.postedBy?.name || "Unknown",

  /* --------------------------------------------------
   * COMPANY PROFILE
   * -------------------------------------------------- */
  companyProfile: {
    logo: job.companyProfile?.logo || null,
    about: job.companyProfile?.about || "",
    mission: job.companyProfile?.mission || "",
    vision: job.companyProfile?.vision || "",
    city: job.companyProfile?.city || "",
    state: job.companyProfile?.state || "",
    country: job.companyProfile?.country || "",
    yearEstablished: job.companyProfile?.yearEstablished || null,
    employeeCount: job.companyProfile?.employeeCount || null,
  },

  /* --------------------------------------------------
   * VISIBILITY SETTINGS
   * -------------------------------------------------- */
  visibilitySettings: job.visibilitySettings || {},

  /* --------------------------------------------------
   * TAGS
   * -------------------------------------------------- */
  tags: Array.isArray(job.tags) ? job.tags.filter(Boolean) : [],

  /* --------------------------------------------------
   * DATES
   * -------------------------------------------------- */
  createdAt: job.createdAt,
  postedAt: timeAgoFrom(job.createdAt),

  /* --------------------------------------------------
   * STATUS INFO
   * -------------------------------------------------- */
  status: job.status || "active",
  isApproved: job.isApproved || false,
  isPaid: job.paymentAmount > 0,
  isPromoted: job.isPromoted || false,
  isFeatured: job.isFeatured || false,

  /* --------------------------------------------------
   * RANKING SCORES
   * -------------------------------------------------- */
  priorityScore: job.priorityScore || 0,
  paymentAmount: job.paymentAmount || 0,
  boostLevel: job.boostLevel || 0,
  engagementScore: job.engagementScore || 0,

  /* --------------------------------------------------
   * DESCRIPTION
   * -------------------------------------------------- */
  description: job.jobDescription || "No description available",

  /* --------------------------------------------------
   * ENGAGEMENT COUNTS
   * -------------------------------------------------- */
  likeCount: job.likeCount || 0,
  shareCount: job.shareCount || 0,
  saveCount: job.saveCount || 0,
  applyCount: job.applyCount || 0,
  viewCount: job.viewCount || 0,

  /* --------------------------------------------------
   * USER’S PERSONAL ENGAGEMENT STATE
   * -------------------------------------------------- */
  isLiked: job.isLiked || false,
  isSaved: job.isSaved || false,
  isApplied: job.isApplied || false,
  isViewed: job.isViewed || false,

  /* --------------------------------------------------
   * FINAL COMBINED SCORE
   * -------------------------------------------------- */
  score:
    (job.priorityScore || 0) +
    (job.paymentAmount > 0 ? 5 : 0) +
    (job.isApproved ? 2 : 0) +
    (job.engagementScore || 0) +
    (job.boostLevel || 0),
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
const Feed = ({ authUser, notifyfeedid, searchFeedId }) => {
  const { tagname } = useParams();
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Check if we're in hashtag mode
  const isHashtagMode = !!tagname;

  // safe extraction (strip query string) for /retrivefeed/:id
  const currentFeedId = (() => {
    const m = location.pathname.match(/\/retrivefeed\/([^/]+)/);
    return m ? decodeURIComponent(m[1].split("?")[0]) : null;
  })();

  const [showReels, setShowReels] = useState(false);
  const [feedCategory, setFeedCategory] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [highlightedFeedId, setHighlightedFeedId] = useState(null);
  const [hasScrolledToNotifyFeed, setHasScrolledToNotifyFeed] = useState(false);

  // creator-mode state
  const [creatorModeFeeds, setCreatorModeFeeds] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [isCreatorModeLoading, setIsCreatorModeLoading] = useState(false);

  const JOB_RATIO = 3;

  // stable refs for token & other volatile things
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // unified query key (use this everywhere)
  const feedsQueryKey = ["feeds", tokenRef.current || token, tagname || "all"];

  /* ---------------------- Infinite feeds query ---------------------- */
  const {
    data: feedPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFeedsLoading,
    isError: feedsError,
  } = useInfiniteQuery({
    queryKey: feedsQueryKey,
    queryFn: ({ pageParam = 1 }) =>
      tagname
        ? getFeedsByHashtag(tagname, pageParam, tokenRef.current || token)
        : getAllFeeds(pageParam, tokenRef.current || token),
    getNextPageParam: (lastPage, pages) =>
      lastPage.length < 10 ? undefined : pages.length + 1,
    enabled: !!(tokenRef.current || token),
    refetchOnWindowFocus: false,
  });

  const feeds = feedPages?.pages.flat() || [];

  /* ---------------------- Jobs query (disabled for hashtag mode) ---------------------- */
  const { data: jobs = [], isLoading: isJobsLoading, isError: jobsError } = useQuery({
    queryKey: ["jobs", tokenRef.current || token],
    queryFn: () => getTopRankedJobs(tokenRef.current || token),
    enabled: !!(tokenRef.current || token) && !isHashtagMode, // Disable for hashtag mode
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
  const injectSingleFeedIntoCache = useCallback(
    (singleFeed) => {
      if (!singleFeed) return;
      queryClient.setQueryData(feedsQueryKey, (oldData) => {
        // If no cache, create a first page
        if (!oldData || !oldData.pages) {
          return { pages: [[{ ...singleFeed, __highlight: true }]], pageParams: [1] };
        }

        const seenId = singleFeed._id || singleFeed.feedId || singleFeed.id || singleFeed.feedID;

        // Remove the item from wherever it appears (preserve per-page order)
        const cleanedPages = oldData.pages.map((page) =>
          page.filter((it) => (it._id || it.feedId || it.id || it.feedID) !== seenId)
        );

        // Insert the single at the start of the first page (preserve order of others)
        const newFirstPage = [{ ...singleFeed, __highlight: true }, ...(cleanedPages[0] || [])];

        return { ...oldData, pages: [newFirstPage, ...cleanedPages.slice(1)], pageParams: oldData.pageParams ?? [1] };
      });
    },
    [queryClient, feedsQueryKey]
  );

  /* ---------------------- Helper: move feed in cache to top ---------------------- */
  const moveFeedToTop = useCallback(
    (feedId) => {
      if (!feedId) return;
      queryClient.setQueryData(feedsQueryKey, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;

        const idCheck = (it) => (it._id || it.feedId || it.id || it.feedID) === feedId;

        // Find and remove the item from its page
        let removedItem = null;
        const newPages = oldData.pages.map((page) => {
          if (removedItem) return page;
          const idx = page.findIndex(idCheck);
          if (idx === -1) return page;
          removedItem = page[idx];
          return [...page.slice(0, idx), ...page.slice(idx + 1)];
        });

        // No item found => nothing to do
        if (!removedItem) return oldData;

        // Put removed item at start of first page (highlighted)
        const highlighted = { ...removedItem, __highlight: true };
        const firstPage = newPages[0] ? [highlighted, ...newPages[0]] : [highlighted];

        return { ...oldData, pages: [firstPage, ...newPages.slice(1)], pageParams: oldData.pageParams ?? [1] };
      });
    },
    [queryClient, feedsQueryKey]
  );

  /* ---------------------- highlight helper ---------------------- */
  const highlightAndUnhighlight = useCallback(
    (feedId) => {
      if (!feedId) return;
      setHighlightedFeedId(feedId);
      moveFeedToTop(feedId);

      // remove highlight later
      setTimeout(() => {
        setHighlightedFeedId(null);
        queryClient.setQueryData(feedsQueryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((item) => {
                if ((item._id || item.feedId || item.id || item.feedID) === feedId) {
                  return { ...item, __highlight: false };
                }
                return item;
              })
            ),
            pageParams: oldData.pageParams ?? [1],
          };
        });
      }, 4000);
    },
    [moveFeedToTop, queryClient, feedsQueryKey]
  );

  /* ---------------------- Share injector: /retrivefeed/:id?ref=share ---------------------- */
  useEffect(() => {
    if (!currentFeedId) return;

    const params = new URLSearchParams(location.search);
    const isShare = params.get("ref") === "share";
    if (!isShare) return;

    let cancelled = false;
    (async () => {
      try {
        if (hasScrolledToNotifyFeed) return;

        // Try cache first
        const cache = queryClient.getQueryData(feedsQueryKey);
        const pages = cache?.pages ?? [];
        const flat = pages.flat();
        const matchIndex = flat.findIndex((it) => (it._id || it.feedId || it.id || it.feedID) === currentFeedId);

        // Build normalized single feed object (if found in cache reuse it)
        let single = null;
        if (matchIndex !== -1) {
          single = flat[matchIndex];
        } else {
          // fetch single feed from API (allow unauth requests if backend supports)
          const raw = await getSingleFeed(currentFeedId, tokenRef.current || token);
          if (!raw) {
            setHasScrolledToNotifyFeed(true);
            return;
          }
          single = normalizeSingleFeed(raw);
        }

        if (cancelled) return;

        // Inject single into cache, preserving original order
        injectSingleFeedIntoCache(single);

        // Highlight & scroll
        setHighlightedFeedId(currentFeedId);
        setTimeout(() => {
          const feedTop = document.getElementById("feedTop");
          feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          setHasScrolledToNotifyFeed(true);
        }, 250);

        // Clear highlight and __highlight flag after a short while
        setTimeout(() => {
          setHighlightedFeedId(null);
          queryClient.setQueryData(feedsQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) =>
                  (item._id || item.feedId || item.id || item.feedID) === currentFeedId
                    ? { ...item, __highlight: false }
                    : item
                )
              ),
              pageParams: oldData.pageParams ?? [1],
            };
          });
        }, 3500);
      } catch (err) {
        console.error("Error handling retrievefeed share:", err);
        setHasScrolledToNotifyFeed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentFeedId, location.search, feedsQueryKey, tokenRef, queryClient, injectSingleFeedIntoCache, normalizeSingleFeed, token, hasScrolledToNotifyFeed]);

  /* ---------------------- Creator mode ---------------------- */
  useEffect(() => {
    if (!currentFeedId) {
      setCreatorModeFeeds(null);
      setCreatorId(null);
      setIsCreatorModeLoading(false);
      return;
    }

    const params = new URLSearchParams(location.search);
    const isShare = params.get("ref") === "share";
    if (isShare) {
      setCreatorModeFeeds(null);
      setCreatorId(null);
      setIsCreatorModeLoading(false);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setIsCreatorModeLoading(true);
      try {
        const res = await getFeedsByCreator(currentFeedId, tokenRef.current || token);
        const creatorFeedsRaw = res?.feeds ?? (Array.isArray(res) ? res : []);
        const cId = res?.creatorId ?? (creatorFeedsRaw[0]?.createdByAccount || creatorFeedsRaw[0]?.userId || null);

        if (cancelled) return;

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
          const highlighted = { ...clicked, __highlight: true };
          normalized.unshift(highlighted);

          setTimeout(() => {
            const feedTop = document.getElementById("feedTop");
            feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 250);

          setTimeout(() => {
            setCreatorModeFeeds((prev) =>
              prev?.map((item) => {
                if ((item._id || item.feedId) === currentFeedId) return { ...item, __highlight: false };
                return item;
              })
            );
          }, 3500);
        }

        setCreatorModeFeeds(normalized);
        setCreatorId(cId || null);
      } catch (err) {
        console.error("Error fetching creator feeds:", err);
        setCreatorModeFeeds(null);
        setCreatorId(null);
      } finally {
        if (!cancelled) setIsCreatorModeLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [currentFeedId, tokenRef.current, token]);

  /* ---------------------- notifyfeedid handling (notifications) ---------------------- */
  useEffect(() => {
    if (!notifyfeedid) return;
    if (!tokenRef.current && !token) return;
    if (hasScrolledToNotifyFeed) return;

    let cancelled = false;
    const run = async () => {
      // Try cache first
      const cache = queryClient.getQueryData(feedsQueryKey);
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
          queryClient.setQueryData(feedsQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) =>
                  (item._id || item.feedId || item.id || it.feedID) === notifyfeedid
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

      // If not found in cache but feeds not loaded yet - wait
      const feedsLoaded = !!feedPages && Array.isArray(feedPages.pages) && feedPages.pages.length > 0;
      if (!feedsLoaded) return;

      try {
        const raw = await getSingleFeed(notifyfeedid, tokenRef.current || token);
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
          queryClient.setQueryData(feedsQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) =>
                  (item._id || item.feedId || item.id || it.feedID) === notifyfeedid
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

    return () => {
      cancelled = true;
    };
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
      queryClient.removeQueries(feedsQueryKey);
    }
  }, [feedCategory, queryClient, feedsQueryKey]);

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
      queryClient.setQueryData(feedsQueryKey, (oldData) => {
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
  }, [queryClient, feedsQueryKey]);

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
    const categoryFilteredFeeds = feedCategory ? feeds.filter((f) => f?.category === feedCategory) : feeds;
    filteredFeeds = showReels ? categoryFilteredFeeds.filter((f) => f.type === "video") : categoryFilteredFeeds;
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
  let mixed = [];
  const isCreatorMode = !!currentFeedId && Array.isArray(creatorModeFeeds);

  if (isHashtagMode) {
    // ⭐ HASHTAG MODE — ONLY FEEDS, NO JOBS
    mixed = filteredFeeds.map((f) => ({ ...f, __kind: "feed" }));
  } else if (isCreatorMode) {
    mixed = (creatorModeFeeds || []).map((f) => ({ ...f, __kind: "feed" }));
  } else {
    mixed = mixFeedsAndJobs(filteredFeeds, showReels ? [] : filteredJobs, JOB_RATIO);
  }

  /* ---------------------- hide from UI ---------------------- */
  const handleHideFromUI = (feedId) => {
    if (isCreatorMode) {
      setCreatorModeFeeds((prev) => prev?.filter((it) => (it._id || it.feedId || it.id || it.feedID) !== feedId));
    }

    queryClient.setQueryData(feedsQueryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => page.filter((item) => (item.feedId || item._id || item.id || it.feedID) !== feedId)),
        pageParams: oldData.pageParams ?? [1],
      };
    });
  };

  const isLoading = isFeedsLoading || isJobsLoading || isCreatorModeLoading;

  /* ---------------------- Handle back navigation ---------------------- */
  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  /* ------------------------------- Render --------------------------------- */
  return (
    <>
      <div id="feedTop">
        <div className={` px-3 sm:px-4 md:px-6 py-5 max-w-2xl transition-all duration-300 ${showReels ? "bg-gray-50" : "bg-white"}`}>
      
          {/* ⭐ REGULAR HOME PAGE COMPONENTS (only show when NOT in hashtag mode) */}
          {!isHashtagMode && (
            <>
              <Stories />
              
              <div className="mt- flex items-center flex-col mb-6">
                <Createpost authUser={authUser} token={tokenRef.current || token}  />
              </div>
            </>
          )}

          {/* Creator mode header (only when in creator mode, not hashtag) */}
          {isCreatorMode && !isHashtagMode && (
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

          {/* Feeds/Jobs content */}
          <AnimatePresence>
            <div className="flex items-center  flex-col gap-5">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => <FeedSkeleton key={i} />)
              ) : mixed.length > 0 ? (
                mixed.map((item, idx) => (
                  <motion.div 
                    key={item._id || item.feedId || idx} 
                    initial={{ opacity: 0, y: 30 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.9 }} 
                    transition={{ duration: 0.4 }}
                  >
                    {item.__kind === "job" && !isHashtagMode ? (
                      <JobCard jobData={mapJobForCard(item)} />
                    ) : (
                      <PostcardWrapper
                        key={item._id || item.feedId || idx}
                        postData={item}
                        authUser={authUser}
                        token={tokenRef.current || token}
                        onHideFromUI={handleHideFromUI}
                      />
                    )}
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {feedsError || jobsError ? "⚠️ Failed to load content." : 
                   feedCategory ? "No feeds found for this category." : 
                   showReels ? "No reels found 🎬" : 
                   isHashtagMode ? `No posts found for #${tagname}` : 
                   "No content available."}
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