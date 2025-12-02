// src/api/companyApi.js
import axios from "axios";

const companyApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// 🔹 Attach company JWT token automatically
companyApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("companyToken"); // <— Store company token here
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default companyApi;
