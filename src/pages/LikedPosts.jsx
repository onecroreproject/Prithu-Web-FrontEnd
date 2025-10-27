import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import Postcard from "../components/Postcard";

const LikedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLikedFeeds = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("userToken"); // or from AuthContext if available
        if (!token) {
          setError("Authentication required");
          setLoading(false);
          return;
        }
        const res = await axios.get("/api/user/liked/feeds", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.count === 0) {
          setPosts([]);
          setLoading(false);
          return;
        }
        const formattedPosts = response.data.feeds.map((feed) => ({
          feedId: feed.feedId,
          type: feed.type || "image",
          contentUrl: feed.contentUrl || "",
          caption: feed.caption || "",
          _id: feed._id || "guest",
           userName: feed.userName || "Unknown",
          profileAvatar: feed.profileAvatar || "",
          timeAgo: feed.timeAgo || "", // Include timeAgo
          likesCount: feed.likesCount || 0,
          likedUser: feed.likedUser || [],
          comments: feed.comments || [],
          commentsCount: feed.commentsCount || 0,
        }));
        setPosts(formattedPosts);
      } catch (err) {
        console.error("Error fetching liked feeds:", err);
        setError("Failed to load liked feeds");
      } finally {
        setLoading(false);
      }
    };

    // Custom relative time function (since toRelativeTime isn't native)
    // Date.prototype.toRelativeTime = function () {
    //   const now = new Date();
    //   const diffMs = now - this;
    //   const diffSeconds = Math.floor(diffMs / 1000);
    //   const diffMinutes = Math.floor(diffSeconds / 60);
    //   const diffHours = Math.floor(diffMinutes / 60);
    //   const diffDays = Math.floor(diffHours / 24);

    //   if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    //   if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    //   if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    //   return "Just now";
    // };

    fetchLikedFeeds();
  }, []);

  if (loading) return <p className="p-6 text-center text-gray-500">Loading...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!posts.length) return <p className="p-6 text-center text-gray-500">No liked feeds yet.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {posts.map((post) => (
          <div
            key={post.feedId}
            className="relative w-full h-64 rounded-lg overflow-hidden cursor-pointer group"
          >
            <Postcard
              postData={post}
              authUser={{ _id: localStorage.getItem("userId") || "guestUser", userName: "You" }} // Mock authUser
              token={localStorage.getItem("userToken")} // Mock token
              onHidePost={(id) => setPosts(posts.filter(p => p.feedId !== id))} // Remove hidden post
              onNotInterested={(id) => setPosts(posts.filter(p => p.feedId !== id))} // Remove not interested post
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedPosts;