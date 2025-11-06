"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dailyGamesApi } from "@/services/dailyGamesApi";
import { useDailyGamesStore } from "@/stores/dailyGamesStore";

/**
 * Hook to get daily games for a specific club
 * Uses cached data if available, fetches from API if needed
 * @param {string|null} clubId - Club ID or null for global games
 */
export const useDailyGames = (clubId = null) => {
  const {
    isLoading,
    error,
    setClubGames,
    setLoading,
    setError,
    needsRefresh,
    clearGames,
    forceRefresh,
    getClubGames,
    getGame,
  } = useDailyGamesStore();

  const clubGames = getClubGames(clubId);

  const query = useQuery({
    queryKey: ["dailyGames", clubId, new Date().toDateString()],
    queryFn: async () => {
      console.log(
        "[v0] Fetching daily games from API for club:",
        clubId || "null"
      );
      const data = await dailyGamesApi.getDailyGames(clubId);
      return data;
    },
    enabled: needsRefresh(clubId),
    retry: 1,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data) {
      setClubGames(clubId, query.data);
    }
  }, [query.data, clubId, setClubGames]);

  useEffect(() => {
    if (query.error) setError(query.error.message);
  }, [query.error, setError]);

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  return {
    games: clubGames || {},
    shirtGame: clubGames?.shirtGame || null,
    careerGame: clubGames?.careerGame || null,
    playerGame: clubGames?.playerGame || null,
    videoGame: clubGames?.videoGame || null,
    songGame: clubGames?.songGame || null,
    historyGame: clubGames?.historyGame || null,
    isLoading: isLoading || query.isLoading,
    error: error || query.error,
    refetch: query.refetch,
    forceRefresh: () => forceRefresh(clubId),
    getGame: (gameType) => getGame(clubId, gameType),
  };
};
