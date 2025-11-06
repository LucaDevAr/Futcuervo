"use client";

import { gameStatsApi } from "@/services/gameStatsApi";
import { calculateGameStats } from "@/utils/gameStatsCalculator";
import { useGameStats } from "@/hooks/game-state/useGameStats";

export const useGameSave = () => {
  const { stats } = useGameStats();

  const saveGame = async (gameData) => {
    try {
      // Obtener el último intento del cache para calcular estadísticas
      const lastAttempt = stats?.[gameData.gameType];

      // Calcular estadísticas usando el cache
      const calculatedStats = calculateGameStats({
        currentResult: gameData,
        lastAttempt,
        gameType: gameData.gameType,
      });

      // Preparar datos para guardar
      const attemptData = {
        gameType: gameData.gameType,
        won: gameData.won,
        score: gameData.score || 0,
        timeUsed: gameData.timeUsed || 0,
        livesRemaining: gameData.livesRemaining || 0,
        gameMode: gameData.gameMode || "daily",
        gameData: gameData.gameData || {},
        streak: calculatedStats.streak,
        recordScore: calculatedStats.recordScore,
        date: new Date(),
      };

      // Guardar en el backend usando la API existente
      const savedAttempt = await gameStatsApi.updateGameAttempt(
        gameData.gameType,
        attemptData
      );

      return savedAttempt;
    } catch (error) {
      console.error("Error saving game:", error);
      throw error;
    }
  };

  return { saveGame };
};
