"use client";

import { useState, useEffect, useCallback } from "react";
import { useGameStats } from "./game-state/useGameStats";
import { gameStatsApi } from "@/services/gameStatsApi";
import { calculateGameStats } from "@/utils/gameStatsCalculator";
import { isToday } from "@/utils/dateHelpers";
import { toast } from "sonner";

export const useGameFlow = (gameType) => {
  const { stats, isLoading: statsLoading } = useGameStats();
  const [gameState, setGameState] = useState("loading"); // loading, start, playing, end
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [gameData, setGameData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Obtener el último intento de este tipo de juego
  const lastAttempt = stats?.[gameType];

  // Determinar el estado inicial del juego
  useEffect(() => {
    if (statsLoading) return;

    if (lastAttempt && isToday(lastAttempt.date || lastAttempt.createdAt)) {
      // Ya jugó hoy, mostrar end screen
      setGameState("end");
      setCurrentAttempt(lastAttempt);
      setGameData(lastAttempt.gameData);
    } else {
      // No jugó hoy, mostrar start screen
      setGameState("start");
    }
  }, [lastAttempt, statsLoading]);

  // Iniciar nuevo juego
  const startGame = useCallback(() => {
    setGameState("playing");
    setCurrentAttempt(null);
    setGameData(null);
  }, []);

  // Finalizar juego y guardar resultado
  const endGame = useCallback(
    async (gameResult) => {
      if (isUpdating) return; // Prevenir doble guardado

      setIsUpdating(true);

      try {
        // Calcular estadísticas (racha/record score)
        const calculatedStats = calculateGameStats({
          currentResult: gameResult,
          lastAttempt,
          gameType,
        });

        // Preparar datos para guardar
        const attemptData = {
          gameType,
          won: gameResult.won,
          score: gameResult.score || 0,
          timeUsed: gameResult.timeUsed || 0,
          livesRemaining: gameResult.livesRemaining || 0,
          gameMode: gameResult.gameMode || "daily",
          gameData: gameResult.gameData || {},
          ...calculatedStats, // streak, recordScore
        };

        // Guardar en el backend
        const savedAttempt = await gameStatsApi.updateGameAttempt(
          gameType,
          attemptData
        );

        // Actualizar estado local
        setCurrentAttempt(savedAttempt);
        setGameData(gameResult.gameData);
        setGameState("end");

        toast.success(gameResult.won ? "¡Felicitaciones!" : "Juego completado");
      } catch (error) {
        console.error("Error saving game result:", error);
        toast.error("Error al guardar el resultado");
      } finally {
        setIsUpdating(false);
      }
    },
    [lastAttempt, gameType, isUpdating]
  );

  return {
    gameState,
    currentAttempt,
    gameData,
    isLoading: statsLoading || isUpdating,
    startGame,
    endGame,
    // Helpers para los componentes
    shouldShowEndScreen: gameState === "end",
    shouldShowStartScreen: gameState === "start",
    shouldShowGameScreen: gameState === "playing",
  };
};
