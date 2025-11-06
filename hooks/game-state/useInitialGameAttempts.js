"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { gameStatsApi } from "@/services/gameStatsApi";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { useUserStore } from "@/stores/userStore";

/**
 * Hook to fetch ALL user attempts on initial load
 * This runs once when the user is logged in and caches all attempts
 */
export const useInitialGameAttempts = () => {
  const user = useUserStore((state) => state.user);
  const { setAllAttempts, allAttemptsFetched, clearAttempts } =
    useGameAttemptsStore();

  const query = useQuery({
    queryKey: ["allGameAttempts", user?.id],
    queryFn: async () => {
      console.log("[v0] Fetching ALL game attempts from API");
      const data = await gameStatsApi.getAllUserAttempts();
      return data;
    },
    enabled: !!user && !allAttemptsFetched, // Only fetch if user exists and we haven't fetched yet
    retry: 1,
    staleTime: 1000 * 60 * 60 * 2, // 2 hours
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (query.data?.attemptsByClub) {
      console.log(
        "[v0] Setting all attempts in store:",
        query.data.attemptsByClub
      );
      setAllAttempts(query.data.attemptsByClub);
    }
  }, [query.data, setAllAttempts]);

  // Clear attempts if user logs out
  useEffect(() => {
    if (!user) {
      clearAttempts();
    }
  }, [user, clearAttempts]);

  return {
    isLoading: query.isLoading,
    error: query.error,
    allAttemptsFetched,
  };
};
