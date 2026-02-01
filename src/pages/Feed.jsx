import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllFeeds,
  getSingleFeed,
  getFeedsByHashtag,
} from "../Service/feedService";
import { useCategories } from "../hooks/useMiscellaneous";


import PostcardWrapper from "../components/FeedPageComponent/postCardWraper";
import Stories from "../components/Stories";
import Createpost from "../components/postCreatedCard";
import { Skeleton } from "@mui/material";
import TagIcon from "@mui/icons-material/Tag";

import throttle from "lodash.throttle";
import CategoryFeedPage from "../components/categories";

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

const Feed = ({ authUser, notifyfeedid, searchFeedId }) => {
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

  const [showReels, setShowReels] = useState(false);
  const [feedCategory, setFeedCategory] = useState(null);
  const [highlightedFeedId, setHighlightedFeedId] = useState(null);
  const [hasScrolledToNotifyFeed, setHasScrolledToNotifyFeed] = useState(false);

  const [creatorModeFeeds, setCreatorModeFeeds] = useState(null);
  const [creatorId, setCreatorId] = useState(null);
  const [isCreatorModeLoading, setIsCreatorModeLoading] = useState(false);

  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const feedsQueryKey = ["feeds", tokenRef.current || token, tagname || "all", feedCategory || "all"];

  const initialPageParam = {
    categoryPage: 1,
    allPage: 1,
    mode: feedCategory ? "category" : "all",
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

      if (param.mode === "category" && feedCategory) {
        return getAllFeeds(param.categoryPage, tokenRef.current || token, feedCategory);
      } else {
        return getAllFeeds(param.allPage, tokenRef.current || token, null);
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

      if (currentParam.mode === "category") {
        if (isFullBatch) {
          return { ...currentParam, categoryPage: currentParam.categoryPage + 1 };
        } else {
          // Category exhausted, switch to 'all' (mixed)
          return { ...currentParam, mode: "all", allPage: 1 };
        }
      } else {
        // mode === "all"
        if (isFullBatch) {
          return { ...currentParam, allPage: currentParam.allPage + 1 };
        } else {
          // 'all' exhausted, restart 'all' feeds again (Persistent Loop)
          return { ...currentParam, allPage: 1 };
        }
      }
    },
    enabled: !!(tokenRef.current || token),
    refetchOnWindowFocus: false,
  });

  const feeds = (() => {
    const flat = feedPages?.pages.flat() || [];
    const seen = new Set();
    return flat.filter((item) => {
      const id = item._id || item.feedId;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
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


  let mixed = feeds.map(f => ({ ...f, __kind: "feed" }));

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

  const isLoading = isFeedsLoading || isCreatorModeLoading;

  return (
    <div id="feedTop">
      <div className={`relative px-0 sm:px-4 md:px-6 py-5 max-w-[470px] mx-auto transition-all duration-300 ${showReels ? "bg-gray-50" : "bg-white"}`}>
        {isHashtagMode && (
          <div className="absolute mb-2 top-1 right-1 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <TagIcon fontSize="inherit" />
            {tagname}
          </div>
        )}
        {!isHashtagMode && (
          <>
            {/* <Stories />*/}
            <div className="sticky top-14 lg:top-0 z-40 bg-white/95 backdrop-blur-md p-2 mb-2 flex items-center flex-col border-b border-gray-100/50 sm:border-none">
              <CategoryFeedPage onSelectCategory={setFeedCategory} selectedCategoryId={feedCategory} />
            </div>
          </>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={feedCategory || tagname || "home"}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex items-center flex-col gap-5 w-full"
          >
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <FeedSkeleton key={i} />)
            ) : mixed.length > 0 ? (
              mixed.map((item, idx) => (
                <div
                  key={`${item.__kind}-${item._id || item.feedId || idx}`}
                  className="w-full"
                >
                  <PostcardWrapper
                    postData={item}
                    authUser={authUser}
                    token={tokenRef.current || token}
                    onHideFromUI={handleHideFromUI}
                    isVisible={true}
                  />
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">
                {feedsError ? "⚠️ Failed to load content." : "No content available."}
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {isFetchingNextPage && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
