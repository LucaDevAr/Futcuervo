import axios from "axios";

// Use the same configuration as api.js to ensure consistency
const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to log outgoing requests
api.interceptors.request.use(
  (config) => {
    console.log("[v0] Outgoing request:", {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      withCredentials: config.withCredentials,
      headers: config.headers,
    });
    return config;
  },
  (error) => {
    console.error("[v0] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to log responses
api.interceptors.response.use(
  (response) => {
    console.log("[v0] Response received:", {
      status: response.status,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    console.error("[v0] Response interceptor error:", {
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });
    return Promise.reject(error);
  }
);

export const gameStatsApi = {
  async getAllUserAttempts() {
    try {
      console.log("[v0] Fetching ALL user attempts");
      const response = await api.get("/home/stats/all");
      console.log("[v0] All attempts response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching all user attempts:", error);
      return null;
    }
  },

  async getUserStats(clubId) {
    try {
      console.log("[v1] Fetching user stats for clubId:", clubId);
      const response = await api.get("/home/stats/last", {
        params: { clubId },
      });
      console.log("[v1] Stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[v1] Error fetching user stats:", error);
      return null;
    }
  },

  async updateGameAttempt(gameType, attemptData) {
    try {
      const response = await api.post(
        `/games/${gameType}/attempt`,
        attemptData
      );
      return response.data;
    } catch (error) {
      console.error("[v1] Error updating game attempt:", error);
      throw error;
    }
  },
};
