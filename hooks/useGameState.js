"use client";

import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";

export const useGameState = (gameType) => {
  const {
    getLastAttempt,
    wasPlayedToday,
    getCurrentStreak,
    getBestScore,
    updateAttempt,
  } = useGameAttempts();

  const lastAttempt = getLastAttempt(gameType);
  const playedToday = wasPlayedToday(gameType);
  const currentStreak = getCurrentStreak(gameType);
  const bestScore = getBestScore(gameType);

  // Determinar qué pantalla mostrar
  const shouldShowEndScreen = playedToday && lastAttempt;
  const shouldShowStartScreen = !playedToday;

  // Datos del último intento para mostrar en endscreen
  const lastAttemptData = lastAttempt
    ? {
        score: lastAttempt.score || 0,
        won: lastAttempt.won || false,
        streak: lastAttempt.streak || 0,
        recordScore: lastAttempt.recordScore || 0,
        timeUsed: lastAttempt.timeUsed || 0,
        livesRemaining: lastAttempt.livesRemaining || 0,
        gameData: lastAttempt.gameData || {},
        date: lastAttempt.date || lastAttempt.createdAt,
      }
    : null;

  // Función para actualizar después de jugar
  const handleGameComplete = (newAttemptData) => {
    updateAttempt(gameType, newAttemptData);
  };

  return {
    // Estado del juego
    lastAttempt: lastAttemptData,
    playedToday,
    currentStreak,
    bestScore,

    // Lógica de pantallas
    shouldShowEndScreen,
    shouldShowStartScreen,

    // Acciones
    handleGameComplete,
  };
};
