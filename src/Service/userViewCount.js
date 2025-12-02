import api from "../api/axios";

// ⭐ Prevents duplicate same-user same-feed view counts:
const viewedImages = new Set();
const viewedVideos = new Set();

// ⭐ IMAGE VIEW
export const userImageViewCount = async (feedId) => {
  if (viewedImages.has(feedId)) {
    // console.log(`🟡 Image view already recorded → feedId: ${feedId}`);
    return "already-recorded";
  }

  // console.log(`🟢 Recording image view → feedId: ${feedId}`);
  await api.post("/api/user/image/view/count", { feedId });

  viewedImages.add(feedId);
  return "recorded";
};

// ⭐ VIDEO FULL WATCH
export const userVideoViewCount = async (feedId) => {
  if (viewedVideos.has(feedId)) {
    // console.log(`🟡 Video view already recorded → feedId: ${feedId}`);
    return "already-recorded";
  }

  // console.log(`🟢 Recording video full-watch → feedId: ${feedId}`);
  await api.post("/api/user/watching/vidoes", { feedId });

  viewedVideos.add(feedId);
  return "recorded";
};

