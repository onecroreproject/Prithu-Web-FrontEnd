import api from "../../api/axios";
import toast from "react-hot-toast";
import { getDeviceDetails } from "../../utils/getDeviceDetails";
import { connectSocket, disconnectSocket } from "../../webSocket/socket";

export const useAuthActions = ({
  token,
  setToken,
  setUser,
  setRefreshToken,
  setSessionId,
  navigate,
  setLoading,
}) => {
  const register = async ({ username, email, password, referralCode }) => {
    setLoading(true);
    try {
      await api.post("/api/auth/user/register", { username, email, password, referralCode });
      toast.success("🎉 Account created successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const login = async ({ identifier, password }) => {
    setLoading(true);
    try {
      const { deviceId, deviceType, os, browser } = getDeviceDetails();
      const res = await api.post("/api/auth/user/login", {
        identifier,
        password,
        deviceId,
        deviceType,
        os,
        browser,
      });

      const { accessToken, refreshToken, sessionId, userId } = res.data;

      if (!accessToken) throw new Error("Invalid login response");

      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("deviceId", deviceId);

      setToken(accessToken);
      setRefreshToken(refreshToken);
      setSessionId(sessionId);

      await fetchUserProfile(accessToken);
      connectSocket(accessToken, sessionId);
      toast.success("✅ Logged in successfully!");
      navigate("/");
    } catch (err) {
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
      console.log(res.data)
      setUser(res.data.profile);
    } catch (err) {
      console.warn("❌ Failed to fetch profile:", err.message);
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
      toast.success("👋 Logged out successfully");
      navigate("/login");
    }
  };

  return { register, login, logout, fetchUserProfile };
};
