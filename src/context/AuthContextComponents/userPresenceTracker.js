import { useEffect } from "react";
import api from "../../api/axios";

export const usePresenceTracker = ({ token, sessionId, user }) => {
  useEffect(() => {
    if (!token || !sessionId || !user?._id) return;

    const handleOnline = async () => {
      await api.post("/api/user/session/presence", { sessionId, isOnline: true });
    };

    const handleOffline = async () => {
      await api.post("/api/user/session/presence", { sessionId, isOnline: false });
    };

    window.addEventListener("focus", handleOnline);
    window.addEventListener("blur", handleOffline);
    window.addEventListener("beforeunload", handleOffline);

    handleOnline(); // Mark online on mount

    return () => {
      window.removeEventListener("focus", handleOnline);
      window.removeEventListener("blur", handleOffline);
      window.removeEventListener("beforeunload", handleOffline);
      handleOffline();
    };
  }, [token, sessionId, user?._id]);
};
