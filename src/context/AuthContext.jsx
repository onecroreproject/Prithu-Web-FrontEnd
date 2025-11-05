// ✅ src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useRef } from "react";
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
  const [resetEmail, setResetEmail] = useState(null); // ✅ Added — was missing

  // ---------------------- 🧠 Refs ----------------------
  const socketRef = useRef(null);
  const locationIntervalRef = useRef(null);

  // ---------------------- 🚀 Hooks ----------------------
  useAutoLogin({ setToken, setUser, setSessionId, navigate });
  usePresenceTracker({ token, sessionId, user });

  // ---------------------- 🧩 Auth Actions ----------------------

  /** 🔹 Register new user */
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

  /** 🔹 Login */
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

      const { accessToken, refreshToken, sessionId } = data;

      if (!accessToken) throw new Error("Invalid login response");

      // ✅ Persist session
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("deviceId", deviceId);

      setToken(accessToken);
      setRefreshToken(refreshToken);
      setSessionId(sessionId);

      await fetchUserProfile(accessToken);

      // ✅ Connect socket
      const socket = connectSocket(accessToken, sessionId);
      socketRef.current = socket;
      setSocketConnected(true);

      toast.success("✅ Logged in successfully!");
      navigate("/");
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.error || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  /** 🔹 Fetch user profile */
  const fetchUserProfile = async (customToken) => {
    try {
      const res = await api.get("/api/get/profile/detail", {
        headers: { Authorization: `Bearer ${customToken || token}` },
      });
      setUser(res.data.profile);
      console.log("✅ User Profile Loaded:", res.data.profile);
    } catch (err) {
      console.warn("❌ Failed to fetch profile:", err.message);
    }
  };

  /** 🔹 Send OTP (for new user or password reset) */
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

  /** 🔹 Verify OTP (new user) */
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

  /** 🔹 Verify OTP (reset flow) */
  const verifyOtpForReset = async ({ otp }) => {
    try {
      const res = await api.post("/api/auth/user/verify-otp-exist", { otp });
      toast.success(res.data.message || "OTP verified successfully ✅");
      setResetEmail(res.data.email);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Invalid OTP ❌");
      return false;
    }
  };

  /** 🔹 Reset Password */
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
      navigate("/login"); // ✅ fixed from SwitchMode()
      return true;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to reset password ❌");
      return false;
    }
  };

  /** 🔹 Logout */
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
      socketRef.current = null;
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
    socketRef,
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
