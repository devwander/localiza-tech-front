import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  if (!(config.data instanceof FormData)) {
    config.headers["Content-Type"] = "application/json";
  }

  config.headers["Cache-Control"] = "no-cache";
  config.headers["Pragma"] = "no-cache";
  config.headers["Expires"] = "0";

  return config;
});
