import React, { createContext, useState, useEffect, useContext, useRef } from "react";
import api from "../api/axios";
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

  // ---------- Refs ----------
  const socketRef = useRef(null);
  const locationIntervalRef = useRef(null);



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

  // ---------- Login ----------
  const login = async ({ identifier, password }) => {
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

        // 🆕 Check if user location exists
        await checkUserLocation(accessToken);

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

  // 🆕 ---------- Check User Location ----------
 const checkUserLocation = async () => {
  try {
    const res = await api.get("/api/get/user/location",);

    // ✅ If no existing location found — start tracking
    if (!res.data.success) {
      console.log("⚠️ No location found, starting tracking...");
      startLocationTracking();
      return;
    }

    const locationData = res.data.location;

    // If permission is granted, update the current location
    if (locationData?.permissionStatus === "granted") {
      console.log(" Updating user’s latest location...");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude, longitude } = pos.coords;
            await api.post(
              "/api/save/user/location",
              { latitude, longitude, permissionStatus: "granted" },
              
            );
            console.log("✅ Location updated successfully:", latitude, longitude);
          },
          (err) => {
            console.warn("❌ Error getting current location:", err);
          },
          { enableHighAccuracy: true, timeout: 10000 }
        );
      } else {
        console.warn("⚠️ Geolocation not supported by this browser.");
      }
    } else {
      // ⚠️ Permission denied or prompt again
      console.log("⚠️ Permission not granted or denied, starting tracking...");
      startLocationTracking();
    }
  } catch (err) {
    console.warn("❌ Error fetching user location:", err.response?.data || err.message);
    startLocationTracking(); // fallback if error
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

      const fields = ["displayName", "username", "bio", "phone", "maritalStatus", "language"];
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

      const payload = {};
      if (sessionId) payload.sessionId = sessionId;
      if (deviceId) payload.deviceId = deviceId;

      await api.post("/api/auth/user/logout", payload, { headers });
    } catch (err) {
      console.error("❌ Logout error:", err.response?.data || err.message);
    } finally {
      if (socketRef.current) socketRef.current.disconnect();
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);

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

  // ---------- SOCKET.IO ----------
  const initSocket = (userId) => {
    if (socketRef.current) socketRef.current.disconnect();

    const socket = io(import.meta.env.VITE_API_BASE_URL || "http://localhost:5000", {
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
    socket.on("userOnline", (id) => setOnlineUsers((prev) => new Set([...prev, id])));
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

  // ---------- Location Tracking ----------
  const startLocationTracking = () => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported by this browser.");
      return;
    }

    const sendLocation = async (permissionStatus) => {
      if (permissionStatus === "denied") {
        await api.post("/api/save/user/location", { permissionStatus: "denied" });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await api.post("/api/save/user/location", {
            latitude,
            longitude,
            permissionStatus: "granted",
          });
          console.log("✅ Location updated:", latitude, longitude);
        },
        async (err) => {
          console.warn("❌ Geolocation error:", err);
          await api.post("/api/save/user/location", { permissionStatus: "denied" });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    };

    navigator.permissions.query({ name: "geolocation" }).then((result) => sendLocation(result.state));

    locationIntervalRef.current = setInterval(async () => {
      navigator.permissions.query({ name: "geolocation" }).then((result) => sendLocation(result.state));
    }, 300000);
  };

  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
