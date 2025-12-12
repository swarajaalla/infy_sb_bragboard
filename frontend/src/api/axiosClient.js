import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8000", // your FastAPI backend
});

// attach token automatically
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default axiosClient;
