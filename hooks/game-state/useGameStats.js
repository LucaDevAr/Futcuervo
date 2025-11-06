"use client";

import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameStats } from "@/hooks/game-state/useLocalGameStats";
import { useUserStore } from "@/stores/userStore";

export const useGameStats = (clubId) => {
  const user = useUserStore((state) => state.user);
  const localStats = useLocalGameStats();
  // 🔥 Ahora le pasamos el clubId a useGameAttempts
  const { lastAttempts, totalGames, isLoading, error } =
    useGameAttempts(clubId);

  // Convertir lastAttempts a formato para GameGrid
  const convertToGameGridStats = (attempts) => {
    const gameTypes = [
      "national",
      "league",
      "shirt",
      "player",
      "history",
      "video",
      "career",
      "appearances",
      "goals",
      "song",
    ];

    const stats = {};

    gameTypes.forEach((gameType) => {
      const attempt = attempts[gameType];
      if (attempt) {
        stats[gameType] = {
          ...attempt,
          streak: attempt.streak || 0,
          recordScore: attempt.recordScore || attempt.score || 0,
          won: attempt.won || false,
          date: attempt.date || attempt.createdAt,
          score: attempt.score || 0,
          timeUsed: attempt.timeUsed || 0,
          livesRemaining: attempt.livesRemaining || 0,
          gameData: attempt.gameData || {},
          gameMode: attempt.gameMode || "daily",
          _id: attempt._id,
        };
      } else {
        stats[gameType] = null;
      }
    });

    return stats;
  };

  const createEmptyStats = () => {
    const gameTypes = [
      "national",
      "league",
      "shirt",
      "player",
      "history",
      "video",
      "career",
      "appearances",
      "goals",
      "song",
    ];
    return Object.fromEntries(gameTypes.map((g) => [g, null]));
  };

  let stats;
  if (user && lastAttempts) {
    stats = convertToGameGridStats(lastAttempts);
  } else if (!user && localStats && localStats.gameStats) {
    stats = localStats.gameStats;
  } else {
    stats = createEmptyStats();
  }

  return {
    stats,
    isLoading,
    error,
    totalGames: user ? totalGames : localStats?.totalGames || 0,
  };
};
