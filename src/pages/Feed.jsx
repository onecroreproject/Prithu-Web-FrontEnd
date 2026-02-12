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

import MobileFeedView from "../components/FeedPageComponent/MobileFeedView";
import DesktopListFeedView from "../components/FeedPageComponent/DesktopListFeedView";
import DesktopGridFeedView from "../components/FeedPageComponent/DesktopGridFeedView";

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

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const fetchPostType = showReels ? "video" : (showImages ? "image" : null);
  const feedsQueryKey = ["feeds", tokenRef.current || token, tagname || "all", feedCategory || "all", fetchPostType || "all"];

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

      if (tagname) {
        return getFeedsByHashtag(tagname, param.page || 1, tokenRef.current || token);
      }

      const fetchCategoryId = param.categoryId || feedCategory;

      if (fetchCategoryId === 'trending') {
        return getTrendingFeeds(param.allPage, tokenRef.current || token, param.postType);
      }

      if (param.mode === "category" && fetchCategoryId) {
        return getAllFeeds(param.categoryPage, tokenRef.current || token, fetchCategoryId, param.postType);
      } else {
        return getAllFeeds(param.allPage, tokenRef.current || token, null, param.postType);
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
  });

  const feeds = (() => {
    return feedPages?.pages.flat() || [];
  })();
  console.log(feeds)

  const normalizeSingleFeed = useCallback((raw) => {
    console.log(raw)
    if (!raw) return null;
    const creator = raw.creatorData || raw.creatorInfo || raw.creator || raw.postedBy || {};
    const designMetadata = raw.designMetadata || {};
    const editMetadata = raw.editMetadata || designMetadata.editMetadata || {};
    const footerSrc = raw.footerDisplay || designMetadata.footerConfig || {};
    const isTemplate = raw.uploadMode === "template" || designMetadata.isTemplate || (designMetadata.overlayElements?.length > 0);

    // Normalize overlays for the renderer
    const overlayElements = (designMetadata.overlayElements || []).map(el => ({
      ...el,
      x: Number(el.xPercent ?? el.x ?? 0),
      y: Number(el.yPercent ?? el.y ?? 0),
      w: Number(el.wPercent ?? el.w ?? 20),
      h: Number(el.hPercent ?? el.h ?? 20),
    }));

    // Calculate aspect ratio
    let postAspectRatio = editMetadata?.crop?.ratio || designMetadata.canvasSettings?.aspectRatio || "1:1";
    if (postAspectRatio === "original") {
      postAspectRatio = designMetadata.canvasSettings?.aspectRatio || "1:1";
    }

    return {
      ...raw,
      type: raw.type || raw.postType || "image",
      contentUrl: raw.contentUrl || raw.mediaUrl || (raw.files?.[0]?.url) || "",
      postedBy: {
        id: creator._id || creator.id || raw.createdByAccount || null,
        name: creator.userName || creator.name || creator.displayName || "Unknown",
        avatar: creator.profileAvatar || creator.avatar || defaultAvatar,
        modifyAvatar: creator.modifyAvatar || null,
        role: creator.role || raw.roleRef || "User",
      },
      overlayElements,
      editMetadata,
      hasFooter: Boolean(footerSrc.enabled || footerSrc.visible || raw.hasFooter),
      uploadMode: isTemplate ? "template" : "normal",
      aspectRatio: postAspectRatio,
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
      if (!feedId) return;
      queryClient.setQueryData(feedsQueryKey, (oldData) => {
        if (!oldData || !oldData.pages) return oldData;
        const idCheck = (it) => (it._id || it.feedId) === feedId;
        let removedItem = null;
        const newPages = oldData.pages.map((page) => {
          if (removedItem) return page;
          const idx = page.findIndex(idCheck);
          if (idx === -1) return page;
          removedItem = page[idx];
          return [...page.slice(0, idx), ...page.slice(idx + 1)];
        });
        if (!removedItem) return oldData;
        const highlighted = { ...removedItem, __highlight: true };
        const firstPage = newPages[0] ? [highlighted, ...newPages[0]] : [highlighted];
        return { ...oldData, pages: [firstPage, ...newPages.slice(1)], pageParams: oldData.pageParams ?? [1] };
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

  useEffect(() => {
    if (!currentFeedId) return;
    const params = new URLSearchParams(location.search);
    const isShare = params.get("ref") === "share";
    if (!isShare) return;
    let cancelled = false;
    (async () => {
      try {
        if (hasScrolledToNotifyFeed) return;
        const cache = queryClient.getQueryData(feedsQueryKey);
        const pages = cache?.pages ?? [];
        const flat = pages.flat();
        const matchIndex = flat.findIndex((it) => (it._id || it.feedId) === currentFeedId);
        let single = null;
        if (matchIndex !== -1) {
          single = flat[matchIndex];
        } else {
          const raw = await getSingleFeed(currentFeedId, tokenRef.current || token);
          if (!raw) {
            setHasScrolledToNotifyFeed(true);
            return;
          }
          single = normalizeSingleFeed(raw);
        }
        if (cancelled) return;
        injectSingleFeedIntoCache(single);
        setHighlightedFeedId(currentFeedId);
        setTimeout(() => {
          const feedTop = document.getElementById("feedTop");
          feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          setHasScrolledToNotifyFeed(true);
        }, 250);
        setTimeout(() => {
          setHighlightedFeedId(null);
          queryClient.setQueryData(feedsQueryKey, (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              pages: oldData.pages.map((page) =>
                page.map((item) => (item._id || item.feedId) === currentFeedId ? { ...item, __highlight: false } : item)
              ),
              pageParams: oldData.pageParams ?? [1],
            };
          });
        }, 3500);
      } catch (err) {
        setHasScrolledToNotifyFeed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [currentFeedId, location.search, feedsQueryKey, queryClient, injectSingleFeedIntoCache, normalizeSingleFeed, token, hasScrolledToNotifyFeed]);

  useEffect(() => {
    if (!notifyfeedid || hasScrolledToNotifyFeed) return;
    let cancelled = false;
    const run = async () => {
      const cache = queryClient.getQueryData(feedsQueryKey);
      const flat = cache?.pages?.flat?.() || [];
      const found = flat.find((it) => (it._id || it.feedId) === notifyfeedid);
      if (found) {
        moveFeedToTop(notifyfeedid);
        setHighlightedFeedId(notifyfeedid);
        setTimeout(() => {
          if (cancelled) return;
          const feedTop = document.getElementById("feedTop");
          feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          setHasScrolledToNotifyFeed(true);
        }, 300);
        return;
      }
      try {
        const raw = await getSingleFeed(notifyfeedid, tokenRef.current || token);
        if (!raw) { setHasScrolledToNotifyFeed(true); return; }
        const normalized = normalizeSingleFeed(raw);
        injectSingleFeedIntoCache(normalized);
        setTimeout(() => {
          if (cancelled) return;
          const feedTop = document.getElementById("feedTop");
          feedTop?.scrollIntoView({ behavior: "smooth", block: "start" });
          setHasScrolledToNotifyFeed(true);
        }, 300);
      } catch (err) {
        setHasScrolledToNotifyFeed(true);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [notifyfeedid, feedPages, hasScrolledToNotifyFeed, token, queryClient, feedsQueryKey, moveFeedToTop, injectSingleFeedIntoCache, normalizeSingleFeed]);

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
    if (categoryId) {
      setExcludedCategoryIds((prev) => [...prev, categoryId]);

      // Cache update: Remove all feeds with matching category
      queryClient.setQueryData(feedsQueryKey, (oldData) => {
        if (!oldData) return oldData;
        const catIdStr = categoryId.toString();
        return {
          ...oldData,
          pages: oldData.pages.map((page) =>
            page.filter((item) => {
              const itemCatId = (item.category || item.categoryId)?.toString();
              return itemCatId !== catIdStr;
            })
          ),
          pageParams: oldData.pageParams ?? [1],
        };
      });
    } else {
      // Fallback
      handleHideFromUI(feedId);
    }
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
      <div className={`relative px-0 sm:px-4 md:px-6 md:py-5 mx-auto transition-all duration-300 ${(showReels || showImages) ? "bg-gray-50" : "bg-white"} ${viewMode === 'grid' ? 'max-w-[1400px]' : 'max-w-[470px] sm:max-w-[800px]'} w-full flex flex-col`}>
        {isHashtagMode && (
          <div className="absolute mb-2 top-1 right-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <TagIcon fontSize="inherit" />
            {tagname}
          </div>
        )}
        {!isHashtagMode && (
          <div className="sticky top-14 lg:top-0 z-40 bg-white/95 backdrop-blur-md p-1 mb-1 flex flex-row items-center justify-between border-b border-gray-100/50 sm:border-none gap-2 shrink-0">
            <div className="flex-1 overflow-hidden">
              <CategoryFeedPage
                onSelectCategory={setFeedCategory}
                selectedCategoryId={feedCategory}
                excludedCategoryIds={excludedCategoryIds}
              />
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

        {/* Scrollable Feed Container */}
        <div className={`flex-1 ${viewMode === 'list' ? 'snap-y snap-mandatory scroll-smooth' : ''} no-scrollbar`}>
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
