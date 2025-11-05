// src/services/userService.js
import api from "../api/axios";


export const getUserProfile = async (token) => {
  try {
    const { data } = await api.get("/api/get/profile/detail")
    console.log(data)
    return data.profile;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error.response?.data || error.message);
    throw error;
  }
};



export const updateCoverPhoto = async (file, token) => {
  const formData = new FormData();
  formData.append("coverPhoto", file);
  const { data } = await api.post("/api/user/profile/cover/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};

export const updateProfileAvatar = async (file, token) => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await api.post("/api/user/profile/detail/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};




export const updateProfileDetails = async (formData, token) => {
  const { data } = await api.post("/api/user/profile/detail/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return data;
};


