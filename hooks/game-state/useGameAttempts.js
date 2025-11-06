"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { gameStatsApi } from "@/services/gameStatsApi";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { useUserStore } from "@/stores/userStore";

export const useGameAttempts = (clubId = null) => {
  const user = useUserStore((state) => state.user);
  const {
    isLoading,
    error,
    setLastAttempts,
    setLoading,
    setError,
    needsRefresh,
    clearAttempts,
    forceRefresh,
    getClubData,
    allAttemptsFetched,
  } = useGameAttemptsStore();

  const clubData = getClubData(clubId);

  const shouldFetch = !allAttemptsFetched && needsRefresh(clubId);

  const query = useQuery({
    queryKey: ["gameAttempts", user?.id, clubId, new Date().toDateString()],
    queryFn: async () => {
      console.log(
        "[v0] Fetching game attempts from API for club:",
        clubId || "null"
      );
      const data = await gameStatsApi.getUserStats(clubId);
      return data;
    },
    enabled: !!user && shouldFetch, // Only fetch if needed
    retry: 1,
    staleTime: 1000 * 60 * 60 * 2, // 2 horas
    refetchOnMount: false, // Don't refetch on mount if we have all attempts
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      console.log(
        "[v0] Setting last attempts for club:",
        clubId || "null",
        query.data
      );
      setLastAttempts(clubId, query.data);
    }
  }, [query.data, clubId, setLastAttempts]);

  // Manejar errores
  useEffect(() => {
    if (query.error) setError(query.error.message);
  }, [query.error, setError]);

  // Limpiar datos si no hay usuario
  useEffect(() => {
    if (!user) clearAttempts();
  }, [user, clearAttempts]);

  // Manejar loading state
  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  return {
    lastAttempts: clubData?.lastAttempts || {},
    totalGames: clubData?.totalGames || 0,
    lastUpdated: clubData?.lastUpdated || null,
    isLoading: isLoading || query.isLoading,
    error: error || query.error,
    refetch: query.refetch,
    forceRefresh: () => forceRefresh(clubId),
    getLastAttempt: (gameType) =>
      useGameAttemptsStore.getState().getLastAttempt(clubId, gameType),
    wasPlayedToday: (gameType) =>
      useGameAttemptsStore.getState().wasPlayedToday(clubId, gameType),
    getCurrentStreak: (gameType) =>
      useGameAttemptsStore.getState().getCurrentStreak(clubId, gameType),
    getBestScore: (gameType) =>
      useGameAttemptsStore.getState().getBestScore(clubId, gameType),
    updateAttempt: (gameType, attemptData) =>
      useGameAttemptsStore
        .getState()
        .updateAttempt(clubId, gameType, attemptData),
  };
};
