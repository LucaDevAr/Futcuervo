"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { useUserStore } from "@/stores/userStore";
import { debugLog } from "@/utils/debugLogger";

const getPlayerWeight = (player) => {
  const apps = player.appearances || 0;

  if (apps <= 5) return 0.4;
  if (apps <= 10) return 0.7;
  if (apps <= 30) return 1.5;
  if (apps <= 100) return 2.0;
  return 3.0;
};

export function useAppearancesGame({
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
  const [showRightPlayerAppearances, setShowRightPlayerAppearances] =
    useState(false);
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
    timeLimit: GAME_CONFIGS.appearances.timeLimit,
    initialLives: GAME_CONFIGS.appearances.lives,
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
            appearances: leftPlayer.appearances,
            actionImage: leftPlayer.actionImage,
          },
          right: rightPlayer && {
            displayName: rightPlayer.displayName,
            appearances: rightPlayer.appearances,
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
      if (isSavingRef.current) return; // Prevent duplicate saves
      isSavingRef.current = true;

      try {
        debugLog.hookLifecycle("useAppearancesGame", "save_start", {
          clubId: clubId || "global",
          won,
        });

        const lastAttemptData = user
          ? getLastAttempt("appearances") // ✅ ONLINE
          : localAttempts.getLastAttempt("appearances"); // ✅ OFFLINE

        // 🔒 Normalización segura
        const currentScore = score;

        // ⛓️ El récord SIEMPRE viene del último intento guardado
        const previousRecord = Number.isFinite(lastAttemptData?.recordScore)
          ? lastAttemptData.recordScore
          : 0;

        const recordScore = Math.max(previousRecord, currentScore);

        const attemptData = {
          gameType: "appearances",
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
          localAttempts.updateAttempt("appearances", attemptData);
          isSavingRef.current = false;
          return;
        }

        debugLog.apiRequest(
          "POST",
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/appearances/save`,
          attemptData,
          "useAppearancesGame"
        );

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/appearances/save`,
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
          gameAttemptsStore.updateAttempt(clubId, "appearances", {
            ...attemptData,
            streak: savedAttempt.streak, // Use backend-calculated streak
            _id: savedAttempt._id,
            createdAt: savedAttempt.createdAt,
            updatedAt: savedAttempt.updatedAt,
          });
          if (!user) {
            localAttempts.updateAttempt("appearances", {
              ...attemptData,
              streak: savedAttempt.streak,
              _id: savedAttempt._id,
              createdAt: savedAttempt.createdAt,
              updatedAt: savedAttempt.updatedAt,
            });
          }
        }
      } catch (error) {
        debugLog.apiError("saveGameAttempt", error, "useAppearancesGame");
        console.error("Error saving game attempt:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [getLastAttempt, localAttempts, gameMode, clubId, gameAttemptsStore]
  );

  const getClubStats = useCallback(
    (player) =>
      player?.clubsStats?.find(
        (s) => s.club?._id?.toString() === clubId?.toString()
      ),
    [clubId]
  );

  const getAppearancesForClub = useCallback(
    (player) => getClubStats(player)?.appearances ?? 0,
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

      const shuffled = [...playersList].sort(() => Math.random() - 0.5);
      const preparePlayer = (p) => ({
        ...p,
        appearances: getAppearancesForClub(p),
        actionImage: getActionImageForClub(p),
      });

      setLeftPlayer(preparePlayer(shuffled[0]));
      setRightPlayer(preparePlayer(shuffled[1]));
      setNextPlayer(preparePlayer(shuffled[2]));

      usedPlayersRef.current = new Set([
        shuffled[0]._id,
        shuffled[1]._id,
        shuffled[2]._id,
      ]);

      if (shuffled.length > 3)
        nextPlayerRef.current = preparePlayer(shuffled[3]);

      setFetchError(null);
    },
    [getAppearancesForClub, getActionImageForClub]
  );

  useEffect(() => {
    if (preloadedPlayers.length > 0 && !hasFetchedRef.current) {
      hasFetchedRef.current = true;

      const updatedPlayers = [...players];
      preloadedPlayers.forEach((p) => {
        if (!updatedPlayers.some((pl) => pl._id === p._id)) {
          updatedPlayers.push({
            ...p,
            appearances: getAppearancesForClub(p),
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
    getAppearancesForClub,
    getActionImageForClub,
    players,
    leftPlayer,
    initializeGamePlayers,
  ]);

  const getNextRandomPlayer = useCallback(() => {
    const available = players.filter((p) => !usedPlayersRef.current.has(p._id));
    if (available.length === 0) return null;

    // Calcular pesos
    const weights = available.map((p) => getPlayerWeight(p));

    // Suma total
    const totalWeight = weights.reduce((a, b) => a + b, 0);

    // Número random ponderado
    let random = Math.random() * totalWeight;

    // Selección ponderada
    for (let i = 0; i < available.length; i++) {
      if (random < weights[i]) {
        const selected = available[i];
        usedPlayersRef.current.add(selected._id);
        return selected;
      }
      random -= weights[i];
    }

    // Fallback (casi nunca sucede)
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
    setShowRightPlayerAppearances(false);
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
      setShowRightPlayerAppearances(true);
      animateCount(rightPlayer.appearances);

      setTimeout(() => {
        const isCorrect =
          rightPlayer.appearances === leftPlayer.appearances
            ? true
            : isMore
            ? rightPlayer.appearances > leftPlayer.appearances
            : rightPlayer.appearances < leftPlayer.appearances;

        if (isCorrect) {
          gameLogic.handleCorrectAnswer();
          const newScore = score + 1;
          setScore(newScore);

          if (newScore >= 10 && !hasWonRef.current) {
            setHasWon(true);
            hasWonRef.current = true;
            setGameEndReason("victory");
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
    setShowRightPlayerAppearances(false);
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
    showRightPlayerAppearances,
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
