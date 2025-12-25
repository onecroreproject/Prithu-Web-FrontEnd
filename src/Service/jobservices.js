import companyApi from "../api/companyApi";
import api from "../api/axios"

/**
 * API to create or update a job post (multipart/form-data expected for image)
 * @param {FormData} formData
 */
export const createOrUpdateJobPost = async (formData) => {
  try {


    // 🔹 Get token from localStorage
    const token = localStorage.getItem("companyToken");

    if (!token) {
      throw new Error("No token found. Please log in again.");
    }

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`, // ⬅️ send token
      },
    };

    // 🔹 API Call
    const response = await companyApi.post(
      "/job/company/create/job",
      formData,
      config
    );

    return response.data;
  } catch (error) {
    console.error(
      "❌ Error creating/updating job:",
      error.response?.data || error.message
    );
    throw error;
  }
};




/**
 * Fetch all jobs with optional filters as params object
 * @param {Object} params - filters such as category, location, jobType, etc.
 * @param {string} token 
 */
export const getAllJobs = async (params = {}, token) => {
  try {
    // Convert params object → query string
    const queryString = new URLSearchParams(params).toString();

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    };

    // Call backend with full query string
    const response = await api.get(`/job/user/get/all?${queryString}`, config);

    return response.data?.jobs || [];
  } catch (error) {
    console.error("❌ Error fetching all jobs:", error.response?.data || error.message);
    throw error;
  }
};


/**
 * Get job by ID
 * @param {string} jobId 
 * @param {string} token 
 */
export const getJobById = async (jobId, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get(`/job/get/jobs/by/id/${jobId}`, config);
    return response.data.job;
  } catch (error) {
    console.error("❌ Error fetching job by ID:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Delete job by ID
 * @param {string} jobId 
 * @param {string} token 
 */
export const deleteJobById = async (jobId, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.delete(`/job/delete/jobs/${jobId}`, config);
    return response.data;
  } catch (error) {
    console.error("❌ Error deleting job:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update engagement for a job (like, share, download, apply)
 * @param {string} jobId 
 * @param {string} actionType - 'like', 'share', 'download', 'apply'
 * @param {string} token 
 */
export const updateJobEngagement = async (jobId, actionType, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const payload = { jobId, actionType };
    const response = await api.post('/job/update', payload, config);
    return response.data;
  } catch (error) {
    console.error("❌ Error updating job engagement:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get engagement stats for a job by job ID
 * @param {string} jobId 
 * @param {string} token 
 */
export const getJobEngagementStats = async (jobId, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await api.get(`/job/stats/${jobId}`, config);
    return response.data.stats;
  } catch (error) {
    console.error("❌ Error fetching job engagement stats:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get all engagements by a user
 * @param {string} userId 
 * @param {string} token 
 */
export const getUserEngagements = async (userId, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    if(userId) {
      const response = await api.get(`/job/user/${userId}`, config);
      return response.data.engagements || [];
    }
    throw new Error("UserId required");
  } catch (error) {
    console.error("❌ Error fetching user engagements:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get jobs posted by a specific user
 * @param {string} userId 
 * @param {string} token 
 */
export const getJobsByUserId = async (userId, token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const params = userId ? {userId} : {};
    const response = await api.get('/get/jobs/by/userId', {...config, params});
    return response.data.jobs || [];
  } catch (error) {
    console.error("❌ Error fetching jobs by user:", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get ranked jobs (uses feedService's getTopRankedJobs maybe)
 * @param {string} token 
 */
export const getRankedJobs = async (token) => {
  try {
    const config = { headers: { Authorization: `Bearer ${token}` } }
    const response = await api.get('/job/top/ranked/jobs', config);

    return response.data.jobs || [];
  } catch (error) {
    console.error("❌ Error fetching ranked jobs:", error.response?.data || error.message);
    throw error;
  }
};





export const fetchRankedJobs = async () => {
  const { data } = await api.get("/job/top/ranked/jobs");

  return data?.jobs || [];
};



export const getDraftJobById = async (jobId) => {
  return companyApi.get(`/job/get/draft/jobs/${jobId}`);
};
