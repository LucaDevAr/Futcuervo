"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { debugLog } from "@/utils/debugLogger";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useDailyGamesStore } from "@/stores/dailyGamesStore";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { calculateStreak } from "@/utils/date";
import { useUserStore } from "@/stores/userStore";

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useCareerGame({ gameMode, onGameEnd, clubId }) {
  // debugLog.hookLifecycle("useCareerGame", "m  ount", { gameMode, clubId });

  const user = useUserStore((state) => state.user);

  const [careerGame, setCareerGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [guess, setGuess] = useState("");
  const [revealedIndices, setRevealedIndices] = useState([]);
  const [clubIndex, setClubIndex] = useState(null);
  const [initialLives, setInitialLives] = useState(3);

  const isSavingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const localAttempts = useLocalGameAttempts(clubId);
  const { getLastAttempt, refetch: refetchAttempts } = useGameAttempts(clubId);
  const gameAttemptsStore = useGameAttemptsStore();

  const gameConfig = GAME_CONFIGS.career;
  const timeLimit = gameConfig.modes[gameMode]?.timeLimit || 30;

  useEffect(() => {
    if (careerGame?.player?.career?.length) {
      const clubCount = careerGame.player.career.length;
      setInitialLives(clubCount > 6 ? 5 : 3);
      // debugLog.storeUpdate("careerGame", {
      //   playerName: careerGame.player.fullName,
      //   clubCount,
      //   initialLives: clubCount > 6 ? 5 : 3,
      // });
    }
  }, [careerGame]);

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit,
    initialLives,
    onGameEnd: async (won, stats, overrideGameData) => {
      const player = careerGame?.player;

      const gameData = overrideGameData || {
        Player: player,
        Pistas: revealedIndices.length,
      };

      // debugLog.hookLifecycle("useCareerGame", "game_end", {
      //   won,
      //   playerName: player?.fullName,
      //   hintsRevealed: revealedIndices.length,
      // });

      await saveGameAttempt(won, stats, gameData);

      // SOLO llamar al callback del componente
      if (onGameEnd) {
        await onGameEnd(won, stats, gameData);
      }
    },
  });

  const saveGameAttempt = useCallback(
    async (won, gameStats, gameData) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        debugLog.hookLifecycle("useCareerGame", "save_start", {
          clubId: clubId || "global",
          won,
        });

        const lastAttemptData = localAttempts
          ? localAttempts.getLastAttempt("career")
          : getLastAttempt("career");

        const currentScore = won ? 1 : 0;
        const recordScore = lastAttemptData?.recordScore
          ? Math.max(currentScore, lastAttemptData.recordScore)
          : currentScore;

        let streakValue = lastAttemptData?.streak || 0;

        if (won) {
          streakValue = calculateStreak(
            lastAttemptData?.date,
            lastAttemptData?.streak || 0
          );
        }

        const attemptData = {
          gameType: "career",
          clubId: clubId || null,
          won,
          score: currentScore,
          recordScore,
          timeUsed: gameStats?.finalTime || 0,
          livesRemaining: gameLogic.lives || 0,
          gameMode,
          gameData,
          streak: streakValue,
          date: new Date().toISOString(),
        };

        if (!user) {
          // Guardado local solamente cuando NO hay usuario
          localAttempts.updateAttempt("career", attemptData);
          isSavingRef.current = false;
          return;
        }

        debugLog.apiRequest(
          "POST",
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/career/save`,
          attemptData,
          "useCareerGame"
        );

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/career/save`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(attemptData),
          }
        );

        if (!response.ok) {
          throw new Error(`Error al guardar: ${response.status}`);
        }

        const { attempt: savedAttempt } = await response.json();
        if (savedAttempt) {
          gameAttemptsStore.updateAttempt(clubId, "career", {
            ...attemptData,
            streak: savedAttempt.streak, // Use backend-calculated streak
            _id: savedAttempt._id,
            createdAt: savedAttempt.createdAt,
            updatedAt: savedAttempt.updatedAt,
          });
          if (!user) {
            localAttempts.updateAttempt("career", {
              ...attemptData,
              streak: savedAttempt.streak,
              _id: savedAttempt._id,
              createdAt: savedAttempt.createdAt,
              updatedAt: savedAttempt.updatedAt,
            });
          }
          console.log(
            "[v0] LocalStorage updated with saved attempt, streak:",
            savedAttempt.streak
          );
        }
      } catch (error) {
        debugLog.apiError("saveGameAttempt", error, "useCareerGame");
        console.error("Error saving game attempt:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [getLastAttempt, localAttempts, gameMode, clubId, gameAttemptsStore]
  );

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setLoading(true);

    try {
      const { getGame: getStoredGame } = useDailyGamesStore.getState();
      const stored = getStoredGame(clubId, "career");

      if (stored) {
        // debugLog.cacheHit("careerGame", `useCareerGame_${clubId || "global"}`);
        setCareerGame(stored);

        const sanLorenzoIndex = stored.player.career.findIndex(
          (step) =>
            step.club?.name &&
            normalizeString(step.club.name).includes("san lorenzo")
        );

        setClubIndex(sanLorenzoIndex !== -1 ? sanLorenzoIndex : null);
      } else {
        // debugLog.cacheMiss("careerGame", `useCareerGame_${clubId || "global"}`);
        console.error(
          "[careerGame] NO daily found in store! You must preload daily games before entering the game."
        );
        setErrorMessage("Error: el juego daily de career no está precargado");
      }
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const initializeGame = useCallback(() => {
    if (!careerGame || !gameLogic) return;

    // debugLog.hookLifecycle("useCareerGame", "initialize_game", {
    //   playerName: careerGame.player.fullName,
    // });

    setGuess("");
    setRevealedIndices([]);
    setErrorMessage(null);

    gameLogic.startGame();
  }, [careerGame, gameLogic]);

  const handleSubmit = useCallback(() => {
    if (!guess.trim() || !careerGame || !gameLogic) {
      // debugLog.hookLifecycle("useCareerGame", "submit_invalid", {
      //   reason: "empty_guess",
      // });
      gameLogic?.handleIncorrectAnswer?.("Por favor ingresa un nombre");
      return;
    }

    const playerNameLower = careerGame.player.fullName.toLowerCase();
    const nicknamesLower = careerGame.player.nicknames.map((n) =>
      n.toLowerCase()
    );
    const guessLower = guess.toLowerCase();

    const isCorrect =
      playerNameLower.includes(guessLower) ||
      guessLower.includes(playerNameLower) ||
      nicknamesLower.some(
        (nick) => nick.includes(guessLower) || guessLower.includes(nick)
      );

    if (isCorrect) {
      // debugLog.hookLifecycle("useCareerGame", "submit_correct", {
      //   guess,
      //   playerName: careerGame.player.fullName,
      // });
      gameLogic.handleCorrectAnswer(1);
      setTimeout(() => {
        gameLogic.endGame(true);
      }, 1000);
    } else {
      // debugLog.hookLifecycle("useCareerGame", "submit_incorrect", {
      //   guess,
      //   playerName: careerGame.player.fullName,
      // });

      gameLogic.handleIncorrectAnswer("Nombre incorrecto");
      setGuess("");

      const career = careerGame.player.career;

      // CLUB FORZADO (el que siempre se revela)
      const forcedClub =
        clubIndex !== null && career[clubIndex]?.club?.name
          ? normalizeString(career[clubIndex].club.name)
          : null;

      // Clubs de pasos ya revelados (por nombre)
      const revealedClubNames = new Set(
        revealedIndices
          .map((i) => career[i]?.club?.name)
          .filter(Boolean)
          .map((name) => normalizeString(name))
      );

      // 1️⃣ Filtrar clubs válidos (no forzados, no revelados)
      let validUnrevealed = career
        .map((step, i) => ({
          index: i,
          name: step.club?.name ? normalizeString(step.club.name) : null,
        }))
        .filter(
          (item) =>
            !revealedIndices.includes(item.index) &&
            item.name !== forcedClub &&
            !revealedClubNames.has(item.name)
        );

      // 2️⃣ Si NO quedan clubs válidos, permitir revelar repetidos (pero NO el forzado)
      if (validUnrevealed.length === 0) {
        validUnrevealed = career
          .map((step, i) => ({
            index: i,
            name: step.club?.name ? normalizeString(step.club.name) : null,
          }))
          .filter(
            (item) =>
              !revealedIndices.includes(item.index) && item.name !== forcedClub
          );
      }

      // 3️⃣ Si aún así no queda nada → no reveles ningún club
      if (validUnrevealed.length > 0) {
        const random =
          validUnrevealed[Math.floor(Math.random() * validUnrevealed.length)]
            .index;

        setRevealedIndices((prev) => [...prev, random]);
      }
    }
  }, [guess, careerGame, gameLogic, revealedIndices]);

  const getCareerSteps = useCallback(() => {
    if (!careerGame) return [];
    return careerGame.player.career.map((step, index) => {
      const position = (index / (careerGame.player.career.length - 1)) * 90;
      return {
        ...step,
        revealed: revealedIndices.includes(index),
        position: careerGame.player.career.length === 1 ? 50 : position,
      };
    });
  }, [careerGame, revealedIndices]);

  return {
    careerGame,
    loading,
    errorMessage,
    guess,
    setGuess,
    revealedIndices,
    clubIndex,
    gameLogic,
    handleSubmit,
    getCareerSteps,
    initialLives,
    initializeGame,
  };
}
