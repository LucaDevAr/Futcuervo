"use client";

import { useState, useEffect } from "react";
import { useLocalGameAttemptsStore } from "@/stores/localGameAttemptsStore";

export const useLocalGameStats = (clubId = null) => {
  const [localStats, setLocalStats] = useState({
    totalGames: 0,
    correctAnswers: 0,
    accuracy: 0,
    lastGames: [],
    gameStats: {
      national: null,
      league: null,
      shirt: null,
      player: null,
      history: null,
      video: null,
      career: null,
      appearances: null,
      goals: null,
      song: null,
    },
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const store = useLocalGameAttemptsStore.getState();
        const clubData = store.getLocalClubData(clubId); // ✅ ahora usa el clubId real

        if (!clubData || !clubData.lastAttempts) return;

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

        let totalGames = 0;
        let correctAnswers = 0;
        const gameStats = {};
        const lastGames = [];

        gameTypes.forEach((gameType) => {
          const attempt = clubData.lastAttempts[gameType];

          if (attempt) {
            gameStats[gameType] = {
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

            totalGames++;
            correctAnswers += attempt.correctAnswers || 0;
          } else {
            gameStats[gameType] = null;
          }
        });

        const accuracy =
          totalGames > 0 ? Math.round((correctAnswers / totalGames) * 100) : 0;

        setLocalStats({
          totalGames,
          correctAnswers,
          accuracy,
          lastGames,
          gameStats,
        });
      } catch (error) {
        console.error("[v0] Error loading local stats:", error);
      }
    }
  }, [clubId]); // ✅ depende del club

  return localStats;
};
