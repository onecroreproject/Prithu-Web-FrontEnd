// ✅ src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

import { getDeviceDetails } from "../utils/getDeviceDetails";
import { connectSocket, disconnectSocket } from "../webSocket/socket";

import { useAutoLogin } from "./AuthContextComponents/useAutologin";
import { usePresenceTracker } from "./AuthContextComponents/userPresenceTracker";

// -----------------------------------------------------------------------------
// 🌍 Create Context
// -----------------------------------------------------------------------------
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ---------------------------------------------------------------------------
  // 🧩 Core States
  // ---------------------------------------------------------------------------
  const [loading, setLoading] = useState(false);

  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(
    localStorage.getItem("refreshToken") || null
  );

  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(
    localStorage.getItem("sessionId") || null
  );

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [socketConnected, setSocketConnected] = useState(false);
  const [socket, setSocket] = useState(null);

  const [resetEmail, setResetEmail] = useState(null);
  // ---------------------------------------------------------------------------
  // 👤 Normalize User (_id / userId compatibility)
  // ---------------------------------------------------------------------------
  const normalizedUser = user
    ? { ...user, _id: user._id || user.userId }
    : null;


    // -----------------------------------------------------------
// 🔄 Refresh Access Token (Used by AutoLogin + PresenceTracker)
// -----------------------------------------------------------
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const deviceId = localStorage.getItem("deviceId");
      const storedSessionId = localStorage.getItem("sessionId");

      if (!refreshToken || !deviceId) return null;

      const { data } = await api.post("/api/refresh-token", {
        refreshToken,
        deviceId,
        sessionId: storedSessionId,
      });

      if (data?.accessToken) {
        localStorage.setItem("token", data.accessToken);
        setToken(data.accessToken);

        if (data.sessionId) {
          localStorage.setItem("sessionId", data.sessionId);
          setSessionId(data.sessionId);
        }

        return data.accessToken;
      }

      return null;
    } catch (err) {
      console.warn("⚠️ refreshAccessToken failed:", err.message);
      return null;
    }
  };


  // ---------------------------------------------------------------------------
  // 🚀 AutoLogin Hook
  // ---------------------------------------------------------------------------
    useAutoLogin({ setToken, setUser, setSessionId, navigate });

  // ---------------------------------------------------------------------------
  // ❤️ Presence Tracker (Runs *only after* socket + user + session ready)
  // ❗ React-safe: top-level conditional hook call
  // ---------------------------------------------------------------------------
  usePresenceTracker({
    token,
    sessionId,
    user: normalizedUser,
    socket,
    refreshAccessToken,
  });

  // ---------------------------------------------------------------------------
  // ⚡ SOCKET CONNECTION HANDLING
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!token || !sessionId || !normalizedUser?._id) return;

    const newSocket = connectSocket(token, sessionId);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("🟢 SOCKET CONNECTED:", newSocket.id);
      setSocketConnected(true);
      newSocket.emit("userOnline", { userId: normalizedUser._id });
    });

    newSocket.on("disconnect", () => {
      console.warn("🔴 SOCKET DISCONNECTED");
      setSocketConnected(false);
      newSocket.emit("userOffline", { userId: normalizedUser._id });
    });

    newSocket.on("userOnline", ({ userId }) =>
      setOnlineUsers((prev) => new Set([...prev, userId]))
    );

    newSocket.on("userOffline", ({ userId }) =>
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      })
    );

    return () => {
      newSocket.emit("userOffline", { userId: normalizedUser?._id });
      disconnectSocket();
      setSocket(null);
      setSocketConnected(false);
    };
  }, [token, sessionId, normalizedUser?._id]);

  // ---------------------------------------------------------------------------
  // 🔐 REGISTER
  // ---------------------------------------------------------------------------
  const register = async (payload) => {
    setLoading(true);
    try {
      await api.post("/api/auth/user/register", payload);

      toast.success("🎉 Account created successfully!");

      const redirectPath = new URLSearchParams(window.location.search).get("redirect");

      navigate(
        redirectPath
          ? `/login?redirect=${encodeURIComponent(redirectPath)}`
          : "/login"
      );

      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 🔐 LOGIN
  // ---------------------------------------------------------------------------
  const login = async ({ identifier, password }) => {
    setLoading(true);
    try {
      let storedDeviceId = localStorage.getItem("deviceId");
      const deviceDetails = getDeviceDetails();

      if (!storedDeviceId) {
        storedDeviceId = deviceDetails.deviceId;
        localStorage.setItem("deviceId", storedDeviceId);
      }

      const existingSessionId = localStorage.getItem("sessionId");

      const payload = {
        identifier,
        password,
        deviceId: storedDeviceId,
        deviceType: deviceDetails.deviceType,
        os: deviceDetails.os,
        browser: deviceDetails.browser,
        sessionId: existingSessionId || null,
      };

      const { data } = await api.post("/api/auth/user/login", payload);

      const { accessToken, refreshToken, sessionId: newSessionId, userId } = data;

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("sessionId", newSessionId);
      localStorage.setItem("userId", userId);

      setToken(accessToken);
      setRefreshToken(refreshToken);
      setSessionId(newSessionId);

      await fetchUserProfile(accessToken);

      const redirectParam = new URLSearchParams(window.location.search).get("redirect");

      navigate(redirectParam ? decodeURIComponent(redirectParam) : "/", { replace: true });

      return true;

    } catch (err) {
      console.error("Login Error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 👤 FETCH USER PROFILE
  // ---------------------------------------------------------------------------
  const fetchUserProfile = useCallback(
    async () => {
      try {
        const res = await api.get("/api/get/profile/detail");
        setUser(res.data.profile);
      } catch (err) {
        console.warn("❌ Failed to fetch profile:", err.message);
      }
    },
    [token]
  );

  // ---------------------------------------------------------------------------
  // 🔐 OTP & PASSWORD RESET FLOWS
  // ---------------------------------------------------------------------------
  const sendOtpForReset = async (email) => {
    try {
      const res = await api.post("/api/auth/user/otp-send", { email });
      toast.success(res.data.message || "OTP sent successfully");
      setResetEmail(email);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to send OTP ❌");
      return false;
    }
  };

  const verifyOtpForNewUser = async ({ email, otp }) => {
    try {
      const res = await api.post("/api/auth/new/user/verify-otp", { email, otp });
      toast.success(res.data.message || "OTP verified successfully");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP ❌");
      return false;
    }
  };

  const verifyOtpForReset = async ({ otp }) => {
    try {
      const res = await api.post("/api/auth/exist/user/verify-otp", { otp });
      toast.success(res.data.message || "OTP verified successfully");
      setResetEmail(res.data.email);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP ❌");
      return false;
    }
  };

  const resetPassword = async (newPassword) => {
    try {
      if (!resetEmail) {
        toast.error("Invalid reset flow ❌");
        return false;
      }

      const res = await api.post("/api/auth/user/reset-password", {
        email: resetEmail,
        newPassword,
      });

      toast.success(res.data.message || "Password reset successfully 🎉");
      navigate("/login");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password ❌");
      return false;
    }
  };

  // ---------------------------------------------------------------------------
  // 🚪 LOGOUT
  // ---------------------------------------------------------------------------
  const logout = async () => {
    try {
      await api.post(
        "/api/auth/user/logout",
        { deviceId: localStorage.getItem("deviceId") },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      if (socket) socket.emit("userOffline", { userId: normalizedUser?._id });

      disconnectSocket();
      setCanStartPresence(false);

      const preservedDeviceId = localStorage.getItem("deviceId");
      localStorage.clear();
      if (preservedDeviceId) localStorage.setItem("deviceId", preservedDeviceId);

      setToken(null);
      setUser(null);
      setRefreshToken(null);
      setSessionId(null);
      setSocket(null);
      setSocketConnected(false);

      toast.success("👋 Logged out successfully");
      navigate("/login");
    }
  };

  // ---------------------------------------------------------------------------
  // 🌍 Provider Value
  // ---------------------------------------------------------------------------
  const contextValue = {
    loading,
    token,
    refreshToken,
    user,
    sessionId,
    socket,
    socketConnected,
    onlineUsers,

    register,
    login,
    logout,

    verifyOtpForNewUser,
    sendOtpForReset,
    verifyOtpForReset,
    resetPassword,
 refreshAccessToken,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// -----------------------------------------------------------------------------
// 🪄 useAuth Hook
// -----------------------------------------------------------------------------
export const useAuth = () => useContext(AuthContext);
