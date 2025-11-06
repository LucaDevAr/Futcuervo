import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    console.log("[v0] Daily Games API - Outgoing request:", {
      url: config.url,
      method: config.method,
    });
    return config;
  },
  (error) => {
    console.error("[v0] Daily Games API - Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("[v0] Daily Games API - Response received:", {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("[v0] Daily Games API - Response error:", {
      status: error.response?.status,
      data: error.response?.data,
    });
    return Promise.reject(error);
  }
);

export const dailyGamesApi = {
  /**
   * Get all daily games for all clubs (initial load)
   */
  async getAllDailyGames() {
    try {
      console.log("[v0] Fetching ALL daily games for all clubs");
      const response = await api.get("/games/daily/all");
      console.log("[v0] All daily games response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching all daily games:", error);
      return null;
    }
  },

  /**
   * Get daily games for a specific club
   */
  async getDailyGames(clubId) {
    try {
      console.log("[v0] Fetching daily games for clubId:", clubId);
      const response = await api.get("/games/daily", {
        params: { clubId },
      });
      console.log("[v0] Daily games response:", response.data);
      return response.data;
    } catch (error) {
      console.error("[v0] Error fetching daily games:", error);
      return null;
    }
  },
};
