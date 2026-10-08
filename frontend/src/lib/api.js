import axios from "axios";

let baseURL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .trim()
  .replace(/\/$/, "");
if (!baseURL.endsWith("/api")) baseURL += "/api";

const API = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 45000, // 45s gives Render free tier enough time to wake up!
});

API.interceptors.response.use(
  (res) => res.data,
  (error) => {
    let message = "Something went wrong";
    if (error.code === "ECONNABORTED") {
      message = "Server waking up... Please wait a moment and retry.";
    } else if (!error.response) {
      message = "Cannot reach server. Waking up background server...";
    } else {
      message = error.response?.data?.error || error.message;
    }
    const e = new Error(message);
    e.status = error.response?.status;
    return Promise.reject(e);
  },
);

export default API;
