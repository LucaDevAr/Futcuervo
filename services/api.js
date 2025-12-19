// frontend/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: (process.env.NEXT_PUBLIC_BASE_URL || "") + "/api",
  withCredentials: true,
});

export const fetchUserSession = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const postLogin = async (payload) => {
  const res = await api.post("/auth/login", payload);
  return res.data;
};

export const postLogout = async () => {
  const res = await api.post("/auth/logout");
  return res.data;
};

export const refreshAccessToken = async () => {
  const res = await api.post("/auth/refresh");
  return res.data;
};

export default api;
