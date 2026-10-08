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
  withCredentials: true,
  timeout: 20000,
});

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    return Promise.reject(customError);
  },
);

export default API;
