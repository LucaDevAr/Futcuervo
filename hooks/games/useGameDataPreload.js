"use client";

import { useState, useEffect } from "react";
import { debugLog } from "../../utils/debugLogger";
import { cacheManager } from "../../utils/globalCacheManager";
import {
  getMillisecondsUntilMidnight,
  getYYYYMMDD,
  isCachedToday,
} from "../../utils/cacheHelpers";

const CACHE_DURATION = () => getMillisecondsUntilMidnight();
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const CACHE_KEYS = {
  players: "futcuervo_players_cache",
  coaches: "futcuervo_coaches_cache",
  leagues: "futcuervo_leagues_cache",
  clubs: "futcuervo_clubs_cache",
};

export function useGameDataPreload({
  needPlayers = false,
  needCoaches = false,
  needLeagues = false,
  needClubs = false,
  clubId = null,
  skip = false,
}) {
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (skip) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load(key, url, setState, keyWithClub = false) {
      const cacheKey =
        keyWithClub && clubId
          ? `${CACHE_KEYS[key]}:${clubId}`
          : CACHE_KEYS[key];

      const cachedFromGlobal = cacheManager.get(key);
      if (cachedFromGlobal) {
        debugLog.crossGameShare(
          key,
          "previous-game",
          "current-game",
          cachedFromGlobal.length
        );
        if (!cancelled) {
          debugLog.storeUpdate(`${key}Store`, cachedFromGlobal);
          setState(cachedFromGlobal);
        }
        return;
      }

      let cached = [];
      let valid = false;
      const raw = localStorage.getItem(cacheKey);

      if (raw) {
        const { data, timestamp, cacheDay } = JSON.parse(raw);
        const isToday = cacheDay && isCachedToday(cacheDay);
        const withinTimeLimit =
          timestamp && Date.now() - timestamp < CACHE_DURATION();

        if (isToday && withinTimeLimit) {
          valid = true;
          debugLog.cacheHit(
            `${key} (${data.length} items)`,
            "useGameDataPreload"
          );
        } else if (!isToday) {
          debugLog.cacheMiss(
            `${key} (outdated - old day)`,
            "useGameDataPreload"
          );
        }
        cached = data;
      }

      let fresh = [];
      if (!valid) {
        debugLog.cacheMiss(key, "useGameDataPreload");
        debugLog.apiRequest("GET", url, null, "useGameDataPreload");

        // console.log(
        //   `%c[FETCH] useGameDataPreload - ${key}`,
        //   "color: #00d8ff; font-weight: bold",
        //   {
        //     url,
        //     cacheKey,
        //     clubId: clubId || "N/A",
        //   }
        // );

        const startTime = performance.now();
        const res = await fetch(url);
        const json = await res.json();
        fresh = json?.[key] || json || [];
        const duration = performance.now() - startTime;

        // console.log(
        //   `%c[FETCH RESPONSE] useGameDataPreload - ${key}`,
        //   "color: #4ade80; font-weight: bold",
        //   {
        //     url,
        //     itemsReceived: fresh.length,
        //     duration: `${duration.toFixed(2)}ms`,
        //     cacheSource: res.headers.get("X-Cache-Source") || "api",
        //   }
        // );

        debugLog.apiResponse(url, fresh, duration);

        const cacheSource = res.headers.get("X-Cache-Source") || "api";
        if (cacheSource === "redis") {
          debugLog.backendCacheStatus(
            url,
            "redis",
            Number.parseFloat(res.headers.get("X-Cache-Hit-Rate"))
          );
        }
      }

      const merged = [
        ...new Map([...cached, ...fresh].map((i) => [i._id, i])).values(),
      ];

      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          data: merged,
          timestamp: Date.now(),
          cacheDay: getYYYYMMDD(),
        })
      );

      cacheManager.set(key, merged, valid ? "localStorage" : "api");

      if (!cancelled) {
        debugLog.storeUpdate(`${key}Store`, merged);
        setState(merged);
      }
    }

    async function preload() {
      try {
        setIsLoading(true);

        const toLoad = [];
        if (needClubs) toLoad.push("clubs");
        if (needPlayers) toLoad.push("players");
        if (needCoaches) toLoad.push("coaches");
        if (needLeagues) toLoad.push("leagues");
        debugLog.preload(toLoad, "useGameDataPreload");

        if (needClubs) await load("clubs", `${BASE_URL}/api/clubs`, setClubs);

        if (needPlayers)
          await load(
            "players",
            clubId
              ? `${BASE_URL}/api/players/by-club-id?clubId=${clubId}`
              : `${BASE_URL}/api/players`,
            setPlayers,
            true
          );

        if (needCoaches)
          await load(
            "coaches",
            clubId
              ? `${BASE_URL}/api/coaches/by-club-id?clubId=${clubId}`
              : `${BASE_URL}/api/coaches`,
            setCoaches,
            true
          );

        if (needLeagues)
          await load("leagues", `${BASE_URL}/api/leagues`, setLeagues);

        debugLog.globalCacheSnapshot();
      } catch (err) {
        if (!cancelled) {
          debugLog.apiError("preload", err, "useGameDataPreload");
          setError(err.message);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    preload();
    return () => (cancelled = true);
  }, [needPlayers, needCoaches, needLeagues, needClubs, clubId, skip]);

  return { players, coaches, leagues, clubs, isLoading, error };
}
