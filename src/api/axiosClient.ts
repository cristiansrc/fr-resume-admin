import axios from "axios";
import { API_URL } from "./apiConfig";
import { TOKEN_KEY } from "./authProvider";

export const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const skipRedirect =
        error.config?.headers?.["x-skip-error-redirect"] === "true";
      const hasWindow = typeof window !== "undefined";
      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        if (!skipRedirect && hasWindow) {
          window.location.assign("/login");
        }
      } else if (!skipRedirect && hasWindow) {
        if (status === 404) {
          window.location.assign("/not-found");
        } else if (status === 500) {
          window.location.assign("/error");
        }
      }
    }

    return Promise.reject(error);
  },
);
