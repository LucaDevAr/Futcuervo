"use client";

import { useEffect, useMemo, useState } from "react";
import { debugLog } from "@/utils/debugLogger";
import { useLocalGameAttemptsStore } from "@/stores/localGameAttemptsStore";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { useUserStore } from "@/stores/userStore";

export default function useUnifiedGameStats(clubId) {
  const [source, setSource] = useState("loading");

  // 🔐 AUTH
  const user = useUserStore((s) => s.user);
  const isAuthenticated = !!user;

  // 📦 LOCAL STATS
  const localClubData = useLocalGameAttemptsStore(
    (state) => state.clubs[clubId || "null"]
  );

  // 🌐 ONLINE STATS
  const onlineClubData = useGameAttemptsStore((state) => state.clubs[clubId]);

  /**
   * 🧠 SOURCE RESOLUTION
   * - Server → solo si hay usuario logueado
   * - Local → fallback siempre válido
   * - Empty → nada disponible
   */
  useEffect(() => {
    let nextSource = "empty";

    if (isAuthenticated) {
      // 🔒 LOGUEADO → SOLO SERVER O EMPTY
      if (onlineClubData) {
        nextSource = "server";
      } else {
        nextSource = "empty";
      }
    } else {
      // 📴 NO LOGUEADO → LOCAL
      if (localClubData) {
        nextSource = "local";
      } else {
        nextSource = "empty";
      }
    }

    if (nextSource !== source) {
      setSource(nextSource);
    }
  }, [isAuthenticated, onlineClubData, localClubData, clubId]);

  /**
   * 📤 DATA EXPOSURE (MEMOIZED)
   */
  const { lastAttempts, totalGames } = useMemo(() => {
    if (source === "server") {
      return {
        lastAttempts: onlineClubData?.lastAttempts || {},
        totalGames: onlineClubData?.totalGames || 0,
      };
    }

    if (source === "local") {
      return {
        lastAttempts: localClubData?.lastAttempts || {},
        totalGames: localClubData?.totalGames || 0,
      };
    }

    return { lastAttempts: {}, totalGames: 0 };
  }, [source, onlineClubData, localClubData]);

  /**
   * 📊 PERFORMANCE LOG
   */
  useEffect(() => {
    if (
      source !== "loading" &&
      (Object.keys(lastAttempts).length > 0 || totalGames > 0)
    ) {
      // debugLog.performanceMetric(
      //   `unifiedGameStats_${clubId || "global"}`,
      //   Object.keys(lastAttempts).length,
      //   "games",
      //   5
      // );
    }
  }, [source, lastAttempts, totalGames, clubId]);

  return {
    source,
    lastAttempts,
    totalGames,
    isLoading: source === "loading",
    isEmpty: source === "empty",
  };
}
