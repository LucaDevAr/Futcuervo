"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { useDailyGamesStore } from "@/stores/dailyGamesStore";
import { debugLog } from "@/utils/debugLogger";
import { useUserStore } from "@/stores/userStore";
import { calculateStreak } from "@/utils/date";

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function usePlayerGame({ gameMode, onGameEnd, clubId }) {
  // debugLog.hookLifecycle("usePlayerGame", "mount", { gameMode, clubId });

  const user = useUserStore((state) => state.user);

  const [playerGame, setPlayerGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Estados del juego
  const [currentGuess, setCurrentGuess] = useState("");
  const [attempts, setAttempts] = useState([]);
  const attemptsRef = useRef([]); // <-- ref para tener siempre el último array
  const [keyboardStatus, setKeyboardStatus] = useState({});
  const [gameWon, setGameWon] = useState(false);
  const [gameLost, setGameLost] = useState(false);

  const isSavingRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const maxAttempts = 6;

  const localAttempts = useLocalGameAttempts(clubId);
  const { getLastAttempt, refetch: refetchAttempts } = useGameAttempts(clubId);
  const gameAttemptsStore = useGameAttemptsStore();

  const gameConfig = GAME_CONFIGS.player;
  const timeLimit = gameConfig.modes[gameMode]?.timeLimit || 300;

  const evaluateGuess = useCallback(
    (guess) => {
      if (!playerGame) return [];

      const targetName = normalizeString(playerGame.selectedName);
      const guessNormalized = normalizeString(guess);

      // <-- **IMPORTANTE**: recortamos el guess al largo de la palabra objetivo
      const targetLetters = targetName.split("");
      const guessLetters = guessNormalized
        .slice(0, targetLetters.length)
        .split("");

      const result = [];
      const usedTargetIndices = new Set();
      const usedGuessIndices = new Set();

      // Primera pasada: letras correctas
      for (let i = 0; i < guessLetters.length; i++) {
        if (guessLetters[i] === targetLetters[i]) {
          // usamos la letra original tal como se tipeó (mayúscula / minúscula)
          result[i] = {
            letter: guess[i] || guessLetters[i],
            status: "correct",
          };
          usedTargetIndices.add(i);
          usedGuessIndices.add(i);
        }
      }

      // Segunda pasada: letras presentes
      for (let i = 0; i < guessLetters.length; i++) {
        if (usedGuessIndices.has(i)) continue;

        const letterIndex = targetLetters.findIndex(
          (letter, idx) =>
            letter === guessLetters[i] && !usedTargetIndices.has(idx)
        );

        if (letterIndex !== -1) {
          result[i] = {
            letter: guess[i] || guessLetters[i],
            status: "present",
          };
          usedTargetIndices.add(letterIndex);
        } else {
          result[i] = { letter: guess[i] || guessLetters[i], status: "absent" };
        }
      }

      // Si por alguna razón la longitud del resultado es menor que target, rellenar con absents (consistencia)
      for (let i = 0; i < targetLetters.length; i++) {
        if (!result[i]) result[i] = { letter: "", status: "absent" };
      }

      return result;
    },
    [playerGame]
  );

  const saveGameAttempt = useCallback(
    async (won, gameStats, gameData) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        debugLog.hookLifecycle("usePlayerGame", "save_start", {
          won,
          playerName: playerGame?.player?.fullName,
          attemptsCount: attemptsRef.current.length,
        });

        const lastAttemptData = localAttempts
          ? localAttempts.getLastAttempt("player")
          : getLastAttempt("player");

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
          gameType: "player",
          clubId: clubId || null,
          won,
          score: currentScore,
          recordScore,
          timeUsed: gameStats?.finalTime || 0,
          livesRemaining: maxAttempts - attemptsRef.current.length,
          gameMode,
          streak: streakValue,
          gameData,
          date: new Date().toISOString(),
        };

        if (!user) {
          // Guardado local solamente cuando NO hay usuario
          localAttempts.updateAttempt("player", attemptData);
          isSavingRef.current = false;
          return;
        }

        debugLog.apiRequest(
          "POST",
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/player/save`,
          attemptData,
          "usePlayerGame"
        );

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/player/save`,
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
          gameAttemptsStore.updateAttempt(clubId, "player", {
            ...attemptData,
            streak: savedAttempt.streak, // Use backend-calculated streak
            _id: savedAttempt._id,
            createdAt: savedAttempt.createdAt,
            updatedAt: savedAttempt.updatedAt,
          });
          if (!user) {
            localAttempts.updateAttempt("player", {
              ...attemptData,
              streak: savedAttempt.streak,
              _id: savedAttempt._id,
              createdAt: savedAttempt.createdAt,
              updatedAt: savedAttempt.updatedAt,
            });
          }
        }
      } catch (error) {
        debugLog.apiError("saveGameAttempt", error, "usePlayerGame");
        console.error("Error saving game attempt:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [getLastAttempt, localAttempts, gameMode, clubId, gameAttemptsStore]
  );

  // Configurar la lógica del juego
  const gameLogic = useGameLogic({
    gameMode,
    timeLimit,
    initialLives: maxAttempts,
    // onGameEnd puede ser llamado por useGameLogic; soportamos un tercer parámetro 'overrideGameData'
    onGameEnd: async (won, stats, overrideGameData) => {
      const player = playerGame?.player;

      const gameData = overrideGameData || {
        Player: player,
        Letras: attemptsRef.current.map((a) => a.evaluation),
      };

      // SOLO guardar desde el HOOK
      await saveGameAttempt(won, stats, gameData);

      // SOLO llamar al callback del componente
      if (onGameEnd) {
        await onGameEnd(won, stats, gameData);
      }
    },
  });

  // Cargar el juego diario
  // Cargar player game SOLO desde el store/localStorage → SIN FETCH
  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setLoading(true);

    try {
      const { getGame: getStoredGame } = useDailyGamesStore.getState();

      // playerGame diario
      const stored = getStoredGame(clubId, "player");

      if (stored) {
        // debugLog.cacheHit("playerGame", `usePlayerGame_${clubId || "global"}`);
        setPlayerGame(stored);
      } else {
        // debugLog.cacheMiss("playerGame", `usePlayerGame_${clubId || "global"}`);
        console.error("[playerGame] NO daily found in store!");
        setErrorMessage("Error: el juego diario no está precargado");
      }
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  // Inicialización
  const initializeGame = useCallback(() => {
    if (!playerGame) return;

    // debugLog.hookLifecycle("usePlayerGame", "initialize_game", {
    //   playerName: playerGame.player?.fullName,
    // });

    setCurrentGuess("");
    setAttempts([]);
    attemptsRef.current = [];
    setKeyboardStatus({});
    setGameWon(false);
    setGameLost(false);
    setErrorMessage(null);

    gameLogic.startGame();
  }, [playerGame, gameLogic]);

  // Enviar intento
  const handleSubmit = useCallback(() => {
    if (!playerGame || currentGuess.length === 0) return;
    if (gameWon || gameLost) return;

    const evaluation = evaluateGuess(currentGuess);
    const newAttempt = {
      guess: currentGuess.slice(0, (playerGame?.selectedName || "").length),
      evaluation,
    };
    const newAttempts = [...attemptsRef.current, newAttempt];

    // debugLog.hookLifecycle("usePlayerGame", "submit_guess", {
    //   guess: currentGuess,
    //   attemptsCount: newAttempts.length,
    //   isCorrect: evaluation.every((e) => e.status === "correct"),
    // });

    setAttempts(newAttempts);
    attemptsRef.current = newAttempts;

    // actualizar teclado (igual que antes)
    const newKeyboardStatus = { ...keyboardStatus };
    evaluation.forEach(({ letter, status }) => {
      const normalizedLetter = normalizeString(letter);
      if (!newKeyboardStatus[normalizedLetter] || status === "correct") {
        newKeyboardStatus[normalizedLetter] = status;
      } else if (
        status === "present" &&
        newKeyboardStatus[normalizedLetter] !== "correct"
      ) {
        newKeyboardStatus[normalizedLetter] = status;
      } else if (status === "absent" && !newKeyboardStatus[normalizedLetter]) {
        newKeyboardStatus[normalizedLetter] = status;
      }
    });
    setKeyboardStatus(newKeyboardStatus);

    const isCorrect = evaluation.every((e) => e.status === "correct");

    if (isCorrect) {
      // debugLog.hookLifecycle("usePlayerGame", "submit_correct", {
      //   playerName: playerGame.player?.fullName,
      //   attemptsUsed: newAttempts.length,
      // });
      setGameWon(true);
      gameLogic.handleCorrectAnswer(1);

      setTimeout(() => {
        const gameData = {
          Player: playerGame.player,
          Letras: newAttempts.map((a) => a.evaluation),
        };
        gameLogic.endGame(true, null, gameData);
      }, 1000);
    } else if (newAttempts.length >= maxAttempts) {
      // debugLog.hookLifecycle("usePlayerGame", "submit_lost", {
      //   playerName: playerGame.player?.fullName,
      //   maxAttempts,
      // });
      setGameLost(true);
      gameLogic.handleIncorrectAnswer("Se acabaron los intentos");

      setTimeout(() => {
        const gameData = {
          Player: playerGame.player,
          Letras: newAttempts.map((a) => a.evaluation),
        };
        gameLogic.endGame(false, null, gameData);
      }, 1000);
    } else {
      gameLogic.handleIncorrectAnswer();
    }

    setCurrentGuess("");
  }, [
    playerGame,
    currentGuess,
    keyboardStatus,
    gameWon,
    gameLost,
    evaluateGuess,
    gameLogic,
  ]);

  // Teclado virtual/físico
  const handleKeyPress = useCallback(
    (key) => {
      if (gameWon || gameLost) return;

      const maxLen = (playerGame?.selectedName || "").length || 20;

      if (key === "ENTER") {
        handleSubmit();
      } else if (key === "BACKSPACE") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-ZÑ]$/i.test(key)) {
        // Limitar por el largo real de la palabra (no un número arbitrario 20)
        setCurrentGuess((prev) => {
          if (prev.length >= maxLen) return prev;
          return prev + key;
        });
      }
    },
    [playerGame, gameWon, gameLost, handleSubmit]
  );

  useEffect(() => {
    const handlePhysicalKey = (e) => {
      if (gameWon || gameLost) return;
      const key = e.key.toUpperCase();
      if (key === "ENTER" || key === "BACKSPACE" || /^[A-ZÑ]$/.test(key)) {
        e.preventDefault();
        handleKeyPress(key);
      }
    };

    window.addEventListener("keydown", handlePhysicalKey);
    return () => window.removeEventListener("keydown", handlePhysicalKey);
  }, [handleKeyPress, gameWon, gameLost]);

  const getKeyboardRows = useCallback(() => {
    return [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
    ];
  }, []);

  return {
    playerGame,
    loading,
    errorMessage,
    currentGuess,
    attempts,
    keyboardStatus,
    gameWon,
    gameLost,
    maxAttempts,
    gameLogic,
    handleKeyPress,
    handleSubmit,
    getKeyboardRows,
    initializeGame,
  };
}
