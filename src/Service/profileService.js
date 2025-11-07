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
// 🔹 Education Services
// ------------------------------
export const addEducation = async (payload, token) => {
  try {
    const { data } = await api.post("/api/profile/education", payload, authHeader(token));
    return { success: true, data };
  } catch (error) {
    console.error("❌ Add Education Error:", error);
    toast.error(error.response?.data?.message || "Failed to add education");
    return { success: false, error };
  }
};

export const updateEducation = async (userId, educationId, payload, token) => {
  try {
    const { data } = await api.put(
      `/api/profile/education/${userId}/${educationId}`,
      payload,
      authHeader(token)
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Update Education Error:", error);
    toast.error(error.response?.data?.message || "Failed to update education");
    return { success: false, error };
  }
};

export const deleteEducation = async (userId, educationId, token) => {
  try {
    const { data } = await api.delete(
      `/api/education/profile/delete/${userId}/${educationId}`,
      authHeader(token)
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Delete Education Error:", error);
    toast.error(error.response?.data?.message || "Failed to delete education");
    return { success: false, error };
  }
};


// ------------------------------
// 🔹 Experience Services
// ------------------------------
export const addExperience = async (payload, token) => {
  try {
    const { data } = await api.post("/api/user/job/experience", payload, authHeader(token));
    return { success: true, data };
  } catch (error) {
    console.error("❌ Add Experience Error:", error);
    toast.error(error.response?.data?.message || "Failed to add experience");
    return { success: false, error };
  }
};

export const updateExperience = async (userId, experienceId, payload, token) => {
  try {
    const { data } = await api.put(
      `/api/user/job/experience/${userId}/${experienceId}`,
      payload,
      authHeader(token)
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Update Experience Error:", error);
    toast.error(error.response?.data?.message || "Failed to update experience");
    return { success: false, error };
  }
};

export const deleteExperience = async (userId, experienceId, token) => {
  try {
    const { data } = await api.delete(
      `/api/user/job/experience/detele/${userId}/${experienceId}`,
      authHeader(token)
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Delete Experience Error:", error);
    toast.error(error.response?.data?.message || "Failed to delete experience");
    return { success: false, error };
  }
};


// ------------------------------
// 🔹 Skill Services
// ------------------------------
export const addSkill = async (payload, token) => {
  try {
    const { data } = await api.post("/api/user/education/skill", payload, authHeader(token));
    return { success: true, data };
  } catch (error) {
    console.error("❌ Add Skill Error:", error);
    toast.error(error.response?.data?.message || "Failed to add skill");
    return { success: false, error };
  }
};

export const updateSkill = async (userId, skillId, payload, token) => {
  try {
    const { data } = await api.put(
      `/api/user/eduction/skill/${userId}/${skillId}`,
      payload,
      authHeader(token)
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Update Skill Error:", error);
    toast.error(error.response?.data?.message || "Failed to update skill");
    return { success: false, error };
  }
};

export const deleteSkill = async (userId, skillId, token) => {
  try {
    const { data } = await api.delete(
      `/api/user/eduction/skill/delete/${userId}/${skillId}`,
      authHeader(token)
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Delete Skill Error:", error);
    toast.error(error.response?.data?.message || "Failed to delete skill");
    return { success: false, error };
  }
};


// ------------------------------
// 🔹 Certification Services
// ------------------------------
export const addCertification = async (payload, token) => {
  try {
    const { data } = await api.post("/api/user/education/certification", payload, authHeader(token));
    return { success: true, data };
  } catch (error) {
    console.error("❌ Add Certification Error:", error);
    toast.error(error.response?.data?.message || "Failed to add certification");
    return { success: false, error };
  }
};
export const updateCertification = async (userId, certificationId, payload, token) => {
  return await api.put(`/api/user/certification/update/${userId}/${certificationId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deleteCertification = async (userId, certificationId, token) => {
  try {
    const { data } = await api.delete(
      `/api/user/eduction/certification/delete/${userId}/${certificationId}`,
      authHeader(token)
    );
    return { success: true, data };
  } catch (error) {
    console.error("❌ Delete Certification Error:", error);
    toast.error(error.response?.data?.message || "Failed to delete certification");
    return { success: false, error };
  }
};


// ------------------------------
// 🔹 Full Curriculum Profile
// ------------------------------
export const getUserCurriculamProfile = async (token) => {
  try {
    const { data } = await api.get("/api/get/full/curriculam/profile", authHeader(token));
    return { success: true, data };
  } catch (error) {
    console.error("❌ Get Curriculam Profile Error:", error);
    toast.error("Failed to fetch full profile");
    return { success: false, error };
  }
};


// ------------------------------
// 🔹 General User Profile
// ------------------------------
export const getUserProfile = async (token) => {
  try {
    const { data } = await api.get("/api/get/profile/detail", authHeader(token));
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

