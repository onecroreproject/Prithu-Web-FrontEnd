import { v4 as uuidv4 } from "uuid";
import { UAParser } from "ua-parser-js";


/**
 * 🔍 Get detailed device info + persistent deviceId
 */
export const getDeviceDetails = () => {
  // Parse user agent
  const parser = new UAParser();
  const result = parser.getResult();

  // OS details (Windows, Android, iOS, etc.)
  const osName = result.os.name || "Unknown OS";
  const osVersion = result.os.version || "Unknown Version";

  // Browser details
  const browserName = result.browser.name || "Unknown Browser";
  const browserVersion = result.browser.version || "Unknown Version";

  // Device type (mobile / tablet / desktop)
  const deviceType = result.device.type || "desktop";

  // ✅ Persistent unique device ID (stored locally)
  let deviceId = localStorage.getItem("deviceId");
  if (!deviceId) {
    deviceId = uuidv4();
    localStorage.setItem("deviceId", deviceId);
  }

  // Build info object
  return {
    deviceId,
    deviceType,
    os: `${osName} ${osVersion}`,
    browser: `${browserName} ${browserVersion}`,
    userAgent: navigator.userAgent,
  };
};
