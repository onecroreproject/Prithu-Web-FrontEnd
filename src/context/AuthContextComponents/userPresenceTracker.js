// ✅ src/context/AuthContextComponents/usePresenceTracker.js
import { useEffect, useRef } from "react";
import api from "../../api/axios";

export const usePresenceTracker = ({ token, sessionId, user }) => {
  const isOnlineRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!token || !sessionId || !user?._id) return;

    const markOnline = async () => {
      if (isOnlineRef.current) return; // prevent duplicate
      try {
        await api.post(
          "/api/user/session/presence",
          { sessionId, isOnline: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        isOnlineRef.current = true;
        console.log(`🟢 Marked online (API): ${user.userName}`);
      } catch (err) {
        console.error("❌ Error marking online:", err.message);
      }
    };

    const markOffline = async () => {
      if (!isOnlineRef.current) return;
      try {
        await api.post(
          "/api/user/session/presence",
          { sessionId, isOnline: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        isOnlineRef.current = false;
        console.log(`🔴 Marked offline (API): ${user.userName}`);
      } catch (err) {
        console.error("⚠️ Error marking offline:", err.message);
      }
    };

    const handleFocus = () => {
      clearTimeout(timeoutRef.current);
      markOnline();
    };

    const handleBlur = () => {
      timeoutRef.current = setTimeout(markOffline, 5000);
    };

    const handleBeforeUnload = () => {
      // 🧠 Use sendBeacon for reliable offline mark on tab close
      try {
        const payload = JSON.stringify({ sessionId, isOnline: false });
        navigator.sendBeacon(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/session/presence`,
          payload
        );
        console.log(`🟤 Beacon sent (offline): ${user.userName}`);
      } catch (err) {
        console.warn("⚠️ Beacon failed:", err.message);
      }
    };

    // Initial presence update
    markOnline();

    // Event listeners
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearTimeout(timeoutRef.current);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      markOffline();
    };
  }, [token, sessionId, user?._id]);
};
