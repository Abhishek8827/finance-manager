import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true, // CRUCIAL for cookies
  timeout: 20000,
});

API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error || error.message || "Something went wrong";
    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.needsSetup = error.response?.data?.needsSetup;
    return Promise.reject(customError);
  },
);

export default API;
