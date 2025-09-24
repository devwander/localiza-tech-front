import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }
  return config;
});
