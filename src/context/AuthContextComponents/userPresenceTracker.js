import { useEffect, useRef } from "react";
import axios from "axios";

export const usePresenceTracker = ({ token, sessionId, user, socket, refreshAccessToken }) => {
  const heartbeatIntervalRef = useRef(null);

  useEffect(() => {
    if (!token || !sessionId || !user?._id || !socket) return;

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // -----------------------------------------------------
    // 1️⃣ Heartbeat Sender (AXIOS)
    // -----------------------------------------------------
    const sendHeartbeat = async () => {
      try {
        const res = await axios.post(
          `${backendUrl}/api/session/heartbeat`,
          { sessionId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 200) {
          console.log("💓 Heartbeat OK");
        }

      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("⛔ Heartbeat unauthorized → refreshing token...");

          const newToken = await refreshAccessToken();

          if (newToken) {
            console.log("🔄 Retrying heartbeat with new token...");
            await axios.post(
              `${backendUrl}/api/session/heartbeat`,
              { sessionId },
              { headers: { Authorization: `Bearer ${newToken}` } }
            );
          } else {
            console.warn("❌ Token refresh failed — stopping heartbeat");
            stopHeartbeat();
          }
        } else {
          console.warn("Heartbeat error:", err.message);
        }
      }
    };

    // -----------------------------------------------------
    // 2️⃣ Start Heartbeat
    // -----------------------------------------------------
    const startHeartbeat = () => {
      if (heartbeatIntervalRef.current) return;

      heartbeatIntervalRef.current = setInterval(() => {
        if (socket.connected) {
          sendHeartbeat();
        }
      }, 30000);

      console.log("💓 Heartbeat started (every 30s)");
    };

    // -----------------------------------------------------
    // 3️⃣ Stop Heartbeat
    // -----------------------------------------------------
    const stopHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
        console.log("🛑 Heartbeat stopped");
      }
    };

    // -----------------------------------------------------
    // 4️⃣ Update presence (AXIOS)
    // -----------------------------------------------------
    const updatePresence = async (isOnline) => {
      try {
        await axios.post(
          `${backendUrl}/api/session/presence`,
          { sessionId, isOnline },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log(`📡 Presence updated → ${isOnline ? "Online" : "Offline"}`);

      } catch (err) {
        if (err.response?.status === 401) {
          console.warn("⛔ Presence unauthorized → refreshing token...");

          const newToken = await refreshAccessToken();

          if (newToken) {
            await axios.post(
              `${backendUrl}/api/session/presence`,
              { sessionId, isOnline },
              { headers: { Authorization: `Bearer ${newToken}` } }
            );
          }
        }
      }
    };

    // -----------------------------------------------------
    // 5️⃣ Visibility Change Logic
    // -----------------------------------------------------
    const handleVisibilityChange = () => {
      if (document.hidden) {
        updatePresence(false);
        stopHeartbeat();
      } else {
        updatePresence(true);
        startHeartbeat();
      }
    };

    // -----------------------------------------------------
    // 6️⃣ Socket Events
    // -----------------------------------------------------
    const handleConnect = () => {
      if (!document.hidden) startHeartbeat();
    };

    const handleDisconnect = () => {
      stopHeartbeat();
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start if already connected
    if (socket.connected && !document.hidden) {
      startHeartbeat();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopHeartbeat();
    };
  }, [token, sessionId, user?._id, socket]);
};
