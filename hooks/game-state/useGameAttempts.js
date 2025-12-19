"use client";

import { useEffect } from "react";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { useUserStore } from "@/stores/userStore";

export const useGameAttempts = (clubId = null) => {
  // 🔐 AUTH (SIEMPRE se llama)
  const user = useUserStore((state) => state.user);
  const isAuthenticated = !!user;

  // 📦 STORE (SIEMPRE se llama)
  const { isLoading, error, clearAttempts, forceRefresh, getClubData } =
    useGameAttemptsStore();

  // 📊 DATA (puede ser undefined, pero el hook ya fue llamado)
  const clubData = getClubData(clubId);

  /**
   * 🔄 LOGOUT → limpiar store ONLINE
   */
  useEffect(() => {
    if (!isAuthenticated) {
      clearAttempts();
    }
  }, [isAuthenticated, clearAttempts]);

  /**
   * 🧠 EXPOSICIÓN DE DATOS
   * Si NO hay user → stats vacíos
   */
  const safeClubData = isAuthenticated ? clubData : null;

  return {
    lastAttempts: safeClubData?.lastAttempts || {},
    totalGames: safeClubData?.totalGames || 0,
    lastUpdated: safeClubData?.lastUpdated || null,

    isLoading: isAuthenticated ? isLoading : false,
    error: isAuthenticated ? error : null,

    refetch: () => {
      if (!isAuthenticated) return;
      forceRefresh(clubId);
    },

    forceRefresh: () => {
      if (!isAuthenticated) return;
      forceRefresh(clubId);
    },

    getLastAttempt: (gameType) => {
      if (!isAuthenticated) return null;
      return useGameAttemptsStore.getState().getLastAttempt(clubId, gameType);
    },

    wasPlayedToday: (gameType) => {
      if (!isAuthenticated) return false;
      return useGameAttemptsStore.getState().wasPlayedToday(clubId, gameType);
    },

    getCurrentStreak: (gameType) => {
      if (!isAuthenticated) return 0;
      return useGameAttemptsStore.getState().getCurrentStreak(clubId, gameType);
    },

    getBestScore: (gameType) => {
      if (!isAuthenticated) return 0;
      return useGameAttemptsStore.getState().getBestScore(clubId, gameType);
    },

    updateAttempt: (gameType, attemptData) => {
      if (!isAuthenticated) return;
      useGameAttemptsStore
        .getState()
        .updateAttempt(clubId, gameType, attemptData);
    },
  };
};
