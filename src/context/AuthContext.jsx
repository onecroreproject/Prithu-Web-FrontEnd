import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ---------- States ----------
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("refreshToken") || null);
  const [user, setUser] = useState(null);
  const [sessionId, setSessionId] = useState(localStorage.getItem("sessionId") || null);
  const [deviceId, setDeviceId] = useState(localStorage.getItem("deviceId") || uuidv4());
  const [socketConnected, setSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [startUpProcess, setStartUpProcess] = useState(null);
  const [resetEmail, setResetEmail] = useState("");

  // ---------- Socket Reference ----------
  const socketRef = useRef(null);

  // ---------- Axios Instance ----------
  const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ---------- Auto Refresh Token ----------
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401 && refreshToken) {
        try {
          const res = await axios.post("http://localhost:5000/api/auth/refresh-token", {
            refreshToken,
          });
          const newAccessToken = res.data.accessToken;
          setToken(newAccessToken);
          localStorage.setItem("token", newAccessToken);
          error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          return axios(error.config);
        } catch (err) {
          logout();
        }
      }
      return Promise.reject(error);
    }
  );

  // ---------- Register ----------
  const register = async ({ username, email, password, referralCode }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/user/register", {
        username,
        email,
        password,
        referralCode,
      });
      toast.success("🎉 Account created successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Login (Session-based) ----------
  const login = async ({ identifier, password }) => {
    console.log({ identifier, password })
    setLoading(true);
    try {
      const deviceType = "web";
      const res = await api.post("/api/auth/user/login", {
        identifier,
        password,
        deviceId,
        deviceType,
      });

      const {
        accessToken,
        refreshToken: newRefreshToken,
        userId,
        sessionId: newSessionId,
        appLanguage,
        feedLanguage,
        gender,
        category,
      } = res.data;

      if (accessToken) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        localStorage.setItem("sessionId", newSessionId);
        localStorage.setItem("deviceId", deviceId);

        setToken(accessToken);
        setRefreshToken(newRefreshToken);
        setSessionId(newSessionId);
        setStartUpProcess({ appLanguage, feedLanguage, gender, category });

        await fetchUserProfile(accessToken);
        initSocket(userId);

        toast.success("✅ Logged in successfully!");
        navigate("/");
        return true;
      } else {
        toast.error(res.data.error || "Login failed ❌");
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Server error during login ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ---------- Fetch User Profile ----------
  const fetchUserProfile = async (customToken) => {
    try {
      const res = await api.get("/api/get/profile/detail", {
        headers: { Authorization: `Bearer ${customToken || token}` },
      });
      setUser(res.data.profile);
    } catch (err) {
      console.warn("❌ Failed to fetch profile:", err.response?.data || err.message);
    }
  };

  // ---------- Update User Profile ----------
  const updateUserProfile = async (updatedProfile) => {
    try {
      const formData = new FormData();
      if (updatedProfile.profileAvatar instanceof File) {
        formData.append("file", updatedProfile.profileAvatar);
      }

      const fields = [
        "displayName",
        "username",
        "bio",
        "phone",
        "maritalStatus",
        "language",
      ];
      fields.forEach((field) => {
        if (updatedProfile[field]) formData.append(field, updatedProfile[field]);
      });

      if (updatedProfile.dob) {
        formData.append("dob", updatedProfile.dob.toISOString());
      }

      const res = await api.post("/api/user/profile/detail/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.updatedProfile || { ...user, ...updatedProfile });
      toast.success("✅ Profile updated!");
    } catch (err) {
      toast.error("❌ Failed to update profile");
    }
  };

  // ---------- Logout ----------
 const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // 🔹 Prepare logout payload
    const payload = {};
    if (sessionId) payload.sessionId = sessionId;
    if (deviceId) payload.deviceId = deviceId;

    if (!payload.sessionId && !payload.deviceId) {
      console.warn("No sessionId or deviceId found for logout");
    }

    // 🔹 Call API
    await api.post("/api/auth/user/logout", payload, { headers });

  } catch (err) {
    console.error("❌ Logout error:", err.response?.data || err.message);
  } finally {
    // 🔹 Disconnect socket
    if (socketRef.current) socketRef.current.disconnect();

    // 🔹 Clear local storage & states
    localStorage.clear();
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setSessionId(null);
    setOnlineUsers(new Set());
    setSocketConnected(false);

    toast.success("👋 Logged out successfully");
    navigate("/login");
  }
};


  // ---------- SOCKET.IO Presence ----------
  const initSocket = (userId) => {
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io("http://localhost:5000", {
      query: { userId },
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      setSocketConnected(true);
      socket.emit("userOnline", userId);
    });

    socket.on("onlineUsers", (users) => setOnlineUsers(new Set(users)));
    socket.on("userOnline", (id) =>
      setOnlineUsers((prev) => new Set([...prev, id]))
    );
    socket.on("userOffline", (id) =>
      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      })
    );

    socket.on("disconnect", () => {
      console.log("⚠️ Socket disconnected");
      setSocketConnected(false);
    });
  };

  // ---------- Auto Fetch Profile ----------
  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  // ---------- Context Value ----------
  const contextValue = {
    loading,
    token,
    refreshToken,
    user,
    sessionId,
    deviceId,
    startUpProcess,
    socketConnected,
    onlineUsers,
    register,
    login,
    logout,
    fetchUserProfile,
    updateUserProfile,
    socket: socketRef.current,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

// ---------- Custom Hook ----------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
