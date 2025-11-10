// ✅ src/context/AuthContextComponents/useAutoLogin.js
import { useEffect } from "react";
import api from "../../api/axios";
import { getDeviceDetails } from "../../utils/getDeviceDetails";
import { connectSocket, disconnectSocket } from "../../webSocket/socket";

export const useAutoLogin = ({ setToken, setUser, setSessionId, navigate }) => {
  useEffect(() => {
    let isMounted = true;

    const autoLogin = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const deviceId = localStorage.getItem("deviceId");
      const sessionId = localStorage.getItem("sessionId");

      if (!refreshToken || !deviceId) return;

      const { os, browser, deviceType } = getDeviceDetails();

      try {
        const { data } = await api.post(
          "/api/refresh-token",
          {
            refreshToken,
            deviceId,
            os,
            browser,
            deviceType,
          },
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        if (!data?.accessToken) throw new Error("Session expired");

        // ✅ Store new access token
        localStorage.setItem("token", data.accessToken);
        setToken(data.accessToken);

        // ✅ Update sessionId if changed
        if (data.sessionId) {
          localStorage.setItem("sessionId", data.sessionId);
          setSessionId(data.sessionId);
        }

        // ✅ Fetch user profile (important for restoring context)
        const profileRes = await api.get("/api/get/profile/detail", {
          headers: { Authorization: `Bearer ${data.accessToken}` },
        });

        if (isMounted) setUser(profileRes.data.profile);

        // ✅ Reconnect socket
        const socket = connectSocket(data.accessToken, data.sessionId || sessionId);
        if (socket) console.log("✅ Socket reconnected on auto-login");

      } catch (err) {
        console.warn("⚠️ Session invalid or expired:", err.message);
        disconnectSocket();
        localStorage.clear();
        SwitchMode("/login");
      }
    };

    autoLogin();

    return () => {
      isMounted = false;
    };
  }, [navigate, setToken, setUser, setSessionId]);
};
