import axios from "axios";

// Use environment variable for base URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/web';
console.log('[Axios Config] baseURL:', baseURL);

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
