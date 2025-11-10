// ✅ src/services/feedService.js
import api from "../api/axios";

/**
 * ✅ Fetch all user feeds (with pagination)
 * - Maps backend feed data to frontend format
 * - Adds null safety and consistent field naming
 */
export const getAllFeeds = async (page = 1, token) => {
  try {
    const { data } = await api.get(
      `/api/get/all/feeds/user?page=${page}&limit=10`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("🧠 Feeds API Response:", data);

    if (!data?.feeds || !Array.isArray(data.feeds)) return [];

    return data.feeds.map((feed) => ({
      feedId: feed.feedId || feed._id || "",
      userId: feed.createdByAccount || "",
      type: feed.type || "image",
      contentUrl: feed.contentUrl || "",
      caption: feed.caption || "",
      description: feed.dec || "",
      category: feed.category || "",
      language: feed.language || "",
      avatarToUse: feed.avatarToUse || "",
      _id: feed._id || "",
      userName: feed.userName || "Unknown",
      profileAvatar:
        feed.profileAvatar ||
        feed.avatarToUse ||
        "https://i.pravatar.cc/150?u=" + (feed._id || Math.random()),
      timeAgo: feed.timeAgo || "",
      likesCount: feed.likesCount || 0,
      commentsCount: feed.commentsCount || 0,
      viewsCount: feed.viewsCount || 0,
      shareCount: feed.shareCount || 0,
      downloadsCount: feed.downloadsCount || 0,
      dislikesCount: feed.dislikesCount || 0,
      isLiked: feed.isLiked || false,
      isSaved: feed.isSaved || false,
      isFollowing: feed.isFollowing || false,
      isDisliked: feed.isDisliked || false,
      themeColor: feed.themeColor || {
        primary: feed.primary || "#262e39",
        secondary: feed.secondary || "#6e7782",
        accent: feed.accent || "#a7373a",
        gradient:
          feed.gradient || "linear-gradient(135deg, #262e39, #6e7782, #a7373a)",
        text: feed.text || "#FFFFFF",
      },
    }));
  } catch (error) {
    console.error("❌ Error fetching feeds:", error.response?.data || error.message);
    return [];
  }
};

/**
 * ✅ Fetch top-ranked jobs
 */
export const getTopRankedJobs = async (token) => {
  try {
    const { data } = await api.get("/job/top/ranked/jobs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(data.jobs) ? data.jobs : [];
  } catch (error) {
    console.error("❌ Error fetching top-ranked jobs:", error);
    return [];
  }
};
