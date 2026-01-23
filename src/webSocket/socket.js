// ✅ Inside src/webSocket/socket.js
import { io } from "socket.io-client";

let socket = null;
let heartbeatInterval = null;
let isConnecting = false;


export const connectSocket = (token, sessionId) => {
  if (!token || !sessionId) {
    console.warn("⚠️ Missing token or sessionId. Socket not initialized.");
    return null;
  }

  if (socket && socket.connected) {
    console.log("⚠️ Socket already connected:", socket.id);
    return socket;
  }

  socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
    auth: { token, sessionId },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 2000,
    timeout: 20000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    startHeartbeat();
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("⚠️ Socket disconnected:", reason);
    stopHeartbeat();
  });

  socket.on("reconnect", () => {
    console.log("🔁 Socket reconnected");
    startHeartbeat();
  });

  // ✅ REAL-TIME NOTIFICATION LISTENER
  socket.on("newNotification", (notification) => {
    console.log("📬 [SOCKET] New Notification received:", notification);

    // ✅ Dispatch event to frontend (so Header can catch it)
    const event = new CustomEvent("socket:newNotification", { detail: notification });
    document.dispatchEvent(event);
  });

  // ✅ Optional: log read confirmations
  socket.on("notificationRead", ({ userId }) => {
    console.log("📨 [SOCKET] Notifications marked as read by:", userId);
    const event = new CustomEvent("socket:notificationRead", { detail: { userId } });
    document.dispatchEvent(event);
  });

  return socket;
};

const startHeartbeat = () => {
  stopHeartbeat();
  heartbeatInterval = setInterval(() => {
    if (socket && socket.connected) {
      socket.emit("heartbeat");
      // console.log("💓 Heartbeat sent");
    }
  }, 30000);
};

const stopHeartbeat = () => {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    stopHeartbeat();
    socket.disconnect();
    console.log("🔌 Socket disconnected manually");
    socket = null;
  }
};
