"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import { useGameLogic } from "./games/useGameLogic";
import { useGameAttempts } from "./game-state/useGameAttempts";
import { GAME_CONFIGS } from "@/constants/gameConfig";

/**
 * Hook genérico optimizado para juegos de "Más o Menos"
 * @param {Object} config - Configuración del juego
 * @param {string} config.gameType - Tipo de juego ('appearances', 'goals', etc.)
 * @param {string} config.statField - Campo de estadística a comparar ('appearances', 'goals', etc.)
 * @param {string} config.gameMode - Modo de juego ('normal', 'time')
 * @param {Function} config.onGameEnd - Callback cuando termina el juego
 */
export function useMoreOrLessGame({
  gameType,
  statField,
  gameMode,
  onGameEnd,
}) {
  // Estados del juego
  const [players, setPlayers] = useState([]);
  const [leftPlayer, setLeftPlayer] = useState(null);
  const [rightPlayer, setRightPlayer] = useState(null);
  const [nextPlayer, setNextPlayer] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [lastGuess, setLastGuess] = useState(null);
  const [gameEndReason, setGameEndReason] = useState("wrong");

  // Estados de animación
  const [showRightPlayerStat, setShowRightPlayerStat] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isCountingAnimation, setIsCountingAnimation] = useState(false);
  const [isCarouselAnimation, setIsCarouselAnimation] = useState(false);
  const [carouselKey, setCarouselKey] = useState(0);

  // Referencias para control del juego
  const nextPlayerRef = useRef(null);
  const usedPlayersRef = useRef(new Set());
  const hasFetchedRef = useRef(false);
  const animationTimerRef = useRef(null);

  // Hook para game attempts
  const { getLastAttempt, refetch: refetchAttempts } = useGameAttempts();

  // Configuración del juego memoizada
  const gameConfig = useMemo(
    () => GAME_CONFIGS[gameType] || GAME_CONFIGS.appearances,
    [gameType]
  );

  // Función para guardar el attempt
  const saveGameAttempt = useCallback(
    async (won, stats, gameData) => {
      try {
        console.log(`[v0] Saving ${gameType} game attempt:`, {
          won,
          stats,
          gameData,
        });

        // Obtener el último attempt para calcular records
        const lastAttempt = getLastAttempt(gameType);
        const previousRecord = lastAttempt?.recordScore || 0;
        const previousStreak = lastAttempt?.streak || 0;

        // Calcular record score y streak
        const recordScore = Math.max(score, previousRecord);
        const streak = won ? previousStreak + 1 : 0;

        const attemptData = {
          gameType,
          gameMode: gameMode || "normal",
          won,
          score,
          recordScore,
          streak,
          timeUsed: stats?.finalTime || 0,
          livesRemaining: stats?.livesRemaining || 0,
          gameData: {
            ...gameData,
            "Puntuación Final": score,
            "Razón de finalización":
              gameEndReason === "time"
                ? "Tiempo agotado"
                : gameEndReason === "completed"
                ? "Jugadores agotados"
                : "Respuesta incorrecta",
            lastGuess,
            jugadores: {
              left: leftPlayer
                ? {
                    fullName: leftPlayer.fullName,
                    displayName: leftPlayer.displayName,
                    [statField]: leftPlayer[statField],
                    actionImage: leftPlayer.actionImage,
                  }
                : null,
              right: rightPlayer
                ? {
                    fullName: rightPlayer.fullName,
                    displayName: rightPlayer.displayName,
                    [statField]: rightPlayer[statField],
                    actionImage: rightPlayer.actionImage,
                  }
                : null,
            },
          },
        };

        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
        const response = await fetch(`${baseUrl}/api/games/${gameType}/save`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(attemptData),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          );
        }

        const result = await response.json();
        console.log(
          `[v0] ${gameType} game attempt saved successfully:`,
          result
        );

        // Refrescar el cache de attempts
        await refetchAttempts();

        return result;
      } catch (error) {
        console.error(`[v0] Error saving ${gameType} game attempt:`, error);
        throw error;
      }
    },
    [
      gameType,
      statField,
      gameMode,
      score,
      leftPlayer,
      rightPlayer,
      lastGuess,
      gameEndReason,
      getLastAttempt,
      refetchAttempts,
    ]
  );

  // Lógica del juego usando useGameLogic
  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: gameConfig.timeLimit,
    initialLives: gameConfig.lives,
    onGameEnd: useCallback(
      async (won, stats) => {
        console.log(`[v0] ${gameType} game ended:`, { won, stats });
        try {
          await saveGameAttempt(won, stats, {});
          if (onGameEnd) {
            onGameEnd(won, stats, {});
          }
        } catch (error) {
          console.error(`[v0] Error in game end callback:`, error);
        }
      },
      [gameType, saveGameAttempt, onGameEnd]
    ),
  });

  // Función optimizada para obtener jugadores desde la API
  const fetchPlayers = useCallback(async () => {
    if (hasFetchedRef.current) {
      console.log(`[v0] ${gameType} players already fetched, skipping`);
      return;
    }

    try {
      setLoading(true);
      setFetchError(null);

      const baseUrl =
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(`${baseUrl}/api/games/${gameType}/players`, {
        cache: "no-store",
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      clearTimeout(timeoutId);

      console.log(`[v0] ${gameType} fetch response status:`, response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Error al cargar jugadores: ${response.status}`
        );
      }

      const data = await response.json();
      console.log(`[v0] ${gameType} received data:`, data?.length, "players");

      if (!Array.isArray(data)) {
        console.error(
          `[v0] ${gameType} data is not an array:`,
          typeof data,
          data
        );
        throw new Error("Los datos recibidos no son válidos");
      }

      if (data.length < 3) {
        throw new Error(
          `No hay suficientes jugadores con datos de ${statField}`
        );
      }

      hasFetchedRef.current = true;
      setPlayers(data);
      initializeGamePlayers(data);
    } catch (error) {
      console.error(`[v0] Error fetching ${gameType} players:`, error);

      if (error.name === "AbortError") {
        setFetchError("Tiempo de espera agotado. Verifica tu conexión.");
      } else {
        setFetchError(error.message);
      }

      hasFetchedRef.current = false;
    } finally {
      setLoading(false);
    }
  }, [gameType, statField]);

  // Algoritmo optimizado de selección ponderada
  const weightedSelection = useCallback(
    (arr, count) => {
      const selected = [];
      const available = [...arr];

      for (let i = 0; i < count && available.length > 0; i++) {
        const weights = available.map((player) => {
          const statValue = player[statField] || 0;
          // Algoritmo mejorado para mejor distribución
          if (statValue === 0) return 2;
          if (statValue < 5) return 4;
          if (statValue < 20) return 6;
          if (statValue < 50) return 5;
          if (statValue < 100) return 3;
          return 1;
        });

        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;
        let selectedIndex = 0;

        for (let j = 0; j < weights.length; j++) {
          random -= weights[j];
          if (random <= 0) {
            selectedIndex = j;
            break;
          }
        }

        selected.push(available[selectedIndex]);
        available.splice(selectedIndex, 1);
      }

      return selected;
    },
    [statField]
  );

  // Initialize first players for the game
  const initializeGamePlayers = useCallback(
    (playersList) => {
      console.log(
        `[v0] initializeGamePlayers called with:`,
        playersList?.length,
        "players"
      );

      // Validar que playersList sea un array
      if (!Array.isArray(playersList) || playersList.length < 3) {
        console.error(`[v0] Invalid playersList:`, playersList);
        setFetchError("No hay suficientes jugadores disponibles");
        return;
      }

      const selectedPlayers = weightedSelection(
        playersList,
        Math.min(4, playersList.length)
      );

      setLeftPlayer(selectedPlayers[0]);
      setRightPlayer(selectedPlayers[1]);
      setNextPlayer(selectedPlayers[2]);

      usedPlayersRef.current = new Set([
        selectedPlayers[0]._id,
        selectedPlayers[1]._id,
        selectedPlayers[2]._id,
      ]);

      if (selectedPlayers.length > 3) {
        nextPlayerRef.current = selectedPlayers[3];
        usedPlayersRef.current.add(selectedPlayers[3]._id);
      }

      setFetchError(null);
    },
    [weightedSelection]
  );

  // Get next random player that hasn't been used
  const getNextRandomPlayer = useCallback(() => {
    const availablePlayers = players.filter(
      (player) => !usedPlayersRef.current.has(player._id)
    );

    if (availablePlayers.length === 0) {
      return null;
    }

    const selectedPlayers = weightedSelection(availablePlayers, 1);
    const selectedPlayer = selectedPlayers[0];

    if (selectedPlayer) {
      usedPlayersRef.current.add(selectedPlayer._id);
    }

    return selectedPlayer;
  }, [players, weightedSelection]);

  // Prepare next player for the carousel
  const prepareNextPlayer = useCallback(() => {
    nextPlayerRef.current = getNextRandomPlayer();
  }, [getNextRandomPlayer]);

  // Animate the counting of stats con requestAnimationFrame
  const animateCount = useCallback((targetValue) => {
    if (animationTimerRef.current) {
      cancelAnimationFrame(animationTimerRef.current);
    }

    setIsCountingAnimation(true);
    setAnimatedCount(0);

    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function para animación más suave
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.round(targetValue * easeOutQuart);

      setAnimatedCount(currentValue);

      if (progress < 1) {
        animationTimerRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedCount(targetValue);
        setIsCountingAnimation(false);
        animationTimerRef.current = null;
      }
    };

    animationTimerRef.current = requestAnimationFrame(animate);
  }, []);

  // Handle carousel animation end
  const handleCarouselAnimationEnd = useCallback(() => {
    setLeftPlayer(rightPlayer);
    setRightPlayer(nextPlayer);
    setNextPlayer(nextPlayerRef.current);
    setIsCarouselAnimation(false);
    setShowRightPlayerStat(false);
    setCarouselKey((prev) => prev + 1);

    // Check if we have more players
    if (!nextPlayerRef.current && !nextPlayer) {
      gameLogic.endGame(true);
      setGameEndReason("completed");
    }
  }, [rightPlayer, nextPlayer, gameLogic]);

  // Handle user guess optimizado
  const handleGuess = useCallback(
    (isMore) => {
      if (!leftPlayer || !rightPlayer || isCountingAnimation) return;

      setLastGuess(isMore ? "more" : "less");
      prepareNextPlayer();
      setShowRightPlayerStat(true);
      animateCount(rightPlayer[statField]);

      setTimeout(() => {
        const leftStat = leftPlayer[statField];
        const rightStat = rightPlayer[statField];

        const isCorrect =
          rightStat === leftStat ||
          (isMore ? rightStat > leftStat : rightStat < leftStat);

        if (isCorrect) {
          gameLogic.handleCorrectAnswer();
          setScore((prev) => prev + 1);
          setTimeout(() => setIsCarouselAnimation(true), 1500);
        } else {
          gameLogic.handleIncorrectAnswer("¡Incorrecto!");
          setTimeout(() => {
            gameLogic.endGame(false);
            setGameEndReason("wrong");
          }, 1500);
        }
      }, 1200);
    },
    [
      leftPlayer,
      rightPlayer,
      statField,
      prepareNextPlayer,
      animateCount,
      gameLogic,
      isCountingAnimation,
    ]
  );

  // Initialize game
  const initializeGame = useCallback(() => {
    // Limpiar timers anteriores
    if (animationTimerRef.current) {
      cancelAnimationFrame(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    setScore(0);
    setLastGuess(null);
    setGameEndReason("wrong");
    setShowRightPlayerStat(false);
    setIsCarouselAnimation(false);
    setCarouselKey(0);
    setFetchError(null);
    usedPlayersRef.current = new Set();
    hasFetchedRef.current = false;
    gameLogic.startGame();
  }, [gameLogic]);

  // Cleanup en unmount
  const cleanup = useCallback(() => {
    if (animationTimerRef.current) {
      cancelAnimationFrame(animationTimerRef.current);
    }
  }, []);

  return {
    // Game state
    players,
    leftPlayer,
    rightPlayer,
    nextPlayer,
    score,
    showRightPlayerStat,
    animatedCount,
    isCountingAnimation,
    isCarouselAnimation,
    carouselKey,
    loading,
    lastGuess,
    gameEndReason,
    fetchError,

    // Game logic
    gameLogic,

    // Actions
    handleGuess,
    handleCarouselAnimationEnd,
    initializeGame,
    fetchPlayers,
    cleanup,
  };
}
