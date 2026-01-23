import api from "../api/axios";

export const uploadCreatorFeed = async (data, token) => {
  try {
    const formData = new FormData();

    if (data.files && data.files.length > 0) {
      formData.append("file", data.files[0].file);
    }

    formData.append("language", data.language || "");
    formData.append("categoryId", data.categoryId || "");
    formData.append("type", data.type || "image");
    formData.append("dec", data.dec || "");
    if (data.scheduleDate) formData.append("scheduleDate", data.scheduleDate);

    const endpoint = data.scheduleDate
      ? "api/creator/feed/ScheduleUpload"
      : "api/creator/feed/upload";

    const res = await api.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Upload Error:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};


