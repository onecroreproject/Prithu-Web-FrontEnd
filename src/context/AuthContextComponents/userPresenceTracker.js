// ✅ src/context/AuthContextComponents/usePresenceTracker.js
import { useEffect, useRef } from "react";

export const usePresenceTracker = ({ token, sessionId, user, socket }) => {
  const heartbeatIntervalRef = useRef(null);

  useEffect(() => {
    console.log(`🔄 usePresenceTracker hook initialized for user: ${user?.userName || 'undefined'}`);
    console.log(`📡 Integrated into the AuthContext via usePresenceTracker hook`);

    if (!token || !sessionId || !user || !user._id || !socket) {
      console.log(`⚠️ usePresenceTracker: Missing required parameters (token: ${!!token}, sessionId: ${!!sessionId}, user: ${!!user}, user._id: ${user?._id}, socket: ${!!socket}), skipping initialization`);
      return;
    }

    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    console.log(`🌐 Backend URL: ${backendUrl}`);

    // Function to update presence via API
    const updatePresence = async (isOnline) => {
      console.log(`📡 Calling updatePresence(${isOnline}) for user: ${user.userName}`);
      try {
        const response = await fetch(`${backendUrl}/api/user/session/presence`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ sessionId, isOnline })
        });
        if (!response.ok) {
          console.warn('Presence update failed:', response.status);
        } else {
          console.log(`✅ Presence updated successfully: ${isOnline ? 'Online' : 'Offline'}`);
        }
      } catch (err) {
        console.warn('Presence update error:', err.message);
      }
    };

    // Start heartbeat when socket connects
    const startHeartbeat = () => {
      console.log(`🔄 startHeartbeat called for user: ${user.userName}`);
      if (heartbeatIntervalRef.current) {
        console.log(`⚠️ Heartbeat already running for ${user.userName}, skipping duplicate start`);
        return; // prevent duplicate
      }

      heartbeatIntervalRef.current = setInterval(() => {
        if (socket && socket.connected) {
          console.log(`💓 Sending heartbeat for ${user.userName}`);
          // Send heartbeat to backend to update presence
          fetch(`${backendUrl}/api/heartbeat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId })
          }).catch(err => console.warn('Heartbeat failed:', err.message));
        } else {
          console.log(`⚠️ Socket not connected, skipping heartbeat for ${user.userName}`);
        }
      }, 30000); // Every 30 seconds

      console.log(`💓 Heartbeat started for ${user.userName} (interval: 30s)`);
    };

    // Stop heartbeat
    const stopHeartbeat = () => {
      console.log(`🔄 stopHeartbeat called for user: ${user.userName}`);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        heartbeatIntervalRef.current = null;
        console.log(`🛑 Heartbeat stopped for ${user.userName}`);
      } else {
        console.log(`⚠️ No heartbeat to stop for ${user.userName}`);
      }
    };

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      console.log(`🔄 visibilitychange event triggered for user: ${user.userName}`);
      console.log(`📊 document.hidden: ${document.hidden}, document.visibilityState: ${document.visibilityState}`);

      if (document.hidden) {
        // Tab is hidden - mark offline
        console.log(`👁️ Tab hidden - marking ${user.userName} offline`);
        console.log(`📡 Calling updatePresence(false) and stopping heartbeat`);
        updatePresence(false);
        stopHeartbeat();
      } else {
        // Tab is visible - mark online
        console.log(`👁️ Tab visible - marking ${user.userName} online`);
        console.log(`📡 Calling updatePresence(true) and starting heartbeat`);
        updatePresence(true);
        startHeartbeat();
      }
    };

    // Listen for socket connection status
    const handleConnect = () => {
      console.log(`🟢 Socket connected - starting presence tracking for ${user.userName}`);
      // Only start heartbeat if tab is visible
      if (!document.hidden) {
        startHeartbeat();
      }
    };

    const handleDisconnect = () => {
      console.log(`🔴 Socket disconnected - stopping presence tracking for ${user.userName}`);
      stopHeartbeat();
    };

    // Set up listeners
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // If already connected, start heartbeat if tab is visible
    if (socket.connected && !document.hidden) {
      startHeartbeat();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopHeartbeat();
    };
  }, [token, sessionId, user?._id, socket]);
};
