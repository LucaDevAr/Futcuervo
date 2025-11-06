import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log("[v0] API request:", config);
    return config;
  },
  (error) => {
    console.error("[v0] API request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log("[v0] API response received:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[v0] API response error:", error);
    return Promise.reject(error);
  }
);

export const fetchUserSession = async () => {
  try {
    console.log("[v0] fetchUserSession called");
    const response = await api.get("/auth/session");
    return response.data;
  } catch (error) {
    console.error("[v0] fetchUserSession error:", error);
    throw error;
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await api.post("/auth/register", userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await api.post("/auth/logout");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
