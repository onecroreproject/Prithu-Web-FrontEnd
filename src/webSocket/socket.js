// src/utils/socket.js
import { io } from "socket.io-client";

let socket = null;
let heartbeatInterval = null;

/**
 * 🔗 Initialize Socket Connection
 * @param {string} token - JWT Access Token
 * @param {string} sessionId - Active Session ID from backend
 */
export const connectSocket = (token,sessionId) => {
  if (!token || !sessionId) {
    console.warn("⚠️ Missing token or sessionId. Socket not initialized.");
    return null;
  }

  // 🧠 Avoid duplicate connections
  if (socket && socket.connected) {
    console.log("⚠️ Socket already connected.");
    return socket;
  }

  // 🌐 Connect to backend WebSocket
  socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
    auth: { token, sessionId },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    timeout: 20000,
  });

  /**
   * ✅ Connection Events
   */
  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);

    // Start heartbeat to maintain session activity
    startHeartbeat();
  });

  socket.on("connect_error", (error) => {
    console.error("⚠️ Socket connection error:", error.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("❌ Socket disconnected:", reason);
    stopHeartbeat(); // stop heartbeats when disconnected
  });

  socket.on("reconnect_attempt", (attempt) => {
    console.log(`🔄 Reconnecting... Attempt ${attempt}`);
  });

  socket.on("reconnect", (attemptNumber) => {
    console.log(`🔁 Reconnected successfully after ${attemptNumber} attempts`);
    startHeartbeat(); // restart heartbeats
  });

  /**
   * 🔊 Real-time Events
   */
  socket.on("userOnline", ({ userId }) => {
    console.log("🟢 User online:", userId);
  });

  socket.on("userOffline", ({ userId }) => {
    console.log("🔴 User offline:", userId);
  });

  socket.on("newNotification", (notification) => {
    console.log("📩 New Notification:", notification);
  });

  socket.on("notificationRead", ({ userId }) => {
    console.log("📨 Notifications marked as read by:", userId);
  });

  return socket;
};

/**
 * 💓 Start Heartbeat Interval
 * Keeps user session marked as online in backend
 */
const startHeartbeat = () => {
  stopHeartbeat(); // clear old interval if exists

  heartbeatInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit("heartbeat");
      // console.log("💓 Heartbeat sent");
    }
  }, 30000); // every 30 seconds
};

/**
 * 🧹 Stop Heartbeat Interval
 */
const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

/**
 * ✅ Return current socket instance
 */
export const getSocket = () => socket;

/**
 * ❌ Manually disconnect socket (on logout or tab close)
 */
export const disconnectSocket = () => {
  if (socket) {
    stopHeartbeat();
    socket.disconnect();
    console.log("🔌 Socket disconnected manually");
    socket = null;
  }
};

/**
 * 🔁 Handle Token Refresh (optional)
 * Called when token is updated in the app
 */
export const handleTokenRefresh = async (newToken) => {
  if (socket && socket.connected) {
    console.log("🔑 Updating socket token...");
    socket.auth.token = newToken;
    socket.disconnect().connect(); // reconnect with new token
  }
};
