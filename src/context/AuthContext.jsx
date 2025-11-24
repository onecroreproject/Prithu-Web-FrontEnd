// ✅ src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [socket, setSocket] = useState(null);
  const [resetEmail, setResetEmail] = useState(null);

  // ---------------------- 🚀 Hooks ----------------------
  useAutoLogin({ setToken, setUser, setSessionId, navigate });
  usePresenceTracker({ token, sessionId, user, socket });

  // ---------------------- ⚡ Socket Connection ----------------------
  useEffect(() => {
    if (!token || !sessionId || !user?._id) return;

    const newSocket = connectSocket(token, sessionId);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ [SOCKET] Connected:", newSocket.id);
      setSocketConnected(true);
      newSocket.emit("userOnline", { userId: user._id });
    });

    newSocket.on("disconnect", (reason) => {
      console.warn("🔌 [SOCKET] Disconnected:", reason);
      setSocketConnected(false);
      newSocket.emit("userOffline", { userId: user._id });
    });

    // 🟢 Presence Updates
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

    // ✅ Note: newNotification and notificationRead events are handled in socket.js
    // and dispatched as CustomEvents for components to listen to

    return () => {
      newSocket.emit("userOffline", { userId: user?._id });
      disconnectSocket();
      setSocketConnected(false);
      setSocket(null);
    };
  }, [token, sessionId, user?._id]);

  // ---------------------- 🧩 Auth Actions ----------------------

  const register = async ({
    username,
    email,
    password,
    referralCode,
    phone,
    whatsapp,
    accountType,
  }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/user/register", {
        username,
        email,
        password,
        referralCode,
        phone,
        whatsapp,
        accountType,
      });

      toast.success("🎉 Account created successfully!");

      // Read redirect param (from shared link)
      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get("redirect");

      if (redirectPath) {
        navigate(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      } else {
        navigate("/login");
      }

      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };


  /**
   * 🔐 Login with redirect support (and device-aware session)
   */
  const login = async ({ identifier, password }) => {
    setLoading(true);
    try {
      let storedDeviceId = localStorage.getItem("deviceId");
      let deviceType, os, browser;

      if (!storedDeviceId) {
        const deviceDetails = getDeviceDetails();
        storedDeviceId = deviceDetails.deviceId;
        deviceType = deviceDetails.deviceType;
        os = deviceDetails.os;
        browser = deviceDetails.browser;
        localStorage.setItem("deviceId", storedDeviceId);
      } else {
        const deviceDetails = getDeviceDetails();
        deviceType = deviceDetails.deviceType;
        os = deviceDetails.os;
        browser = deviceDetails.browser;
      }

      const existingSessionId = localStorage.getItem("sessionId");

      const loginPayload = {
        identifier,
        password,
        deviceId: storedDeviceId,
        deviceType,
        os,
        browser,
        sessionId: existingSessionId || null,
      };

      const { data } = await api.post("/api/auth/user/login", loginPayload);
      const { accessToken, refreshToken, sessionId: newSessionId, userId } = data;

      if (!accessToken) throw new Error("Invalid login response");

      // Save tokens
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("sessionId", newSessionId);
      localStorage.setItem("deviceId", storedDeviceId);
      localStorage.setItem("userId", userId);

      setToken(accessToken);
      setRefreshToken(refreshToken);
      setSessionId(newSessionId);

      await fetchUserProfile(accessToken);

      window.history.replaceState({}, "", "/login");

      const params = new URLSearchParams(window.location.search);
      const redirectPath = params.get("redirect");

      if (redirectPath) {
        navigate(decodeURIComponent(redirectPath), { replace: true });
      } else {
        navigate("/", { replace: true });
      }

      return true;

    } catch (err) {
      console.error("Login Error:", err);

      // ⭐ RE-THROW BACKEND ERROR SO UI CAN SHOW IT
      throw err;

    } finally {
      setLoading(false);
    }
  };




  /**
   * 👤 Fetch user profile
   */
  const fetchUserProfile = useCallback(async (customToken) => {
    try {
      const res = await api.get("/api/get/profile/detail", {
        headers: { Authorization: `Bearer ${customToken || token}` },
      });
      setUser(res.data.profile);
    } catch (err) {
      console.warn("❌ Failed to fetch profile:", err.message);
    }
  }, [token]);


  /**
   * 📩 Forgot Password Flows
   */
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

  /**
   * 🚪 Logout
   */
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
      if (socket) socket.emit("userOffline", { userId: user?._id });
      disconnectSocket();

      // ✅ Preserve deviceId (and optionally other data)
      const preservedDeviceId = localStorage.getItem("deviceId");

      // Clear all other data
      localStorage.clear();

      // Restore preserved values
      if (preservedDeviceId) {
        localStorage.setItem("deviceId", preservedDeviceId);
      }

      // 🔄 Reset states
      setToken(null);
      setUser(null);
      setRefreshToken(null);
      setSessionId(null);
      setSocketConnected(false);
      setSocket(null);

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
    socket,
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
