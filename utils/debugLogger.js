/**
 * Centralized debug logger for API calls
 * Enable with NEXT_PUBLIC_DEBUG=true environment variable
 */

const DEBUG_ENABLED = process.env.NEXT_PUBLIC_DEBUG === "true";

export const debugLog = {
  // Log API requests
  apiRequest(method, endpoint, params = null, source = "") {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[API REQUEST] ${method.toUpperCase()} %c${endpoint}`,
      "color: #38bdf8; font-weight: bold",
      "color: #60a5fa",
      {
        source,
        params,
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log API responses
  apiResponse(endpoint, data, duration = null) {
    if (!DEBUG_ENABLED) return;
    const count = Array.isArray(data) ? data.length : Object.keys(data).length;
    console.log(
      `%c[API RESPONSE] ✓ ${endpoint}`,
      "color: #22c55e; font-weight: bold",
      {
        itemsCount: count,
        duration: duration ? `${duration.toFixed(2)}ms` : "N/A",
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log API errors
  apiError(endpoint, error, source = "") {
    if (!DEBUG_ENABLED) return;
    console.error(
      `%c[API ERROR] ✗ ${endpoint}`,
      "color: #ef4444; font-weight: bold",
      {
        error: error.message,
        source,
        timestamp: new Date().toISOString(),
      }
    );
  },

  stateUpdate(source, state, previousState = null, affectedFields = []) {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[STATE UPDATE] ${source}`,
      "color: #f97316; font-weight: bold",
      {
        previousState,
        newState: state,
        changedFields: affectedFields,
        timestamp: new Date().toISOString(),
      }
    );
  },

  effectExecution(effectName, dependencies = [], action = "run") {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[EFFECT ${action.toUpperCase()}] ${effectName}`,
      "color: #6366f1; font-weight: bold",
      {
        dependencies,
        timestamp: new Date().toISOString(),
      }
    );
  },

  dataFlow(from, to, dataType, itemCount = 0) {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[DATA FLOW] ${dataType}`,
      "color: #14b8a6; font-weight: bold",
      {
        from,
        to,
        items: itemCount,
        timestamp: new Date().toISOString(),
      }
    );
  },

  asyncOperation(operationName, status = "start", duration = null, data = {}) {
    if (!DEBUG_ENABLED) return;
    const statusColor =
      status === "start"
        ? "#60a5fa"
        : status === "complete"
        ? "#22c55e"
        : "#ef4444";
    const statusLabel = status.toUpperCase();
    console.log(
      `%c[ASYNC ${statusLabel}] ${operationName}`,
      `color: ${statusColor}; font-weight: bold`,
      {
        duration: duration ? `${duration.toFixed(2)}ms` : "N/A",
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  },

  conditionalLogic(source, condition, result, context = {}) {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[CONDITION] ${source}`,
      `color: ${result ? "#22c55e" : "#ef4444"}; font-weight: bold`,
      {
        condition,
        result,
        ...context,
        timestamp: new Date().toISOString(),
      }
    );
  },

  fetchOperation(method, url, status, responseTime = null, dataSize = null) {
    if (!DEBUG_ENABLED) return;
    const statusColor =
      status >= 200 && status < 300
        ? "#22c55e"
        : status >= 400
        ? "#ef4444"
        : "#f59e0b";
    console.log(
      `%c[FETCH] ${method} ${status}`,
      `color: ${statusColor}; font-weight: bold`,
      {
        url,
        responseTime: responseTime ? `${responseTime.toFixed(2)}ms` : "N/A",
        dataSize: dataSize ? `${(dataSize / 1024).toFixed(2)}KB` : "N/A",
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Data caching
  cacheHit(dataType, source = "") {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[CACHE HIT] ${dataType}`,
      "color: #8b5cf6; font-weight: bold",
      {
        source,
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log cache misses
  cacheMiss(dataType, source = "") {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[CACHE MISS] ${dataType}`,
      "color: #f59e0b; font-weight: bold",
      {
        source,
        willFetch: true,
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log store updates
  storeUpdate(storeName, data) {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[STORE UPDATE] ${storeName}`,
      "color: #ec4899; font-weight: bold",
      {
        itemsUpdated: Array.isArray(data) ? data.length : 1,
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log hook mount/unmount
  hookLifecycle(hookName, event, data = {}) {
    if (!DEBUG_ENABLED) return;
    const color =
      event === "mount"
        ? "#10b981"
        : event === "unmount"
        ? "#f87171"
        : "#06b6d4";
    console.log(
      `%c[HOOK ${event.toUpperCase()}] ${hookName}`,
      `color: ${color}; font-weight: bold`,
      {
        ...data,
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log preload events
  preload(dataTypes, source = "") {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[PRELOAD] Loading ${dataTypes.join(", ")}`,
      "color: #06b6d4; font-weight: bold",
      {
        source,
        count: dataTypes.length,
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log backend cache status
  backendCacheStatus(endpoint, cacheSource = "api", hitRate = null) {
    if (!DEBUG_ENABLED) return;
    const cacheColor = cacheSource === "redis" ? "#ef4444" : "#f59e0b";
    const cacheLabel = cacheSource === "redis" ? "REDIS" : "API";
    console.log(
      `%c[BACKEND CACHE] ${cacheLabel}`,
      `color: ${cacheColor}; font-weight: bold`,
      {
        endpoint,
        source: cacheSource,
        hitRate: hitRate ? `${(hitRate * 100).toFixed(1)}%` : "N/A",
        timestamp: new Date().toISOString(),
      }
    );
  },

  crossGameShare(dataType, sourceGame, targetGame, reuseCount = 0) {
    if (!DEBUG_ENABLED) return;
    console.log(
      `%c[CROSS-GAME SHARE] ${dataType}`,
      "color: #10b981; font-weight: bold; background: #064e3b; padding: 2px 4px",
      {
        from: sourceGame,
        to: targetGame,
        itemsReused: reuseCount,
        timestamp: new Date().toISOString(),
      }
    );
  },

  // Log global cache status dump
  globalCacheSnapshot() {
    if (!DEBUG_ENABLED) return;
    const { cacheManager } = require("./globalCacheManager");
    const status = cacheManager.getStatus();
    console.group(
      "%c📊 GLOBAL CACHE SNAPSHOT",
      "color: #06b6d4; font-weight: bold; font-size: 12px"
    );
    console.table(status);
    console.groupEnd();
  },

  performanceMetric(metricName, value, unit = "ms", threshold = null) {
    if (!DEBUG_ENABLED) return;
    const isExceeded = threshold && value > threshold;
    const color = isExceeded ? "#ef4444" : "#22c55e";
    console.log(
      `%c[PERFORMANCE] ${metricName}`,
      `color: ${color}; font-weight: bold`,
      {
        value: `${value.toFixed(2)}${unit}`,
        threshold: threshold ? `${threshold}${unit}` : "N/A",
        exceeded: isExceeded,
        timestamp: new Date().toISOString(),
      }
    );
  },

  errorTracking(errorName, error, context = {}) {
    if (!DEBUG_ENABLED) return;
    console.error(
      `%c[ERROR TRACKING] ${errorName}`,
      "color: #dc2626; font-weight: bold",
      {
        message: error?.message,
        stack: error?.stack?.split("\n")[0],
        context,
        timestamp: new Date().toISOString(),
      }
    );
  },

  gameEvent(gameType, eventType, eventData = {}) {
    if (!DEBUG_ENABLED) return;
    const colorMap = {
      start: "#3b82f6",
      progress: "#f59e0b",
      end: "#22c55e",
      error: "#ef4444",
    };
    console.log(
      `%c[GAME EVENT] ${gameType.toUpperCase()} - ${eventType}`,
      `color: ${colorMap[eventType] || "#06b6d4"}; font-weight: bold`,
      {
        ...eventData,
        timestamp: new Date().toISOString(),
      }
    );
  },
};
