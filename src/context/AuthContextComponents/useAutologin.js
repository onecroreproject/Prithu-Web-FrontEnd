import { useEffect } from "react";
import api from "../../api/axios";
import { getDeviceDetails } from "../../utils/getDeviceDetails";
import { connectSocket, disconnectSocket } from "../../webSocket/socket";

export const useAutoLogin = ({ setToken, setUser, setSessionId, navigate }) => {
  useEffect(() => {
    const autoLogin = async () => {
      const refreshToken = localStorage.getItem("refreshToken");
      const deviceId = localStorage.getItem("deviceId");
      const sessionId = localStorage.getItem("sessionId");

      if (!refreshToken || !deviceId) return;

      const { os, browser, deviceType } = getDeviceDetails();
      try {
        const { data } = await api.post("/api/refresh-token", {
          refreshToken,
          deviceId,
          os,
          browser,
          deviceType,
        });

        if (data?.accessToken) {
          localStorage.setItem("token", data.accessToken);
          setToken(data.accessToken);
          await connectSocket(data.accessToken, sessionId);
          console.log("✅ Session restored automatically.");
        } else {
          throw new Error("Session expired");
        }
      } catch {
        console.warn("⚠️ Session invalid, logging out.");
        disconnectSocket();
        localStorage.clear();
        SwitchMode("/login");
      }
    };

    autoLogin();
  }, []);
};
