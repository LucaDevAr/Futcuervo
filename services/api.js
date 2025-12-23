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
  try {
    const res = await api.post("/auth/refresh");
    console.log("refreshAccessToken response:", res);
    return res.data;
  } catch (err) {
    console.log(
      "refreshAccessToken error:",
      err.response?.status,
      err.response?.data
    );
    return { ok: false, status: err.response?.status || 500 };
  }
};

export default api;
