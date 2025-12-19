/**
 * Global Cache Manager - Manages shared data across all games
 * Tracks cache hits/misses and coordinates data sharing between game components
 */

import {
  getMillisecondsUntilMidnight,
  getYYYYMMDD,
  isCachedToday,
} from "./cacheHelpers";

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === "true";

// In-memory cache that persists across component mounts
const globalCache = {
  clubs: { data: null, timestamp: null, source: null, cacheDay: null },
  players: { data: null, timestamp: null, source: null, cacheDay: null },
  coaches: { data: null, timestamp: null, source: null, cacheDay: null },
  leagues: { data: null, timestamp: null, source: null, cacheDay: null },
};

const CACHE_DURATION = () => getMillisecondsUntilMidnight();

export const cacheManager = {
  // Set data in global cache
  set(key, data, source = "api") {
    if (!globalCache[key]) return;
    globalCache[key] = {
      data,
      timestamp: Date.now(),
      source,
      cacheDay: getYYYYMMDD(), // Track cache day
    };
    this.logCacheStatus(`${key} SET from ${source}`);
  },

  // Get data from global cache
  get(key) {
    if (!globalCache[key]?.data) return null;
    const { data, timestamp, cacheDay } = globalCache[key];

    const isToday = cacheDay && isCachedToday(cacheDay);
    const withinTimeLimit = Date.now() - timestamp < CACHE_DURATION();

    if (!isToday || !withinTimeLimit) {
      globalCache[key] = {
        data: null,
        timestamp: null,
        source: null,
        cacheDay: null,
      };
      return null;
    }
    return data;
  },

  // Check if key is cached and valid
  has(key) {
    return this.get(key) !== null;
  },

  // Get cache status for debugging
  getStatus() {
    const status = {};
    for (const [key, value] of Object.entries(globalCache)) {
      status[key] = {
        cached: value.data !== null,
        count: value.data ? value.data.length : 0,
        source: value.source,
        age: value.timestamp
          ? Math.round((Date.now() - value.timestamp) / 1000) + "s"
          : "N/A",
      };
    }
    return status;
  },

  // Log cache status
  logCacheStatus(action = "") {
    if (!DEBUG_ENABLED) return;
    const status = this.getStatus();
    console.log(
      `%c[GLOBAL CACHE] ${action}`,
      "color: #8b5cf6; font-weight: bold; background: #1f2937; padding: 2px 4px",
      status
    );
  },

  // Clear cache
  clear(key = null) {
    if (key) {
      globalCache[key] = {
        data: null,
        timestamp: null,
        source: null,
        cacheDay: null,
      };
    } else {
      Object.keys(globalCache).forEach((k) => {
        globalCache[k] = {
          data: null,
          timestamp: null,
          source: null,
          cacheDay: null,
        };
      });
    }
  },
};
