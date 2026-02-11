import api from "../api/axios";

import { getMediaUrl } from "../utils/urlHelper";

const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export const getAllFeeds = async (page = 1, token, categoryId = null, postType = null) => {
  try {
    const { data } = await api.get(
      `/api/get/all/feeds/user?page=${page}&limit=10${categoryId ? `&categoryId=${categoryId}` : ""}${postType ? `&postType=${postType}` : ""}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );


    console.log("API RAW DATA:", data);

    const feedsArray = data?.data?.feeds;
    const viewer = data?.data?.viewer || null;

    if (!feedsArray || !Array.isArray(feedsArray)) {
      console.warn("⚠️ No feeds found or invalid response structure");
      return [];
    }

    // ✅ Viewer Social Links
    const viewerSocialLinks = Array.isArray(viewer?.socialLinks)
      ? viewer.socialLinks.map(l => ({ ...l, visible: true }))
      : viewer?.socialLinks && typeof viewer.socialLinks === "object"
        ? Object.entries(viewer.socialLinks)
          .filter(([_, url]) => url)
          .map(([platform, url]) => ({
            platform,
            url,
            visible: true,
          }))
        : [];

    return feedsArray.map((feed) => {
      const creator = feed.creatorData || feed.creatorInfo || feed.creator || feed.postedBy || {};
      const stats = feed.stats || {};
      const userInteractions = feed.userInteractions || {};

      const designMetadata = feed.designMetadata || {};
      const designState = feed.designState || {};

      // ✅ Overlays Normalization
      const rawElements = designMetadata.overlayElements || designState.elements || [];
      const overlayElements = rawElements.map(el => ({
        ...el,
        x: Number(el.xPercent ?? el.x ?? 0),
        y: Number(el.yPercent ?? el.y ?? 0),
        w: Number(el.wPercent ?? el.w ?? 20),
        h: Number(el.hPercent ?? el.h ?? 20),
        animDir: el.animation?.direction || el.animDir || null,
        animSpeed: el.animation?.speed || el.animSpeed || 1,
        animEnabled: el.animation?.enabled ?? el.animEnabled ?? false,
      }));

      // ✅ Theme Normalization
      const themeColor =
        feed.themeColor ||
        designState.themeColors ||
        designMetadata.theme ||
        { primary: "#2563eb", secondary: "#1e40af", accent: "#ffffff", text: "#000000" };

      // ✅ Files
      const files = feed.files || [];
      const primaryFile = files[0] || {};
      const fileDimensions = feed.dimensions || primaryFile.dimensions || {};

      // ✅ Audio
      const rawAudio = designState.audioConfig || designMetadata.audioConfig || {};
      const audioConfig = {
        ...rawAudio,
        audioFile: rawAudio.audioFile || getMediaUrl(rawAudio.audioFileId),
        enabled: Boolean(rawAudio.enabled),
      };

      // ✅ Footer Resilience
      const footerSrc = feed.footerDisplay || designState.footer || designMetadata.footerConfig || {};
      const isFooterEnabled = Boolean(footerSrc.enabled || footerSrc.visible || feed.hasFooter);

      // ✅ EditMetadata for crop and filters
      const editMetadata = feed.editMetadata || designMetadata.editMetadata || {};
      const footerIcons = (footerSrc.socialIcons || []).length > 0
        ? footerSrc.socialIcons
        : viewerSocialLinks.map((i) => ({
          platform: i.platform,
          visible: true,
          urlTemplate: i.url, // ✅ convert url -> urlTemplate
        }));
      return {
        ...feed, // Keep all raw keys

        feedId: feed.feedId || feed._id || "",
        _id: feed.feedId || feed._id || "",
        type: feed.type || feed.postType || "image",
        contentUrl: getMediaUrl(feed.contentUrl || feed.mediaUrl || primaryFile.url),
        thumbnailUrl: getMediaUrl(feed.thumbnailUrl || feed.contentUrl || feed.mediaUrl || primaryFile.url),
        caption: feed.caption || feed.dec || "",
        description: feed.dec || feed.description || "",

        postedBy: {
          id: creator._id || creator.id || feed.createdByAccount || null,
          name: creator.userName || creator.name || creator.displayName || "Unknown",
          avatar: getMediaUrl(creator.profileAvatar || creator.avatar || defaultAvatar),
          modifyAvatar: getMediaUrl(creator.modifyAvatar),
          role: creator.role || feed.roleRef || "User",
        },

        viewer: {
          id: viewer?.id || viewer?._id || null,
          name: viewer?.name || "User",
          userName: viewer?.userName || "user",
          email: viewer?.email || "",
          phoneNumber: viewer?.phoneNumber || "",
          profileAvatar: getMediaUrl(viewer?.profileAvatar || defaultAvatar),
          modifyAvatar: getMediaUrl(viewer?.modifyAvatar),
          socialLinks: viewerSocialLinks,
        },

        // ✅ STATS
        likesCount: stats.likes || feed.likesCount || 0,
        commentsCount: stats.comments || feed.commentsCount || 0,
        viewsCount: stats.views || feed.viewsCount || 0,
        shareCount: stats.shares || feed.shareCount || 0,

        isLiked: Boolean(userInteractions.isLiked || feed.isLiked),
        isSaved: Boolean(userInteractions.isSaved || feed.isSaved),
        isFollowing: Boolean(userInteractions.isFollowing || feed.isFollowing),

        // ✅ LAYOUT - Prioritize editMetadata crop ratio
        aspectRatio: (() => {
          let ratio = editMetadata?.crop?.ratio ||
            feed.designState?.mediaDimensions?.aspectRatio ||
            feed.designMetadata?.canvasSettings?.aspectRatio ||
            (fileDimensions.ratio ? `${fileDimensions.ratio}:1` : "1:1");

          if (ratio === "original") {
            ratio = feed.designMetadata?.canvasSettings?.aspectRatio || "1:1";
          }
          return ratio;
        })(),

        overlayElements,
        hasFooter: isFooterEnabled,



        footerDisplay: {
          ...footerSrc,
          socialIcons: footerIcons,
        },

        themeColor,
        primary: themeColor.primary || themeColor.primaryColor || "#262e39",
        textColor: themeColor.text || themeColor.textColor || "#FFFFFF",

        uploadMode: feed.uploadMode || (isTemplateMode(feed) ? "template" : "normal"),
        designMetadata: { ...designMetadata, audioConfig, overlayElements },
        designState: { ...designState, audioConfig, elements: overlayElements }
      };
    });
  } catch (error) {
    console.error("❌ Error fetching feeds:", error.response?.data || error.message);
    return [];
  }
};

const isTemplateMode = (feed) => {
  return (
    feed.uploadMode === "template" ||
    feed.designMetadata?.isTemplate ||
    feed.designState?.elements?.length > 0 ||
    feed.designMetadata?.overlayElements?.length > 0
  );
};

export const getSingleFeed = async (id, token) => {
  console.log(id)
  try {
    const { data } = await api.get(`/api/get/feed/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return data.data;
  } catch (error) {
    return null;
  }
};

export const getTrendingFeeds = async (page = 1, token, postType = null) => {
  try {
    const url = `/api/get/trending/feeds?page=${page}&limit=10${postType ? `&postType=${postType}` : ""}`;
    console.log(`📡 Fetching trending: ${url}`);
    const { data } = await api.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log("🎯 Trending Response:", data);
    return data?.data?.feeds || data?.data || [];
  } catch (error) {
    console.error("❌ Error fetching trending feeds:", error.response?.status, error.response?.data || error.message);
    return [];
  }
};

export const getTopRankedJobs = async (token) => { return []; };
export const getFeedsByHashtag = async (tag, page, token) => { return []; };
export const userImageViewCount = async (id) => { return api.post(`/api/feed/view/image/${id}`); };
export const userVideoViewCount = async (id) => { return api.post(`/api/feed/view/video/${id}`); };
