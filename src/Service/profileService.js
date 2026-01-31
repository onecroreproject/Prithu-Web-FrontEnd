// ✅ src/Service/userService.js
import api from "../api/axios";
import { toast } from "react-hot-toast";

// ------------------------------
// 🔹 Helper: Auth Headers
// ------------------------------
const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});


// ------------------------------
// 🔹 General User Profile
// ------------------------------
export const getUserProfile = async (token, userId) => {
  try {
    const url = userId
      ? `/api/get/single/profile/detail?id=${userId}`
      : `/api/get/profile/detail`;

    const config = userId ? {} : authHeader(token); // only send token for self

    const { data } = await api.get(url, config);
    return data.profile;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error.response?.data || error.message);
    toast.error("Failed to fetch user profile");
    throw error;
  }
};



// ------------------------------
// 🔹 Update Cover Photo
// ------------------------------
export const updateCoverPhoto = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("coverPhoto", file);
    const { data } = await api.post("/api/user/profile/cover/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("❌ Cover Photo Upload Error:", error);
    toast.error(error.response?.data?.message || "Failed to upload cover photo");
    throw error;
  }
};


// ------------------------------
// 🔹 Update Profile Avatar
// ------------------------------
export const updateProfileAvatar = async (file, token) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post("/api/user/profile/detail/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("❌ Profile Avatar Upload Error:", error);
    toast.error(error.response?.data?.message || "Failed to upload profile photo");
    throw error;
  }
};


// ------------------------------
// 🔹 Update Profile Details
// ------------------------------
export const updateProfileDetails = async (formData, token) => {
  try {
    const { data } = await api.post("/api/user/profile/detail/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return data;
  } catch (error) {
    console.error("❌ Profile Detail Update Error:", error);
    toast.error(error.response?.data?.message || "Failed to update profile details");
    throw error;
  }
};


export const togglePublish = async (publish, token) => {
  const { data } = await api.post(
    "/api/profile/toggle-publish",
    { publish },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  console.log(data)
  return data;
};

