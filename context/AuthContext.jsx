import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(null);
  const [startUpProcess, setStartUpProcess] = useState(null);
  const [resetEmail, setResetEmail] = useState(""); // Used in forgot password flow

  // ---------- Axios Instance ----------
  const api = axios.create({
    baseURL: "http://localhost:5000",
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
  });

  // Attach token to every request
  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  // ---------- Register ----------
  const register = async ({ username, email, password, referralCode }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/user/register", { username, email, password, referralCode });
      toast.success("✅ Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Server error during register ❌");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Login ----------
  const login = async ({ identifier, password }) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/user/login", { identifier, password });

      if (res.data.accessToken) {
        localStorage.setItem("token", res.data.accessToken);
        setToken(res.data.accessToken);
        if (res.data.startUpProcess) setStartUpProcess(res.data.startUpProcess);

        await fetchUserProfile(res.data.accessToken);
        toast.success("🎉 Login successful!");
        navigate("/");
        return true;
      }

      toast.error(res.data.message || "Login failed ❌");
      return false;
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Server error during login ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ---------- Send OTP (For New User or Reset Password) ----------
  const sendOtpForReset = async (email) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/user/otp-send", { email });
      console.log("Send OTP response:", res.data);
      setResetEmail(email);
      toast.success("📧 OTP sent to your email");
      return true;
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to send OTP ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ---------- Verify OTP for Existing User (Forgot Password) ----------
  const verifyOtpForExistingUser = async (otp) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/exist/user/verify-otp", { otp });
      console.log("Verify existing user OTP response:", res.data);
      toast.success("✅ OTP verified!");
      return true;
    } catch (err) {
      console.error("Existing user OTP verify error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "OTP verification failed ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ---------- Verify OTP for New User (Registration) ----------
  const verifyOtpForNewUser = async ({ email, otp }) => {
    setLoading(true);
    try {
      const res = await api.post("/api/auth/new/user/verify-otp", { email, otp });
      console.log("Verify new user OTP response:", res.data);
      toast.success("✅ OTP verified!");
      return true;
    } catch (err) {
      console.error("New user OTP verify error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "OTP verification failed ❌");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ---------- Reset Password ----------
  const resetPassword = async (newPassword) => {
    setLoading(true);
    try {
      if (!resetEmail) {
        toast.error("Email context missing. Start OTP process again.");
        return false;
      }

      await api.post("/api/auth/user/reset-password", {
        email: resetEmail,
        newPassword,
      });

      toast.success("🔑 Password reset successful!");
      navigate("/login");
      return true;
    } catch (err) {
      console.error("Reset password error:", err.response?.data || err.message);
      toast.error(err.response?.data?.error || "Failed to reset password ❌");
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
      console.warn("Failed to fetch profile, using fallback.");
      
    }
  };

  // ---------- Update User Profile ----------
  const updateUserProfile = async (updatedProfile) => {
    try {
      const formData = new FormData();

      if (updatedProfile.profileAvatar instanceof File) {
        formData.append("file", updatedProfile.profileAvatar);
      }

      if (updatedProfile.displayName) formData.append("displayName", updatedProfile.displayName);
      if (updatedProfile.username) formData.append("username", updatedProfile.username);
      if (updatedProfile.bio) formData.append("bio", updatedProfile.bio);
      if (updatedProfile.phone) formData.append("phone", updatedProfile.phone);
      if (updatedProfile.maritalStatus) formData.append("maritalStatus", updatedProfile.maritalStatus);
      if (updatedProfile.dob) formData.append("dob", updatedProfile.dob.toISOString());
      if (updatedProfile.language) formData.append("language", updatedProfile.language);

      const res = await api.post("/api/user/profile/detail/update", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.updatedProfile || { ...user, ...updatedProfile });
      toast.success("✅ Profile updated successfully!");
    } catch (err) {
      console.error("Update profile error:", err.response?.data || err.message);
      toast.error("Failed to update profile ❌");
    }
  };

  // ---------- Logout ----------
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setStartUpProcess(null);
    toast.success("👋 Logged out successfully");
    navigate("/login");
  };

  // ---------- Auto Fetch Profile if Token Exists ----------
  useEffect(() => {
    if (token) fetchUserProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        loading,
        token,
        startUpProcess,
        user,
        register,
        login,
        logout,
        sendOtpForReset,
        verifyOtpForExistingUser,
        verifyOtpForNewUser,
        resetPassword,
        fetchUserProfile,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ---------- Custom Hook ----------
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
