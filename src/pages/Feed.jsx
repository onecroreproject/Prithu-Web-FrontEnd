/* Feed.jsx */
import React, { useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api/axios";

import Stories from "../components/Stories";
import Createpost from "../components/Createpost";
import Postcard from "../components/FeedPageComponent/Postcard";

const Feed = ({ authUser }) => {
  const { token } = useContext(AuthContext);
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  /* --------------------------------------------------------------
     Remove hidden post
  -------------------------------------------------------------- */
  const handleRemovepost = (feedId) => {
    setFeeds((prev) => prev.filter((f) => f.feedId !== feedId));
  };

  /* --------------------------------------------------------------
     Shuffle feeds
  -------------------------------------------------------------- */
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /* --------------------------------------------------------------
     Fetch feeds
  -------------------------------------------------------------- */
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
console.log("feeds",data)
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
          likedUser: feed.likedUser || [],
          comments: feed.comments || [],
          commentsCount: feed.commentsCount || 0,
        }));

        const processed = isLoadMore ? formatted : shuffleArray(formatted);

        if (isLoadMore) setFeeds((prev) => [...prev, ...processed]);
        else setFeeds(processed);

        setHasMore(formatted.length === 10);
        setPage(pageNum);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch feeds");
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [token]
  );

  /* --------------------------------------------------------------
     Initial load
  -------------------------------------------------------------- */
  useEffect(() => {
    if (token) fetchFeeds(1, false);
  }, [token, fetchFeeds]);

  /* --------------------------------------------------------------
     Infinite scroll
  -------------------------------------------------------------- */
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

  /* --------------------------------------------------------------
     Dummy stories (for now)
  -------------------------------------------------------------- */
  const dummyStories = Array(7)
    .fill()
    .map((_, i) => ({
      userName: `User ${i + 1}`,
      profileAvatar: null,
      hasStory: true,
      feedId: i,
    }));

  /* --------------------------------------------------------------
     Skeleton Loader
  -------------------------------------------------------------- */
  if (loading) {
    return (
      <div className="mx-auto px-2 py-5 max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-[300px] bg-gray-200 rounded-lg"></div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-6 animate-pulse">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-[300px] bg-gray-200 rounded-lg"></div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------
     Main Return
  -------------------------------------------------------------- */
  return (
    <div className="mx-auto px-2 py-5">
      {/* ---------- Stories ---------- */}
      <div className="w-full">
        <Stories feeds={dummyStories} />
      </div>

      {/* ---------- Create Post ---------- */}
      <div className="mt-4 mb-6 max-w-2xl">
        <Createpost authUser={authUser} token={token} />
      </div>

      {/* ---------- Feeds ---------- */}
      {error && <p className="text-center py-6 text-red-500">{error}</p>}

      <div className="flex flex-col gap-6">
        {feeds.length > 0 ? (
          feeds.map((feed,idx) => (
            <Postcard
              key={idx}
              postData={feed}
              authUser={authUser}
              token={token}
              onHidePost={handleRemovepost}
              onNotInterested={handleRemovepost}
            />
          ))
        ) : (
          !loading && (
            <p className="text-center text-gray-500">No feeds available.</p>
          )
        )}
      </div>

      {/* ---------- Load more spinner ---------- */}
      {isLoadingMore && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* ---------- End of feed ---------- */}
      {!hasMore && feeds.length > 0 && (
        <div className="text-center py-6 text-gray-500">
          You've reached the end of the feed
        </div>
      )}
    </div>
  );
};

export default Feed;
