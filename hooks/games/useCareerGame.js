"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useDailyGames } from "@/hooks/game-state/useDailyGames";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { getGame } from "@/utils/gameCache"; // Declare the getGame variable

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useCareerGame({ gameMode, onGameEnd, clubId }) {
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
  const { getGame } = useDailyGames(clubId);

  const gameConfig = GAME_CONFIGS.career;
  const timeLimit = gameConfig.modes[gameMode]?.timeLimit || 30;

  // Calcular vidas según cantidad de clubes
  useEffect(() => {
    if (careerGame?.player?.career?.length) {
      const clubCount = careerGame.player.career.length;
      setInitialLives(clubCount > 6 ? 5 : 3);
    }
  }, [careerGame]);

  // Inicializar la lógica del juego correctamente con hooks
  const gameLogic = useGameLogic({
    gameMode,
    timeLimit,
    initialLives,
    onGameEnd: async (won, stats) => {
      const player = careerGame?.player;
      const gameData = {
        Nombre: player?.fullName,
        Nacionalidad: player?.nationality.name,
        Goles: player?.goals,
        Partidos: player?.appearances,
        "Pistas reveladas": revealedIndices.length,
      };

      await saveGameAttempt(won, stats, gameData);
      await onGameEnd(won, stats, gameData);
    },
  });

  // Guardar intento
  const saveGameAttempt = useCallback(
    async (won, gameStats, gameData) => {
      if (isSavingRef.current || !gameLogic) return;
      isSavingRef.current = true;

      try {
        const lastAttemptData = localAttempts
          ? localAttempts.getLastAttempt("career")
          : getLastAttempt("career");

        const currentScore = won ? 1 : 0;
        const recordScore = lastAttemptData?.recordScore
          ? Math.max(currentScore, lastAttemptData.recordScore)
          : currentScore;
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
          streak: won ? (lastAttemptData?.streak || 0) + 1 : 0,
          date: new Date(),
        };

        if (localAttempts) {
          localAttempts.updateAttempt("career", attemptData);
          isSavingRef.current = false;
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/career/save`,
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
      } finally {
        isSavingRef.current = false;
      }
    },
    [getLastAttempt, gameLogic, refetchAttempts, clubId, gameMode]
  );

  // Fetch del juego career
  useEffect(() => {
    const fetchCareerGame = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        setLoading(true);

        const cachedGame = getGame("career");
        if (cachedGame) {
          setCareerGame(cachedGame);
          const sanLorenzoIndex = cachedGame.player.career.findIndex((step) =>
            step.club.name.toLowerCase().includes("san lorenzo")
          );
          setClubIndex(sanLorenzoIndex !== -1 ? sanLorenzoIndex : null);
          setLoading(false);
          return;
        }

        const localDate = new Date().toLocaleDateString("sv-SE");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/career-game?date=${localDate}`,
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!data.careerGame) {
          setErrorMessage("No hay juego disponible para hoy");
          return;
        }

        setCareerGame(data.careerGame);
        const sanLorenzoIndex = data.careerGame.player.career.findIndex(
          (step) => step.club.name.toLowerCase().includes("san lorenzo")
        );
        setClubIndex(sanLorenzoIndex !== -1 ? sanLorenzoIndex : null);
      } catch (error) {
        console.error("Error cargando el juego career:", error);
        setErrorMessage("Error al cargar el juego del día");
      } finally {
        setLoading(false);
      }
    };

    fetchCareerGame();
  }, [clubId, getGame]);

  // Inicializar juego
  const initializeGame = useCallback(() => {
    if (!careerGame || !gameLogic) return;

    setGuess("");
    setRevealedIndices([]);
    setErrorMessage(null);

    gameLogic.startGame();
  }, [careerGame, gameLogic]);

  // Manejar envío de guess
  const handleSubmit = useCallback(() => {
    if (!guess.trim() || !careerGame || !gameLogic) {
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
      gameLogic.handleCorrectAnswer(1);
      setTimeout(() => {
        gameLogic.endGame(true);
      }, 1000);
    } else {
      gameLogic.handleIncorrectAnswer("Nombre incorrecto");
      setGuess("");

      // Revelar un club aleatorio
      const allIndices = careerGame.player.career.map((_, i) => i);
      const unrevealed = allIndices.filter((i) => !revealedIndices.includes(i));

      if (unrevealed.length > 0) {
        const randomIndex =
          unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setRevealedIndices([...revealedIndices, randomIndex]);
      }
    }
  }, [guess, careerGame, gameLogic, revealedIndices]);

  // Obtener pasos de carrera con estado de revelado
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
