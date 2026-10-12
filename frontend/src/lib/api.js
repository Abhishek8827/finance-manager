import axios from "axios";

// Get base URL from env or default to local
let baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Strip any trailing slash
baseURL = baseURL.trim().replace(/\/$/, "");

// Ensure /api is always attached at the end
if (!baseURL.endsWith("/api")) {
  baseURL += "/api";
}

const API = axios.create({
  baseURL,
  timeout: 20000,
});

export function setAccessToken(token) {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
}

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      setAccessToken(null);
      window.dispatchEvent(new Event("finance-manager:auth-expired"));
    }
    const message =
      error.response?.data?.error || error.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    return Promise.reject(customError);
  },
);

export default API;
