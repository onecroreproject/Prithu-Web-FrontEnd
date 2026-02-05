import api from "../api/axios";
import { getDeviceDetails } from "../utils/getDeviceDetails";

// ⭐ Prevents duplicate same-user same-feed view counts in the same browser session:
const viewedImages = new Set();
const viewedVideos = new Set();

/**
 * ⭐ IMAGE VIEW
 * Triggered after visibility threshold is met
 */
export const userImageViewCount = async (feedId) => {
  if (viewedImages.has(feedId)) return "already-recorded";

  try {
    const { deviceId } = getDeviceDetails();

    // Log for debugging
    console.log(`🟢 Recording image view → feedId: ${feedId}, deviceId: ${deviceId}`);

    const response = await api.post("/api/user/image/view/count", {
      feedId,
      deviceId
    });

    viewedImages.add(feedId);
    return response.data?.isNewView ? "recorded" : "already-exists";
  } catch (error) {
    console.error(`❌ Image view recording failed:`, error);
    return "failed";
  }
};

/**
 * ⭐ VIDEO FULL WATCH
 * Triggered after "ended" event or specific watch-time threshold
 */
export const userVideoViewCount = async (feedId) => {
  if (viewedVideos.has(feedId)) return "already-recorded";

  try {
    const { deviceId } = getDeviceDetails();

    console.log(`🟢 Recording video full-watch → feedId: ${feedId}, deviceId: ${deviceId}`);

    const response = await api.post("/api/user/watching/vidoes", {
      feedId,
      deviceId
    });

    viewedVideos.add(feedId);
    return response.data?.isNewView ? "recorded" : "already-exists";
  } catch (error) {
    console.error(`❌ Video view recording failed:`, error);
    return "failed";
  }
};

