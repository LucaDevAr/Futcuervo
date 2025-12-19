import axios from "axios";
import { debugLog } from "@/utils/debugLogger";

const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    debugLog.apiRequest(
      config.method,
      config.url,
      config.params,
      "dailyGamesApi"
    );
    debugLog.asyncOperation(
      `fetch_${config.method}_${config.url}`,
      "start",
      null,
      {
        url: config.url,
        method: config.method,
      }
    );
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const dataSize = JSON.stringify(response.data).length;
    debugLog.apiResponse(response.config.url, response.data);
    debugLog.fetchOperation(
      response.config.method,
      response.config.url,
      response.status,
      null,
      dataSize
    );
    debugLog.asyncOperation(
      `fetch_${response.config.method}_${response.config.url}`,
      "complete",
      null,
      {
        status: response.status,
        dataSize,
      }
    );
    return response;
  },
  (error) => {
    debugLog.apiError(error.config?.url, error, "dailyGamesApi");
    debugLog.errorTracking("dailyGamesApi_error", error, {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
    });
    debugLog.asyncOperation(
      `fetch_${error.config?.method}_${error.config?.url}`,
      "error",
      null,
      {
        error: error.message,
        status: error.response?.status,
      }
    );
    return Promise.reject(error);
  }
);

export const dailyGamesApi = {
  /**
   * Get all daily games for all clubs (initial load)
   */
  async getAllDailyGames() {
    // console.groupCollapsed("%c[API] GET /games/daily/all", "color:#38bdf8");

    try {
      const start = performance.now();

      debugLog.preload(
        ["career", "player", "shirt", "video", "song"],
        "dailyGamesApi.getAllDailyGames"
      );

      // console.log(
      //   "%c[API] Request →",
      //   "color:#93c5fd",
      //   `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/daily/all`
      // );

      const res = await api.get("/games/daily/all");

      // console.log("%c[API] Status:", "color:#a78bfa", res.status);
      // console.log("%c[API] Data:", "color:#22c55e", res.data);

      const duration = performance.now() - start;
      // console.log(`%c[API] Time: ${duration.toFixed(2)}ms`, "color:#4ade80");

      debugLog.apiResponse("getAllDailyGames", res.data, duration);
      debugLog.performanceMetric("getAllDailyGames", duration, "ms", 1000);

      // console.groupEnd();
      return res.data;
    } catch (err) {
      console.error("%c[API] ERROR!", "color:red; font-weight:bold", err);
      debugLog.apiError("getAllDailyGames", err, "dailyGamesApi");
      // console.groupEnd();
      return null;
    }
  },

  /**
   * Get daily games for a specific club
   */
  async getDailyGames(clubId) {
    const start = performance.now();
    try {
      debugLog.preload(
        ["career", "player", "shirt", "video"],
        `dailyGamesApi.getDailyGames(${clubId || "global"})`
      );

      const response = await api.get("/games/daily", {
        params: { clubId },
      });

      const duration = performance.now() - start;
      debugLog.apiResponse("getDailyGames", response.data, duration);
      debugLog.performanceMetric(
        `getDailyGames_${clubId || "global"}`,
        duration,
        "ms",
        1000
      );

      return response.data;
    } catch (error) {
      debugLog.apiError("getDailyGames", error, "dailyGamesApi");
      console.error("[v0] Error fetching daily games:", error);
      return null;
    }
  },
};
