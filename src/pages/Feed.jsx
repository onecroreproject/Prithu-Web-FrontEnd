import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllFeeds,
  getSingleFeed,
  getFeedsByHashtag,
  getTrendingFeeds,
  getBirthdayFeeds,
  getAnniversaryFeeds,
  getPoliticsFeeds,
  getRecommendedFeeds,
} from "../Service/feedService";
import { useCategories } from "../hooks/useMiscellaneous";


import PostcardWrapper from "../components/FeedPageComponent/postCardWraper";
import Stories from "../components/Stories";
import Createpost from "../components/postCreatedCard";
import { Skeleton } from "@mui/material";
import TagIcon from "@mui/icons-material/Tag";

import throttle from "lodash.throttle";
import CategoryFeedPage from "../components/categories";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import SlowMotionVideoIcon from "@mui/icons-material/SlowMotionVideo";
import PhotoIcon from "@mui/icons-material/Photo";

import MobileFeedView from "../components/FeedPageComponent/MobileFeedView";
import DesktopListFeedView from "../components/FeedPageComponent/DesktopListFeedView";
import DesktopGridFeedView from "../components/FeedPageComponent/DesktopGridFeedView";

import SEO from "../components/SEO";

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

const Feed = ({ authUser, notifyfeedid, searchFeedId, viewMode: propsViewMode, setViewMode: propsSetViewMode }) => {
  const context = useOutletContext() || {};
  const viewMode = propsViewMode || context.viewMode;
  const setViewMode = propsSetViewMode || context.setViewMode;
  const { tagname } = useParams();
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: categoryListData = [], isLoading: isCategoriesLoading } = useCategories();

  const isHashtagMode = !!tagname;

  const currentFeedId = (() => {
    const m = location.pathname.match(/\/retrivefeed\/([^/]+)/);
    return m ? decodeURIComponent(m[1].split("?")[0]) : null;
  })();

  const [showReels, setShowReels] = useState(location.pathname === "/home/reels");
  const [showImages, setShowImages] = useState(location.pathname === "/home/images");
  const [feedCategory, setFeedCategory] = useState(null);
  const [highlightedFeedId, setHighlightedFeedId] = useState(null);
  const [hasScrolledToNotifyFeed, setHasScrolledToNotifyFeed] = useState(false);
  const prevNotifyId = useRef(null);
  const prevCurrentFeedId = useRef(null);

  // Reset scroll flag if IDs change
  useEffect(() => {
    if ((notifyfeedid && notifyfeedid !== prevNotifyId.current) ||
      (currentFeedId && currentFeedId !== prevCurrentFeedId.current)) {
      console.log("🔔 [Feed] Notification Feed ID Changed:", { notifyfeedid, currentFeedId });
      console.log("🔄 [Feed] Resetting scroll flag and filters");
      setHasScrolledToNotifyFeed(false);
      // ✅ Reset ALL filters to ensure the feed is visible in the main "All" view
      setFeedCategory(null);
      setShowReels(false);
      setShowImages(false);

      prevNotifyId.current = notifyfeedid;
      prevCurrentFeedId.current = currentFeedId;
    }
  }, [notifyfeedid, currentFeedId]);


  // Sync feedCategory ID for special pages (Politics, Birthday, Anniversary)
  useEffect(() => {
    if (!categoryListData || categoryListData.length === 0) return;

    if (location.pathname === "/home/politics") {
      const cat = categoryListData.find(c => c.categoryName?.toLowerCase() === "politics");
      if (cat) setFeedCategory(cat.categoryId || cat._id);
    } else if (location.pathname === "/home/birthday") {
      const cat = categoryListData.find(c => c.categoryName?.toLowerCase() === "birthday");
      if (cat) setFeedCategory(cat.categoryId || cat._id);
    } else if (location.pathname === "/home/anniversary") {
      const cat = categoryListData.find(c => 
        c.categoryName?.toLowerCase() === "anniversary" || 
        c.categoryName?.toLowerCase() === "greetings"
      );
      if (cat) setFeedCategory(cat.categoryId || cat._id);
    }
  }, [location.pathname, categoryListData]);

  const handleFeedCategoryChange = (newVal) => {
    if (typeof newVal === 'string' && newVal.startsWith('hashtag:')) {
      const tag = newVal.split(':')[1];
      navigate(`/home/hashtag/${tag}`);
      return;
    }
    setFeedCategory(newVal);
  };

  const [isCreatorModeLoading, setIsCreatorModeLoading] = useState(false);
  const [excludedCategoryIds, setExcludedCategoryIds] = useState([]);
  const [activeVideoId, setActiveVideoId] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  // Force list view on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && viewMode !== "list") {
        setViewMode("list");
      }
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode, setViewMode]);


  const fetchPostType = showReels ? "video" : (showImages ? "image" : null);
  const feedsQueryKey = ["feeds", tokenRef.current || token, tagname || "all", feedCategory || "all", fetchPostType || "all", location.pathname];

  // Log query key changes
  useEffect(() => {
    console.log("🔑 [Feed] Query Key Changed:", { tagname, feedCategory, fetchPostType, queryKey: feedsQueryKey });
  }, [tagname, feedCategory, fetchPostType]);

  const initialPageParam = {
    categoryPage: 1,
    allPage: 1,
    mode: feedCategory ? "category" : "all",
    categoryId: feedCategory || null,
    postType: fetchPostType || null
  };

  const {
    data: feedPages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isFeedsLoading,
    isError: feedsError,
  } = useInfiniteQuery({
    queryKey: feedsQueryKey,
    queryFn: ({ pageParam }) => {
      const param = pageParam || initialPageParam;
      console.log("🌐 [Feed] queryFn called - Fetching feeds from API", { pageParam: param, tagname, feedCategory, fetchPostType });

      if (tagname) {
        return getFeedsByHashtag(tagname, param.page || 1, tokenRef.current || token);
      }

      if (location.pathname === "/home/birthday") {
        return getBirthdayFeeds(param.allPage, tokenRef.current || token);
      }
      if (location.pathname === "/home/anniversary") {
        return getAnniversaryFeeds(param.allPage, tokenRef.current || token);
      }
      if (location.pathname === "/home/politics") {
        return getPoliticsFeeds(param.allPage, tokenRef.current || token);
      }

      const fetchCategoryId = param.categoryId || feedCategory;

      if (fetchCategoryId === 'trending') {
        return getTrendingFeeds(param.allPage, tokenRef.current || token, param.postType);
      }

      if (param.mode === "category" && fetchCategoryId) {
        return getAllFeeds(param.categoryPage, tokenRef.current || token, fetchCategoryId, param.postType);
      } else {
        // 🚀 Use new Recommendation Engine for the main feed
        return getRecommendedFeeds(param.allPage, tokenRef.current || token);
      }
    },
    initialPageParam,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (tagname) {
        const currentPage = typeof lastPageParam === "number" ? lastPageParam : (lastPageParam?.page || 1);
        return lastPage && lastPage.length < 10 ? undefined : currentPage + 1;
      }

      const currentParam = lastPageParam || initialPageParam;
      const isFullBatch = lastPage && lastPage.length >= 10;

      // If batch is not full, we reached the end -> "You're all caught up"
      if (!isFullBatch) return undefined;

      if (currentParam.mode === "category") {
        // Special case for Trending - just increment page
        if (feedCategory === 'trending' || currentParam.categoryId === 'trending') {
          return { ...currentParam, allPage: currentParam.allPage + 1 };
        }
        return { ...currentParam, categoryPage: currentParam.categoryPage + 1 };
      } else {
        // mode === "all"
        return { ...currentParam, allPage: currentParam.allPage + 1 };
      }
    },
    enabled: !!(tokenRef.current || token),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false, // Prevent refetch on socket reconnection
  });

  const feeds = (() => {
    const result = feedPages?.pages.flat() || [];
    return result;
  })();

  const normalizeSingleFeed = useCallback((raw) => {
    const id = raw._id || raw.feedId;
    const type = raw.type || raw.postType;

    let mediaUrl = raw.mediaUrl || raw.contentUrl;
    if (Array.isArray(mediaUrl)) {
      mediaUrl = mediaUrl[0];
    }

    // Extract creator data from multiple possible locations
    const rawCreatorData = raw.creatorData || raw.postedBy || raw.creator || {};

    // Extract userName with comprehensive fallback chain
    const extractedUserName =
      rawCreatorData.userName ||
      rawCreatorData.name ||
      rawCreatorData.displayName ||
      raw.userName ||
      raw.creatorName ||
      "Unknown User";

    // Extract avatar with comprehensive fallback chain
    const extractedAvatar =
      rawCreatorData.profileAvatar ||
      rawCreatorData.avatar ||
      raw.profileAvatar ||
      raw.avatarToUse;

    const creatorData = {
      ...rawCreatorData,
      userName: extractedUserName,
      profileAvatar: extractedAvatar,
    };

    const stats = raw.stats || {
      likes: raw.likesCount || 0,
      views: raw.viewsCount || 0,
      comments: raw.commentsCount || 0,
      shares: raw.shareCount || 0,
      downloads: raw.downloadCount || 0,
    };

    const footerDisplay = raw.footerDisplay || (raw.designMetadata?.footerConfig ? {
      ...raw.designMetadata.footerConfig,
      enabled: true,
    } : { enabled: false });

    // Normalize overlays for the renderer
    const overlayElements = (raw.designMetadata?.overlayElements || []).map(el => ({
      ...el,
      x: Number(el.xPercent ?? el.x ?? 0),
      y: Number(el.yPercent ?? el.y ?? 0),
      w: Number(el.wPercent ?? el.w ?? 20),
      h: Number(el.hPercent ?? el.h ?? 20),
    }));

    // Calculate aspect ratio
    let postAspectRatio = raw.editMetadata?.crop?.ratio || raw.designMetadata?.canvasSettings?.aspectRatio || "1:1";
    if (postAspectRatio === "original") {
      postAspectRatio = raw.designMetadata?.canvasSettings?.aspectRatio || "1:1";
    }

    return {
      ...raw,
      _id: id,
      feedId: id,
      type,
      mediaUrl,
      creatorData,
      stats,
      footerDisplay,
      isLiked: raw.isLiked || false,
      isSaved: raw.isSaved || false,
      __highlight: raw.__highlight || false,
      overlayElements,
      aspectRatio: postAspectRatio,
      // Top-level user properties for PostHeader component
      userName: extractedUserName,
      profileAvatar: extractedAvatar,
      postedBy: {
        id: creatorData._id || creatorData.id || raw.createdByAccount || null,
        name: extractedUserName,
        avatar: extractedAvatar || defaultAvatar,
        modifyAvatar: creatorData.modifyAvatar || null,
        role: creatorData.role || raw.roleRef || "User",
      },
      hasFooter: Boolean(footerDisplay.enabled || footerDisplay.visible || raw.hasFooter),
      uploadMode: raw.uploadMode === "template" || raw.designMetadata?.isTemplate || (raw.designMetadata?.overlayElements?.length > 0) ? "template" : "normal",
    };
  }, []);

  const injectSingleFeedIntoCache = useCallback(
    (singleFeed) => {
      if (!singleFeed) return;
      queryClient.setQueryData(feedsQueryKey, (oldData) => {
        if (!oldData || !oldData.pages) {
          return { pages: [[{ ...singleFeed, __highlight: true }]], pageParams: [1] };
        }
        const seenId = singleFeed._id || singleFeed.feedId;
        const cleanedPages = oldData.pages.map((page) =>
          page.filter((it) => (it._id || it.feedId) !== seenId)
        );
        const newFirstPage = [{ ...singleFeed, __highlight: true }, ...(cleanedPages[0] || [])];
        return { ...oldData, pages: [newFirstPage, ...cleanedPages.slice(1)], pageParams: oldData.pageParams ?? [1] };
      });
    },
    [queryClient, feedsQueryKey]
  );

  const moveFeedToTop = useCallback(
    (feedId) => {
      queryClient.setQueryData(feedsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        const seenId = feedId;
        const cleanedPages = oldData.pages.map((page) =>
          page.filter((it) => (it._id || it.feedId) !== seenId)
        );
        const targetFeed = oldData.pages
          .flat()
          .find((it) => (it._id || it.feedId) === seenId);
        if (!targetFeed) return oldData;
        const newFirstPage = [{ ...targetFeed, __highlight: true }, ...(cleanedPages[0] || [])];
        return { ...oldData, pages: [newFirstPage, ...cleanedPages.slice(1)], pageParams: oldData.pageParams ?? [1] };
      });
    },
    [queryClient, feedsQueryKey]
  );

  const highlightAndUnhighlight = useCallback(
    (feedId) => {
      if (!feedId) return;
      setHighlightedFeedId(feedId);
      moveFeedToTop(feedId);
      setTimeout(() => {
        setHighlightedFeedId(null);
        queryClient.setQueryData(feedsQueryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) =>
              page.map((item) => {
                if ((item._id || item.feedId) === feedId) {
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

  // Consolidate "Link Handling" (Notifications & Shared Posts)
  useEffect(() => {
    const targetId = notifyfeedid || currentFeedId;
    console.log("🎯 [Feed] Link Handling Effect Triggered:", { targetId, notifyfeedid, currentFeedId, hasScrolledToNotifyFeed });

    // Check if cache is empty - if so, reset scroll flag to allow re-fetch after socket reconnection
    const homeQueryKey = ["feeds", tokenRef.current || token, "all", "all", "all"];
    const cache = queryClient.getQueryData(homeQueryKey);
    const pages = cache?.pages ?? [];
    const totalFeeds = pages.flat().length;

    if (targetId && hasScrolledToNotifyFeed && totalFeeds === 0) {
      console.log("🔄 [Feed] Cache is empty but we have targetId - resetting scroll flag to re-fetch");
      setHasScrolledToNotifyFeed(false);
      return;
    }

    if (!targetId || hasScrolledToNotifyFeed) {
      console.log("⏭️ [Feed] Skipping link handling:", { hasTargetId: !!targetId, hasScrolledToNotifyFeed });
      return;
    }

    let cancelled = false;

    const run = async () => {
      console.log("🚀 [Feed] Starting notification feed handling for:", targetId);

      // 1. Reset Filters Immediately to ensure we are in "All/Home" view
      console.log("🔄 [Feed] Current filters:", { feedCategory, showReels, showImages });
      if (feedCategory !== null) {
        console.log("🔄 [Feed] Resetting feedCategory to null");
        setFeedCategory(null);
      }
      if (showReels) {
        console.log("🔄 [Feed] Resetting showReels to false");
        setShowReels(false);
      }
      if (showImages) {
        console.log("🔄 [Feed] Resetting showImages to false");
        setShowImages(false);
      }

      // 2. Determine target cache key (Home All All All)
      const homeQueryKey = ["feeds", tokenRef.current || token, "all", "all", "all"];
      console.log("🔑 [Feed] Using query key:", homeQueryKey);

      try {
        const cache = queryClient.getQueryData(homeQueryKey);
        console.log("💾 [Feed] Current cache:", cache);

        const pages = cache?.pages ?? [];
        const flat = pages.flat();
        console.log("📄 [Feed] Total feeds in cache:", flat.length);

        const found = flat.find((it) => (it._id || it.feedId) === targetId);
        console.log("🔍 [Feed] Feed found in cache:", !!found, found ? { id: found._id || found.feedId, type: found.type } : null);

        let targetFeed = found;

        if (!targetFeed) {
          console.log("📡 [Feed] Feed not in cache, fetching from API...");
          const raw = await getSingleFeed(targetId, tokenRef.current || token);
          console.log("📡 [Feed] API Response:", raw);

          if (!raw) {
            console.error("❌ [Feed] Feed not found in API, marking as scrolled");
            setHasScrolledToNotifyFeed(true);
            return;
          }
          targetFeed = normalizeSingleFeed(raw);
          console.log("✅ [Feed] Feed normalized:", targetFeed);
        }

        if (cancelled) {
          console.log("🛑 [Feed] Operation cancelled");
          return;
        }

        // 3. Inject/Move to top Directly on homeQueryKey
        console.log("⬆️ [Feed] Moving feed to top of cache...");
        queryClient.setQueryData(homeQueryKey, (oldData) => {
          if (!oldData || !oldData.pages) {
            console.log("📝 [Feed] Creating new cache with single feed");
            return { pages: [[{ ...targetFeed, __highlight: true }]], pageParams: [1] };
          }
          const seenId = targetFeed._id || targetFeed.feedId;
          console.log("🧹 [Feed] Removing duplicates of feed:", seenId);

          const cleanedPages = oldData.pages.map((page) =>
            page.filter((it) => (it._id || it.feedId) !== seenId)
          );
          const newFirstPage = [{ ...targetFeed, __highlight: true }, ...(cleanedPages[0] || [])];
          console.log("✅ [Feed] Feed moved to top. New first page length:", newFirstPage.length);

          return { ...oldData, pages: [newFirstPage, ...cleanedPages.slice(1)], pageParams: oldData.pageParams ?? [1] };
        });

        console.log("🎨 [Feed] Setting highlighted feed ID:", targetId);
        setHighlightedFeedId(targetId);

        // 4. Scroll and Mark as done
        setTimeout(() => {
          if (cancelled) return;
          console.log("📜 [Feed] Attempting to scroll to feedTop...");

          const feedTop = document.getElementById("feedTop");
          if (feedTop) {
            const yOffset = -80; // Small offset for header
            const element = feedTop;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            console.log("📜 [Feed] Scrolling to position:", y);
            window.scrollTo({ top: y, behavior: 'smooth' });
          } else {
            console.warn("⚠️ [Feed] feedTop element not found");
          }

          console.log("✅ [Feed] Marking as scrolled");
          setHasScrolledToNotifyFeed(true);
        }, 400);

        // 5. Cleanup highlight after delay
        setTimeout(() => {
          if (cancelled) return;
          console.log("🎨 [Feed] Removing highlight from feed:", targetId);
          setHighlightedFeedId(null);
          queryClient.setQueryData(homeQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) => (item._id || item.feedId) === targetId ? { ...item, __highlight: false } : item)
              ),
              pageParams: oldData.pageParams ?? [1],
            };
          });
          console.log("✅ [Feed] Highlight removed");
        }, 4000);

      } catch (err) {
        console.error("❌ [Feed] Highlighting error:", err);
        console.error("❌ [Feed] Error stack:", err.stack);
        setHasScrolledToNotifyFeed(true);
      }
    };

    run();
    return () => {
      console.log("🧹 [Feed] Cleanup: Cancelling notification feed handling");
      cancelled = true;
    };
  }, [notifyfeedid, currentFeedId, hasScrolledToNotifyFeed, token, queryClient, normalizeSingleFeed]);

  useEffect(() => {
    const handleScroll = throttle(() => {
      if (!hasNextPage || isFetchingNextPage) return;
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement || document.body;
      if (scrollTop + clientHeight >= scrollHeight - 500) {
        fetchNextPage();
      }
    }, 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // ✅ REAL-TIME FEED LISTENER
  useEffect(() => {
    const handleSocketNewFeed = (e) => {
      const newFeed = e.detail;
      if (!newFeed) return;

      console.log("🚀 [Feed] Real-time feed received:", newFeed);

      // 1. Normalize the raw feed data from socket
      const normalized = normalizeSingleFeed(newFeed);

      // 2. Inject into React Query cache (move to top)
      injectSingleFeedIntoCache(normalized);

      // 3. Optional: Highlight the new feed
      setHighlightedFeedId(normalized._id || normalized.feedId);
      setTimeout(() => setHighlightedFeedId(null), 3000);
    };

    document.addEventListener("socket:newFeed", handleSocketNewFeed);
    return () => document.removeEventListener("socket:newFeed", handleSocketNewFeed);
  }, [normalizeSingleFeed, injectSingleFeedIntoCache]);

  useEffect(() => {
    const handleToggleReels = (e) => {
      const isActive = e.detail.isActive;
      setShowReels(isActive);
      if (isActive) setShowImages(false);
    };
    const handleToggleImages = (e) => {
      const isActive = e.detail.isActive;
      setShowImages(isActive);
      if (isActive) setShowReels(false);
    };

    window.addEventListener("toggleReels", handleToggleReels);
    window.addEventListener("toggleImages", handleToggleImages);
    return () => {
      window.removeEventListener("toggleReels", handleToggleReels);
      window.removeEventListener("toggleImages", handleToggleImages);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/home/reels") {
      setShowReels(true);
      setShowImages(false);
    } else if (location.pathname === "/home/images") {
      setShowImages(true);
      setShowReels(false);
    } else if (location.pathname === "/home" || location.pathname === "/") {
      // Keep current state if toggled via events
    } else {
      setShowReels(false);
      setShowImages(false);
    }
  }, [location.pathname]);

  let mixed = feeds.map(f => ({ ...normalizeSingleFeed(f), __kind: "feed" }));


  const handleHideFromUI = (feedId) => {
    queryClient.setQueryData(feedsQueryKey, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => page.filter((item) => (item.feedId || item._id) !== feedId)),
        pageParams: oldData.pageParams ?? [1],
      };
    });
  };

  const handleNotInterestedFromUI = (feedId, categoryId) => {
    // 1. Determine categories to exclude
    let newExcludedIds = [];
    if (categoryId) {
      if (Array.isArray(categoryId)) {
        newExcludedIds = categoryId.map(id => id.toString());
      } else {
        newExcludedIds = [categoryId.toString()];
      }
    }

    // 2. Update Local State (for Category Bar and future fetches)
    if (newExcludedIds.length > 0) {
      setExcludedCategoryIds((prev) => {
        const unique = new Set([...prev, ...newExcludedIds]);
        return Array.from(unique);
      });
    }

    // 3. Update React Query Cache (Instant UI Removal)
    queryClient.setQueryData(feedsQueryKey, (oldData) => {
      if (!oldData) return oldData;

      return {
        ...oldData,
        pages: oldData.pages.map((page) =>
          page.filter((item) => {
            // A. Remove the specific feed
            if ((item._id || item.feedId) === feedId) return false;

            // B. Remove if item has ANY of the newly excluded categories
            if (newExcludedIds.length > 0) {
              const itemCats = item.category || item.categoryId;
              let itemCatIds = [];

              if (Array.isArray(itemCats)) {
                itemCatIds = itemCats.map(c => c.toString());
              } else if (itemCats) {
                itemCatIds = [itemCats.toString()];
              }

              // If item has ANY excluded category -> Remove it
              const hasExcluded = itemCatIds.some(id => newExcludedIds.includes(id));
              if (hasExcluded) return false;
            }

            return true;
          })
        ),
        pageParams: oldData.pageParams ?? [1],
      };
    });
  };

  const isLoading = isFeedsLoading || isCreatorModeLoading;
  // Handle incoming category from SearchPage navigation
  useEffect(() => {
    if (location.state?.selectedCategoryId) {
      setFeedCategory(location.state.selectedCategoryId);
      // Clear state so it doesn't trigger again on manual refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, setFeedCategory]);

  return (
    <div id="feedTop" className="min-h-screen flex flex-col">
      <SEO
        title="Prithu - Best Status & Motivational Video App"
        description="Explore Prithu - watch status videos, motivational, spiritual & educational reels, movie dialogues & daily life impressions with smart personalization and instant sharing."
        keywords="Prithu, status videos, motivational videos, spiritual reels, educational reels, video creator, share rewards"
        name="Prithu"
        type="website"
        canonical="https://prithu.app"
      />
      <div className={`relative px-0 sm:px-4 md:px-6 md:py-5 mx-auto transition-all duration-300 ${(showReels || showImages) ? "bg-gray-50" : "bg-white"} ${viewMode === 'grid' ? 'max-w-[1400px]' : 'max-w-[470px] sm:max-w-[800px]'} w-full flex flex-col`}>
        {isHashtagMode && (
          <div className="absolute mb-2 top-1 right-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <TagIcon fontSize="inherit" />
            {tagname}
          </div>
        )}
        {!isHashtagMode && (
          <div className="sticky top-14 lg:top-0 z-40 bg-white/95 backdrop-blur-md p-1 mb-[-1] flex flex-row items-center justify-between border-b border-gray-100/50 sm:border-none gap-2 shrink-0">
            <div className="flex-1 overflow-hidden">
              {!['/home/birthday', '/home/anniversary'].includes(location.pathname) && (
                <CategoryFeedPage
                  onSelectCategory={handleFeedCategoryChange}
                  selectedCategoryId={feedCategory}
                  excludedCategoryIds={excludedCategoryIds}
                  hideCategories={location.pathname === '/home/politics'}
                />
              )}
            </div>
            <div className="hidden md:flex items-center bg-gray-100/80 rounded-full p-1 shrink-0 shadow-inner mr-2">
              <button
                onClick={() => {
                  const next = !showReels;
                  setShowReels(next);
                  if (next) setShowImages(false);
                }}
                className={`p-1.5 rounded-full transition-all duration-300 ${showReels ? "bg-white text-pink-600 shadow-sm scale-110" : "text-gray-400 hover:text-gray-600"}`}
                title="Reels Only"
              >
                <SlowMotionVideoIcon fontSize="small" />
              </button>
              <button
                onClick={() => {
                  const next = !showImages;
                  setShowImages(next);
                  if (next) setShowReels(false);
                }}
                className={`p-1.5 rounded-full transition-all duration-300 ${showImages ? "bg-white text-blue-600 shadow-sm scale-110" : "text-gray-400 hover:text-gray-600"}`}
                title="Images Only"
              >
                <PhotoIcon fontSize="small" />
              </button>
            </div>
            <div className="hidden md:flex items-center bg-gray-100/80 rounded-full p-1 shrink-0 shadow-inner">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === "list" ? "bg-white text-green-600 shadow-sm scale-110" : "text-gray-400 hover:text-gray-600"}`}
                title="List View"
              >
                <ViewListIcon fontSize="small" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full transition-all duration-300 ${viewMode === "grid" ? "bg-white text-green-600 shadow-sm scale-110" : "text-gray-400 hover:text-gray-600"}`}
                title="Grid View"
              >
                <ViewModuleIcon fontSize="small" />
              </button>
            </div>
          </div>
        )}

        {/* Outer Feed Container (Scrolling delegated to inner views) */}
        <div className={`flex-1 ${viewMode === 'list' ? 'min-h-0' : ''} no-scrollbar`}>
          {console.log("Feed.jsx: Rendering outer container. viewMode:", viewMode, "isMobile:", isMobile)}
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <motion.div
                key="loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={viewMode === 'grid'
                  ? "grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
                  : "flex items-center flex-col gap-0 w-full"}
              >
                {Array.from({ length: 4 }).map((_, i) => <FeedSkeleton key={i} />)}
              </motion.div>
            ) : mixed.length > 0 ? (
              viewMode === 'grid' ? (
                <DesktopGridFeedView
                  key={`grid-${feedCategory || tagname || "home"}`}
                  feeds={mixed}
                  authUser={authUser}
                  token={tokenRef.current || token}
                  handleHideFromUI={handleHideFromUI}
                  handleNotInterestedFromUI={handleNotInterestedFromUI}
                  activeVideoId={activeVideoId}
                  setActiveVideoId={setActiveVideoId}
                  viewMode={viewMode}
                />
              ) : isMobile ? (
                <MobileFeedView
                  key={`mobile-${feedCategory || tagname || "home"}`}
                  feeds={mixed}
                  authUser={authUser}
                  token={tokenRef.current || token}
                  handleHideFromUI={handleHideFromUI}
                  handleNotInterestedFromUI={handleNotInterestedFromUI}
                  activeVideoId={activeVideoId}
                  setActiveVideoId={setActiveVideoId}
                  viewMode={viewMode}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={fetchNextPage}
                />
              ) : (
                <DesktopListFeedView
                  key={`desktop-list-${feedCategory || tagname || "home"}`}
                  feeds={mixed}
                  authUser={authUser}
                  token={tokenRef.current || token}
                  handleHideFromUI={handleHideFromUI}
                  handleNotInterestedFromUI={handleNotInterestedFromUI}
                  activeVideoId={activeVideoId}
                  setActiveVideoId={setActiveVideoId}
                  viewMode={viewMode}
                />
              )
            ) : (
              <motion.div
                key="no-content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full text-center text-gray-500 py-8"
              >
                {feedsError ? "⚠️ Failed to load content." : "No content available."}
              </motion.div>
            )}
          </AnimatePresence>

          {isFetchingNextPage && (
            <div className="flex justify-center py-4 shrink-0">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}

          {!hasNextPage && !isLoading && mixed.length > 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-75 shrink-0">
              <div className="bg-green-100 p-3 rounded-full mb-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800">You're all caught up</h3>
              <p className="text-gray-500 text-sm mt-1">Check back later for more updates!</p>
            </div>
          )}
        </div>

        <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </div>
    </div>
  );
};

export default Feed;
