import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

// Crear instancia de axios
const api = axios.create({
  baseURL: API_BASE_URL + "/api", // 👈 Aca agregamos el /api
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Debug
api.interceptors.request.use((config) => {
  console.log("[v0] API request:", config.method, config.url);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      "[v0] API response error:",
      error.response?.status,
      error.response?.data
    );
    return Promise.reject(error);
  }
);

// Endpoints
export const fetchUserSession = async () => {
  const res = await api.get("/auth/session");
  return res.data;
};

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await api.post("/auth/register", userData);
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export default api;
