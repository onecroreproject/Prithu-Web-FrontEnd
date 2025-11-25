// ✅ src/services/feedService.js
import api from "../api/axios";
import defaultAvatar from "../assets/user.png";

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

    return data.feeds.map((feed) => {


      return {
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

        // ✅ If no profile image → use default avatar
        profileAvatar:
          feed.profileAvatar && feed.profileAvatar.trim() !== ""
            ? feed.profileAvatar
            : defaultAvatar,

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
      };
    });

  } catch (error) {
    console.error("❌ Error fetching feeds:", error.response?.data || error.message);
    return [];
  }
};

/**
 * ✅ Fetch a specific feed by ID
 * - Used when navigating from notifications to ensure the feed is loaded
 */
export const getSingleFeed = async (feedId, token) => {
  try {
    const { data } = await api.get(`/api/get/single/feed/${feedId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    return data.feed;
  } catch (err) {
    console.error("❌ Single feed fetch error:", err.response?.data || err);
    return null;
  }
};



export const getFeedsByCreator = async (feedId, token) => {
  try {
    const { data } = await api.get(`/api/get/feeds/by/creator/${feedId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!data?.feeds || !Array.isArray(data.feeds)) return [];

    return data.feeds.map((feed) => {
      return {
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
          feed.profileAvatar && feed.profileAvatar.trim() !== ""
            ? feed.profileAvatar
            : defaultAvatar,

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
            feed.gradient ||
            "linear-gradient(135deg, #262e39, #6e7782, #a7373a)",
          text: feed.text || "#FFFFFF",
        },
      };
    });
  } catch (err) {
    console.error("❌ Error fetching creator feeds:", err.response?.data || err);
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



export const getFeedsByHashtag = async (tagname, page = 1, token) => {
  try {
    const cleaned = tagname.replace(/^#+/, "").trim(); // remove "#"

    const res = await api.get(
      `/api/get/feeds/by/hashtag/${cleaned}?page=${page}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = res.data;

    if (!data?.feeds || !Array.isArray(data.feeds)) return [];

    // Map to unified frontend format
    return data.feeds.map((feed) => ({
      feedId: feed.feedId || feed._id || "",
      _id: feed._id || "",
      userId: feed.createdByAccount || "",

      type: feed.type || "image",
      contentUrl: feed.contentUrl || "",
      caption: feed.caption || "",
      description: feed.dec || "",
      category: feed.category || "",
      language: feed.language || "",

      userName: feed.userName || "Unknown",

      profileAvatar:
        feed.profileAvatar && feed.profileAvatar.trim() !== ""
          ? feed.profileAvatar
          : defaultAvatar,

      avatarToUse:
        feed.modifyAvatarFromProfile ||
        feed.profileAvatar ||
        defaultAvatar,

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

      hashtags: feed.hashtags || [],

      themeColor: feed.themeColor || {
        primary: "#262e39",
        secondary: "#6e7782",
        accent: "#a7373a",
        gradient: "linear-gradient(135deg, #262e39, #6e7782, #a7373a)",
        text: "#FFFFFF",
      },
    }));
  } catch (err) {
    console.error(
      "❌ Error fetching hashtag feeds:",
      err?.response?.data || err.message
    );
    return [];
  }
};

/**
 * Calls API to increment image view count for given feedId
 */
export const userImageViewCount = async (feedId, token) => {
  try {
    const { data } = await api.post(
      '/user/image/view/count',
      { feedId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    console.error('❌ Error recording image view count:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Calls API to increment video view count for given feedId
 */
export const userVideoViewCount = async (feedId, token) => {
  try {
    const { data } = await api.post(
      '/user/watching/vidoes',
      { feedId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  } catch (error) {
    console.error('❌ Error recording video view count:', error.response?.data || error.message);
    throw error;
  }
};


