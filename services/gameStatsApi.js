import axios from "axios";
import { debugLog } from "../utils/debugLogger";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    debugLog.apiRequest(
      config.method,
      config.url,
      config.params,
      "gameStatsApi"
    );
    const timestamp = performance.now();
    config.metadata = { startTime: timestamp };
    // console.log("🔥 [REQ] →", config.method?.toUpperCase(), config.url);
    // console.log("🔥 Cookies enviados:", document.cookie ? "Yes" : "None");
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => {
    const duration = performance.now() - (res.config.metadata?.startTime || 0);
    const dataSize = JSON.stringify(res.data).length;

    debugLog.apiResponse(res.config.url, res.data);
    debugLog.fetchOperation(
      res.config.method,
      res.config.url,
      res.status,
      duration,
      dataSize
    );
    debugLog.performanceMetric(
      `gameStatsApi_${res.config.method}_response`,
      duration,
      "ms",
      1000
    );

    // console.log(
    //   "🟢 [RES OK] ←",
    //   res.config.url,
    //   res.status,
    //   `(${duration.toFixed(2)}ms)`
    // );
    return res;
  },
  (err) => {
    debugLog.apiError(err.config?.url, err, "gameStatsApi");
    debugLog.errorTracking("gameStatsApi_response_error", err, {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
    });
    console.log(
      "🔴 [RES ERROR] ←",
      err.config?.url,
      err.response?.status,
      err.message
    );
    return Promise.reject(err);
  }
);

export const gameStatsApi = {
  async getAllUserAttempts() {
    try {
      debugLog.asyncOperation("getAllUserAttempts", "start");
      const response = await api.get("/home/stats/all");
      debugLog.asyncOperation("getAllUserAttempts", "complete", null, {
        dataItems: response.data?.attemptsByClub
          ? Object.keys(response.data.attemptsByClub).length
          : 0,
      });
      return response.data || null;
    } catch (error) {
      debugLog.errorTracking("getAllUserAttempts", error);
      console.error("[v0] Error fetching all user attempts:", error);
      return null;
    }
  },

  async updateGameAttempt(gameType, attemptData) {
    try {
      debugLog.asyncOperation("updateGameAttempt", "start", null, { gameType });
      const response = await api.post(
        `/games/${gameType}/attempt`,
        attemptData
      );
      debugLog.asyncOperation("updateGameAttempt", "complete", null, {
        gameType,
        successful: true,
      });
      return response.data || null;
    } catch (error) {
      debugLog.errorTracking("updateGameAttempt", error, { gameType });
      console.error("[v0] Error updating game attempt:", error);
      throw error;
    }
  },
};
