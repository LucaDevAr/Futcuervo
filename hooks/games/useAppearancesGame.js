"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";

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

  const nextPlayerRef = useRef(null);
  const usedPlayersRef = useRef(new Set());
  const hasFetchedRef = useRef(false);
  const hasWonRef = useRef(false);

  const localAttempts = useLocalGameAttempts(clubId);
  const { getLastAttempt, refetch: refetchAttempts } = useGameAttempts(clubId);

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
      try {
        const lastAttemptData = localAttempts
          ? localAttempts.getLastAttempt("appearances")
          : getLastAttempt("appearances");

        const currentScore = score;
        const recordScore = lastAttemptData?.recordScore
          ? Math.max(currentScore, lastAttemptData.recordScore)
          : currentScore;

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
          date: new Date(),
        };

        if (localAttempts) {
          localAttempts.updateAttempt("appearances", attemptData);
          isSavingRef.current = false;
          return;
        }

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
        await refetchAttempts();
      } catch (error) {
        console.error("Error saving game attempt:", error);
      }
    },
    [score, getLastAttempt, gameMode, gameLogic.lives, refetchAttempts, clubId]
  );

  // -------------------------------
  // ⚽ Manejo de stats e imagen por club
  // -------------------------------
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

    const selected = available[Math.floor(Math.random() * available.length)];
    usedPlayersRef.current.add(selected._id);
    return selected;
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
