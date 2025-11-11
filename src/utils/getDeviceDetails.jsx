import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";

/**
 * 🔍 Get detailed device info + persistent deviceId (frontend)
 * Ensures stable UUID reuse across logins from the same device/browser.
 */
export const getDeviceDetails = () => {
  try {
    // 🌐 Handle SSR or restricted environments safely
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return {
        deviceId: uuidv4(),
        deviceType: "server",
        os: "Unknown OS",
        browser: "Unknown Browser",
        userAgent: "N/A",
      };
    }

    // ✅ Parse User Agent
    const parser = new UAParser(navigator.userAgent);
    const result = parser.getResult();

    const osName = result.os.name || "Unknown OS";
    const osVersion = result.os.version || "";
    const browserName = result.browser.name || "Unknown Browser";
    const browserVersion = result.browser.version || "";
    const deviceType = result.device.type || "desktop";

    // ✅ Get or Create Persistent Device ID
    let deviceId = null;
    try {
      deviceId = localStorage.getItem("deviceId");
      if (!deviceId) {
        deviceId = uuidv4();
        localStorage.setItem("deviceId", deviceId);
      }
    } catch (storageError) {
      console.warn("⚠️ localStorage unavailable, using temporary deviceId:", storageError);
      deviceId = uuidv4(); // fallback (won’t persist)
    }

    // ✅ Return clean structured info
    return {
      deviceId,
      deviceType,
      os: `${osName} ${osVersion}`.trim(),
      browser: `${browserName} ${browserVersion}`.trim(),
      userAgent: navigator.userAgent,
    };
  } catch (error) {
    console.error("❌ Error getting device details:", error);
    return {
      deviceId: uuidv4(),
      deviceType: "unknown",
      os: "Unknown OS",
      browser: "Unknown Browser",
      userAgent: "Unknown",
    };
  }
};
