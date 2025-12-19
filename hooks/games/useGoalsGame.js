"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useUserStore } from "@/stores/userStore";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { debugLog } from "@/utils/debugLogger";

const getPlayerWeight = (player) => {
  const goals = player.goals || 0;

  if (goals <= 5) return 0.4;
  if (goals <= 10) return 0.7;
  if (goals <= 20) return 1.1;
  if (goals <= 50) return 1.8;
  if (goals <= 100) return 2.5;
  return 3.0; // Goleadores históricos = más probabilidad
};

export function useGoalsGame({
  gameMode,
  onGameEnd,
  clubId = null,
  preloadedPlayers = [],
}) {
  const [players, setPlayers] = useState([]);
  const [leftPlayer, setLeftPlayer] = useState(null);
  const [rightPlayer, setRightPlayer] = useState(null);
  const [nextPlayer, setNextPlayer] = useState(null);
  const [score, setScore] = useState(0);
  const [showRightPlayerGoals, setShowRightPlayerGoals] = useState(false);
  const [animatedCount, setAnimatedCount] = useState(0);
  const [isCountingAnimation, setIsCountingAnimation] = useState(false);
  const [isCarouselAnimation, setIsCarouselAnimation] = useState(false);
  const [carouselKey, setCarouselKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastGuess, setLastGuess] = useState(null);
  const [gameEndReason, setGameEndReason] = useState("wrong");
  const [fetchError, setFetchError] = useState(null);
  const [hasWon, setHasWon] = useState(false);

  const user = useUserStore((state) => state.user);

  const nextPlayerRef = useRef(null);
  const usedPlayersRef = useRef(new Set());
  const hasWonRef = useRef(false);

  const isSavingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const localAttempts = useLocalGameAttempts(clubId);
  const { getLastAttempt, refetch: refetchAttempts } = useGameAttempts(clubId);
  const gameAttemptsStore = useGameAttemptsStore();

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: GAME_CONFIGS.goals.timeLimit || 60,
    initialLives: GAME_CONFIGS.goals.lives || 3,
    onGameEnd: async (won, stats) => {
      const gameData = {
        "Puntuación Final": score,
        "Razón de finalización":
          gameEndReason === "time"
            ? "Tiempo agotado"
            : gameEndReason === "completed"
            ? "Jugadores agotados"
            : gameEndReason === "victory"
            ? "Victoria por 10 puntos"
            : "Respuesta incorrecta",
        lastGuess,
        jugadores: {
          left: leftPlayer && {
            displayName: leftPlayer.displayName,
            goals: leftPlayer.goals,
            actionImage: leftPlayer.actionImage,
          },
          right: rightPlayer && {
            displayName: rightPlayer.displayName,
            goals: rightPlayer.goals,
            actionImage: rightPlayer.actionImage,
          },
        },
      };

      await saveGameAttempt(won, stats, gameData);
      await onGameEnd(won, stats, gameData);
    },
  });

  const saveGameAttempt = useCallback(
    async (won, gameStats, gameData) => {
      if (isSavingRef.current) return;

      isSavingRef.current = true;

      try {
        debugLog.hookLifecycle("useGoalsGame", "save_start", {
          clubId: clubId || "global",
          won,
        });

        const lastAttemptData = user
          ? getLastAttempt("goals") // ✅ ONLINE
          : localAttempts.getLastAttempt("goals"); // ✅ OFFLINE

        // 🔒 Normalización segura
        const currentScore = score;

        // ⛓️ El récord SIEMPRE viene del último intento guardado
        const previousRecord = Number.isFinite(lastAttemptData?.recordScore)
          ? lastAttemptData.recordScore
          : 0;

        const recordScore = Math.max(previousRecord, currentScore);

        const attemptData = {
          gameType: "goals",
          clubId: clubId || null,
          won,
          score: currentScore,
          recordScore,
          timeUsed: gameStats?.finalTime || 0,
          livesRemaining: gameLogic.lives || 0,
          gameMode,
          gameData,
          streak: won ? (lastAttemptData?.streak || 0) + 1 : 0,
          date: new Date().toISOString(),
        };

        if (!user) {
          // Guardado local solamente cuando NO hay usuario
          localAttempts.updateAttempt("goals", attemptData);
          isSavingRef.current = false;
          return;
        }

        debugLog.apiRequest(
          "POST",
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/goals/save`,
          attemptData,
          "useGoalsGame"
        );

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/goals/save`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(attemptData),
          }
        );

        if (!response.ok)
          throw new Error(`Error al guardar: ${response.status}`);

        const { attempt: savedAttempt } = await response.json();
        if (savedAttempt) {
          gameAttemptsStore.updateAttempt(clubId, "goals", {
            ...attemptData,
            streak: savedAttempt.streak, // Use backend-calculated streak
            _id: savedAttempt._id,
            createdAt: savedAttempt.createdAt,
            updatedAt: savedAttempt.updatedAt,
          });
          if (!user) {
            localAttempts.updateAttempt("goals", {
              ...attemptData,
              streak: savedAttempt.streak,
              _id: savedAttempt._id,
              createdAt: savedAttempt.createdAt,
              updatedAt: savedAttempt.updatedAt,
            });
          }
        }
      } catch (error) {
        debugLog.apiError("saveGameAttempt", error, "useGoalsGame");
        console.error("Error saving game attempt:", error);
      }
    },
    [getLastAttempt, localAttempts, gameMode, clubId, gameAttemptsStore]
  );

  // -------------------------------
  // Manejo de stats e imagen por club
  // -------------------------------
  const getClubStats = useCallback(
    (player) =>
      player?.clubsStats?.find(
        (s) => s.club?._id?.toString() === clubId?.toString()
      ),
    [clubId]
  );

  const getGoalsForClub = useCallback(
    (player) => getClubStats(player)?.goals ?? 0,
    [getClubStats]
  );

  const getActionImageForClub = useCallback(
    (player) =>
      getClubStats(player)?.actionImage ||
      player.actionImage ||
      "/placeholder.svg",
    [getClubStats]
  );

  const initializeGamePlayers = useCallback(
    (playersList) => {
      if (!Array.isArray(playersList) || playersList.length < 3) {
        setFetchError("No hay suficientes jugadores disponibles");
        return;
      }

      const preparePlayer = (p) => ({
        ...p,
        goals: getGoalsForClub(p),
        actionImage: getActionImageForClub(p),
      });

      // ===============================
      // SELECCIÓN PONDERADA DE LOS 3 PRIMEROS JUGADORES
      // ===============================

      const selectWeighted = (list) => {
        const weights = list.map((p) => getPlayerWeight(p));
        const totalWeight = weights.reduce((s, w) => s + w, 0);

        let rnd = Math.random() * totalWeight;

        for (let i = 0; i < list.length; i++) {
          if (rnd < weights[i]) return list[i];
          rnd -= weights[i];
        }
        return list[0]; // Fallback
      };

      const available = [...playersList];

      const first = selectWeighted(available);
      available.splice(available.indexOf(first), 1);

      const second = selectWeighted(available);
      available.splice(available.indexOf(second), 1);

      const third = selectWeighted(available);
      available.splice(available.indexOf(third), 1);

      // ===============================

      setLeftPlayer(preparePlayer(first));
      setRightPlayer(preparePlayer(second));
      setNextPlayer(preparePlayer(third));

      usedPlayersRef.current = new Set([first._id, second._id, third._id]);

      if (available.length > 0) {
        const fourth = available[0];
        nextPlayerRef.current = preparePlayer(fourth);
      }

      setFetchError(null);
    },
    [getGoalsForClub, getActionImageForClub]
  );

  // Preload players
  useEffect(() => {
    if (preloadedPlayers.length > 0 && !hasFetchedRef.current) {
      hasFetchedRef.current = true;

      const updatedPlayers = [...players];
      preloadedPlayers.forEach((p) => {
        if (!updatedPlayers.some((pl) => pl._id === p._id)) {
          updatedPlayers.push({
            ...p,
            goals: getGoalsForClub(p),
            actionImage: getActionImageForClub(p),
          });
        }
      });

      setPlayers(updatedPlayers);

      if (!leftPlayer && updatedPlayers.length >= 3)
        initializeGamePlayers(updatedPlayers);
    }
  }, [
    preloadedPlayers,
    getGoalsForClub,
    getActionImageForClub,
    players,
    leftPlayer,
    initializeGamePlayers,
  ]);

  const getNextRandomPlayer = useCallback(() => {
    const available = players.filter((p) => !usedPlayersRef.current.has(p._id));
    if (available.length === 0) return null;

    // Calcular pesos basados en goles
    const weights = available.map((p) => getPlayerWeight(p));

    // Suma total
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);

    // Número aleatorio ponderado
    let random = Math.random() * totalWeight;

    // Elegir jugador según peso
    for (let i = 0; i < available.length; i++) {
      if (random < weights[i]) {
        const selected = available[i];
        usedPlayersRef.current.add(selected._id);
        return selected;
      }
      random -= weights[i];
    }

    // Fallback
    const fallback = available[0];
    usedPlayersRef.current.add(fallback._id);
    return fallback;
  }, [players]);

  const prepareNextPlayer = useCallback(() => {
    const next = getNextRandomPlayer();
    if (next) nextPlayerRef.current = next;
  }, [getNextRandomPlayer]);

  const animateCount = useCallback((targetValue) => {
    setIsCountingAnimation(true);
    setAnimatedCount(0);
    const steps = 30;
    const increment = targetValue / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const currentValue = Math.min(
        Math.round(increment * currentStep),
        targetValue
      );
      setAnimatedCount(currentValue);

      if (currentStep >= steps) {
        clearInterval(timer);
        setAnimatedCount(targetValue);
        setIsCountingAnimation(false);
      }
    }, 1000 / steps);
  }, []);

  const handleCarouselAnimationEnd = useCallback(() => {
    const currentRight = rightPlayer;
    const currentNext = nextPlayer;

    setLeftPlayer(currentRight);
    setRightPlayer(currentNext);
    setNextPlayer(nextPlayerRef.current);
    setIsCarouselAnimation(false);
    setShowRightPlayerGoals(false);
    setCarouselKey((prev) => prev + 1);

    if (!nextPlayerRef.current && !currentNext) {
      setGameEndReason("completed");
      gameLogic.endGame(hasWonRef.current);
    }
  }, [rightPlayer, nextPlayer, gameLogic]);

  const handleGuess = useCallback(
    (isMore) => {
      if (!leftPlayer || !rightPlayer) return;

      setLastGuess(isMore ? "more" : "less");
      prepareNextPlayer();
      setShowRightPlayerGoals(true);
      animateCount(rightPlayer.goals);

      setTimeout(() => {
        const isCorrect =
          rightPlayer.goals === leftPlayer.goals
            ? true
            : isMore
            ? rightPlayer.goals > leftPlayer.goals
            : rightPlayer.goals < leftPlayer.goals;

        if (isCorrect) {
          gameLogic.handleCorrectAnswer();
          const newScore = score + 1;
          setScore(newScore);

          if (newScore >= 10 && !hasWonRef.current) {
            setHasWon(true);
            hasWonRef.current = true;
            setGameEndReason("victory");
            // ✅ No terminamos el juego, solo marcamos won
          }

          setTimeout(() => setIsCarouselAnimation(true), 1500);
        } else {
          gameLogic.handleIncorrectAnswer("¡Incorrecto!");
          setTimeout(() => {
            setGameEndReason(hasWonRef.current ? "victory" : "wrong");
            gameLogic.endGame(hasWonRef.current);
          }, 1500);
        }
      }, 1200);
    },
    [leftPlayer, rightPlayer, prepareNextPlayer, animateCount, gameLogic, score]
  );

  const initializeGame = useCallback(() => {
    setScore(0);
    setLastGuess(null);
    setGameEndReason("wrong");
    setShowRightPlayerGoals(false);
    setIsCarouselAnimation(false);
    setCarouselKey(0);
    setFetchError(null);
    setHasWon(false);
    hasWonRef.current = false;
    usedPlayersRef.current = new Set();
    hasFetchedRef.current = false;
    gameLogic.startGame();
  }, [gameLogic]);

  return {
    players,
    leftPlayer,
    rightPlayer,
    nextPlayer,
    score,
    showRightPlayerGoals,
    animatedCount,
    isCountingAnimation,
    isCarouselAnimation,
    carouselKey,
    loading,
    lastGuess,
    gameEndReason,
    fetchError,
    gameLogic,
    handleGuess,
    handleCarouselAnimationEnd,
    initializeGame,
  };
}
