// src/hooks/useHeartbeat.js
import { useEffect } from "react";
import api from "../api/axios";

const useHeartbeat = (sessionId) => {
  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      try {
        await api.post("/api/refresh-token", { sessionId });
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId]);
};

export default useHeartbeat;
