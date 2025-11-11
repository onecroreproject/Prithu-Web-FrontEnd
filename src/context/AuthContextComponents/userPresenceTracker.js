// ✅ src/context/AuthContextComponents/usePresenceTracker.js
import { useEffect, useRef } from "react";

export const usePresenceTracker = ({ token, sessionId, user, socket }) => {
  const isOnlineRef = useRef(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!token || !sessionId || !user?._id || !socket) return;

    const markOnline = () => {
      if (isOnlineRef.current) return; // prevent duplicate
      socket.emit("userOnline", { userId: user._id });
      isOnlineRef.current = true;
      console.log(`🟢 Marked online (Socket): ${user.userName}`);
    };

    const markOffline = () => {
      if (!isOnlineRef.current) return;
      socket.emit("userOffline", { userId: user._id });
      isOnlineRef.current = false;
      console.log(`🔴 Marked offline (Socket): ${user.userName}`);
    };

    const handleFocus = () => {
      clearTimeout(timeoutRef.current);
      markOnline();
    };

    const handleBlur = () => {
      timeoutRef.current = setTimeout(markOffline, 5000);
    };

    const handleBeforeUnload = () => {
      // Emit offline on tab close
      socket.emit("userOffline", { userId: user._id });
      console.log(`🟤 Offline emitted on unload: ${user.userName}`);
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
  }, [token, sessionId, user?._id, socket]);
};
