// ✅ src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";
import { getDeviceDetails } from "../utils/getDeviceDetails";
import { connectSocket, disconnectSocket } from "../webSocket/socket";
import { useAutoLogin } from "./AuthContextComponents/useAutologin";
import { usePresenceTracker } from "./AuthContextComponents/userPresenceTracker";

// ---------------------- ⚙️ Create Context ----------------------
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ---------------------- 🌐 Core States ----------------------
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || null);
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [socketConnected, setSocketConnected] = useState(false);
  const [resetEmail, setResetEmail] = useState(null);

  // ---------------------- 🚀 Hooks ----------------------
  useAutoLogin({ setToken, setUser, setSessionId, navigate });
  usePresenceTracker({ token, sessionId, user });

  // ---------------------- ⚡ Global Socket Connection ----------------------
  useEffect(() => {
    if (!token || !sessionId || !user?._id) return;

    console.log("🔗 Establishing global socket connection...");
    const socket = connectSocket(token, sessionId);

    socket.on("connect", () => {
      console.log("✅ [SOCKET] Connected:", socket.id);
      setSocketConnected(true);

      // 🟢 Mark current user online
      socket.emit("userOnline", { userId: user._id });
    });

    socket.on("disconnect", (reason) => {
      console.warn("🔌 [SOCKET] Disconnected:", reason);
      setSocketConnected(false);
      socket.emit("userOffline", { userId: user._id });
    });

    // ---------------------- 🟢 User Presence Updates ----------------------
    socket.on("userOnline", ({ userId }) => {
      console.log("🟢 [SOCKET] User online:", userId);
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socket.on("userOffline", ({ userId }) => {
      console.log("🔴 [SOCKET] User offline:", userId);
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    // ---------------------- 🔔 GLOBAL NOTIFICATIONS ----------------------

    // ✅ When a new notification arrives from backend
    socket.on("newNotification", (notification) => {
      console.log("📬 [GLOBAL SOCKET] New Notification received:", notification);

      // 🔊 Dispatch event globally so any component (Header, etc.) can listen
      const event = new CustomEvent("socket:newNotification", { detail: notification });
      document.dispatchEvent(event);

      // 🔔 Optional: Instant user feedback
      toast.success(`🔔 ${notification.title || "New notification received!"}`);
    });

    // ✅ When notification is marked as read
    socket.on("notificationRead", (data) => {
      console.log("📨 [GLOBAL SOCKET] Notification read event:", data);
      const event = new CustomEvent("socket:notificationRead", { detail: data });
      document.dispatchEvent(event);
    });

    // ---------------------- 🧹 Cleanup ----------------------
    return () => {
      console.log("🧹 Cleaning up global socket...");
      socket.emit("userOffline", { userId: user._id });
      disconnectSocket();
      setSocketConnected(false);
    };
  }, [token, sessionId, user?._id]);

  // ---------------------- 🧩 Auth Actions ----------------------

  const register = async ({ username, email, password, referralCode, phone, whatsapp }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/user/register", {
        username,
        email,
        password,
        referralCode,
        phone,
        whatsapp,
      });
      toast.success("🎉 Account created successfully!");
      navigate("/login");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ identifier, password }) => {
    setLoading(true);
    try {
      const { deviceId, deviceType, os, browser } = getDeviceDetails();

      const { data } = await api.post("/api/auth/user/login", {
        identifier,
        password,
        deviceId,
        deviceType,
        os,
        browser,
      });
console.log(data)
      const { accessToken, refreshToken, sessionId ,userId} = data;
      if (!accessToken) throw new Error("Invalid login response");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("deviceId", deviceId);
      localStorage.setItem("userId", userId);


      setToken(accessToken);
      setRefreshToken(refreshToken);
      setSessionId(sessionId);

      await fetchUserProfile(accessToken);

      toast.success("✅ Logged in successfully!");
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.error || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async (customToken) => {
    try {
      const res = await api.get("/api/get/profile/detail", {
        headers: { Authorization: `Bearer ${customToken || token}` },
      });
      console.log("✅ User Profile Loaded:", res.data.profile);
    } catch (err) {
      console.warn("❌ Failed to fetch profile:", err.message);
    }
  };

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
      toast.success(res.data.message || "OTP verified successfully ✅");
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid or expired OTP ❌");
      return false;
    }
  };

  const verifyOtpForReset = async ({ otp }) => {
    try {
      const res = await api.post("/api/auth/exist/user/verify-otp", { otp });
      toast.success(res.data.message || "OTP verified successfully ✅");
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
        toast.error("Email not found for reset flow ❌");
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

  const logout = async () => {
    try {
      await api.post(
        "/api/auth/user/logout",
        { sessionId: localStorage.getItem("sessionId") },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error("Logout error:", err.message);
    } finally {
      disconnectSocket();
      localStorage.clear();
      setToken(null);
      setUser(null);
      setRefreshToken(null);
      setSessionId(null);
      setSocketConnected(false);
      toast.success("👋 Logged out successfully");
      navigate("/login");
    }
  };

  // ---------------------- 🌍 Context Value ----------------------
  const contextValue = {
    loading,
    token,
    refreshToken,
    user,
    sessionId,
    deviceId,
    onlineUsers,
    socketConnected,
    register,
    login,
    logout,
    verifyOtpForNewUser,
    sendOtpForReset,
    verifyOtpForReset,
    resetPassword,
    fetchUserProfile,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ---------------------- 🪄 Custom Hook ----------------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
