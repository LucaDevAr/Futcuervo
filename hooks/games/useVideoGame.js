"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { debugLog } from "@/utils/debugLogger";

export function useVideoGame({ gameMode = "normal", onGameEnd, clubId }) {
  debugLog.hookLifecycle("useVideoGame", "mount", { gameMode, clubId });

  const [videoGame, setVideoGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const isSavingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const { getLastAttempt, refetch: refetchAttempts } = useGameAttempts(clubId);

  const gameConfig = GAME_CONFIGS.video;
  const timeLimit = gameConfig.modes.normal?.timeLimit || 60;

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit,
    onGameEnd: async (won, stats) => {
      const respuestaJugador =
        selectedOption !== null
          ? videoGame.options[selectedOption].text
          : "Ninguna";

      const respuestaCorrecta =
        videoGame.options.find((opt) => opt.isCorrect)?.text || "No disponible";

      const gameData = {
        "Tu respuesta": respuestaJugador,
        "Respuesta correcta": respuestaCorrecta,
      };

      debugLog.hookLifecycle("useVideoGame", "game_end", {
        won,
        playerAnswer: respuestaJugador,
        correctAnswer: respuestaCorrecta,
      });

      await saveGameAttempt(won, stats, gameData);
      await onGameEnd?.(won, stats, gameData);
    },
  });

  const saveGameAttempt = useCallback(
    async (won, stats, gameData) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        debugLog.hookLifecycle("useVideoGame", "save_start", {
          won,
          playerAnswer: gameData["Tu respuesta"],
        });

        const lastAttempt = getLastAttempt("video");
        const currentScore = won ? 1 : 0;
        const recordScore = lastAttempt?.recordScore
          ? Math.max(currentScore, lastAttempt.recordScore)
          : currentScore;

        const attemptData = {
          gameType: "video",
          clubId: clubId || null,
          won,
          score: currentScore,
          recordScore,
          timeUsed: stats?.finalTime || 0,
          livesRemaining: gameLogic.lives || 0,
          gameMode,
          gameData,
          streak: won ? (lastAttempt?.streak || 0) + 1 : 0,
          date: new Date(),
        };

        debugLog.apiRequest(
          "POST",
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/video/save`,
          attemptData,
          "useVideoGame"
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/video/save`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(attemptData),
          }
        );

        if (!res.ok) throw new Error("Error guardando intento");

        debugLog.apiResponse("saveGameAttempt_video", await res.json());
        await refetchAttempts();
        debugLog.hookLifecycle("useVideoGame", "save_complete", {
          successful: true,
        });
      } catch (error) {
        debugLog.apiError("saveGameAttempt", error, "useVideoGame");
        console.error("Error saving game attempt:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [clubId, gameLogic, getLastAttempt, refetchAttempts, gameMode]
  );

  useEffect(() => {
    const fetchVideoGame = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        setLoading(true);

        // const cached = getGame("video");
        if (cached) {
          debugLog.cacheHit("videoGame", `useVideoGame_${clubId || "global"}`);
          setVideoGame(cached);
          return setLoading(false);
        }

        debugLog.apiRequest(
          "GET",
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/video/daily`,
          { clubId },
          "useVideoGame"
        );

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/video/daily`,
          { credentials: "include" }
        );

        const data = await res.json();

        debugLog.apiResponse("fetchVideoGame", data);

        if (!data?.game) {
          debugLog.cacheMiss("videoGame", `useVideoGame_${clubId || "global"}`);
          setErrorMessage("No hay juego disponible para hoy");
          return;
        }

        setVideoGame(data.game);
        // saveGame("video", data.game);
      } catch (error) {
        debugLog.apiError("fetchVideoGame", error, "useVideoGame");
        console.error("Error cargando video game:", error);
        setErrorMessage("Error al cargar el juego del día");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoGame();
  }, [clubId]);

  const initializeGame = useCallback(() => {
    if (!videoGame) return;

    debugLog.hookLifecycle("useVideoGame", "initialize_game", {
      optionsCount: videoGame.options?.length,
    });

    setSelectedOption(null);
    setShowAnswer(false);
    setIsCorrect(false);
    setErrorMessage(null);
    gameLogic.startGame();
  }, [videoGame, gameLogic]);

  const handleOptionSelect = useCallback(
    (index) => {
      if (!showAnswer) {
        debugLog.hookLifecycle("useVideoGame", "option_selected", { index });
        setSelectedOption(index);
      }
    },
    [showAnswer]
  );

  const handleSubmit = useCallback(() => {
    if (selectedOption === null || !videoGame) return;

    const correctIndex = videoGame.options.findIndex((o) => o.isCorrect);
    const correct = selectedOption === correctIndex;

    debugLog.hookLifecycle("useVideoGame", "submit_answer", {
      selectedIndex: selectedOption,
      correctIndex,
      isCorrect: correct,
    });

    setIsCorrect(correct);
    setShowAnswer(true);

    correct
      ? gameLogic.handleCorrectAnswer(1)
      : gameLogic.handleIncorrectAnswer();

    setTimeout(() => gameLogic.endGame(correct), 2000);
  }, [selectedOption, videoGame, gameLogic]);

  return {
    videoGame,
    loading,
    errorMessage,
    selectedOption,
    showAnswer,
    isCorrect,
    gameLogic,
    initializeGame,
    handleOptionSelect,
    handleSubmit,
  };
}
