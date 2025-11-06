"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { getGame } from "@/utils/gameCache"; // Declare the getGame variable

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useShirtGame({ gameMode, onGameEnd, clubId }) {
  const [shirtGame, setShirtGame] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Game state
  const [step, setStep] = useState(1);
  const [input, setInput] = useState("");
  const [correctSponsors, setCorrectSponsors] = useState([]);
  const [selectedSeasons, setSelectedSeasons] = useState([]);
  const [selectedEmblemType, setSelectedEmblemType] = useState(null);

  const isSavingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const localAttempts = useLocalGameAttempts(clubId);
  const { getLastAttempt, refetch: refetchAttempts } = useGameAttempts(clubId);

  const gameConfig = GAME_CONFIGS.shirt;
  const timeLimit = gameConfig.modes[gameMode]?.timeLimit || 60;

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: timeLimit,
    initialLives: 3,
    onGameEnd: async (won, stats) => {
      const gameData = {
        "Escudo/Emblema":
          shirtGame?.shirt.emblemType === "escudo" ? "Escudo" : "Emblema",
        Marca: shirtGame?.shirt.brand || "Sin marca",
        Sponsors: shirtGame?.shirt.sponsors?.join(", ") || "Sin sponsors",
        Temporadas:
          shirtGame?.shirt.seasonsUsed?.join(", ") || "Sin temporadas",
        step: step,
        correctSponsors: correctSponsors.length,
        totalSponsors: shirtGame?.shirt.sponsors?.length || 0,
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
        const lastAttemptData = localAttempts
          ? localAttempts.getLastAttempt("shirt")
          : getLastAttempt("shirt");

        const currentScore = step;
        const recordScore = lastAttemptData?.recordScore
          ? Math.max(currentScore, lastAttemptData.recordScore)
          : currentScore;

        const attemptData = {
          gameType: "shirt",
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
          localAttempts.updateAttempt("shirt", attemptData);
          isSavingRef.current = false;
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/shirt/save`,
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
    [
      step,
      getLastAttempt,
      localAttempts,
      gameMode,
      gameLogic.lives,
      refetchAttempts,
      clubId,
      shirtGame,
    ]
  );

  // Fetch shirt game
  useEffect(() => {
    const fetchShirtGame = async () => {
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        setLoading(true);

        const cachedGame = getGame("shirt", clubId);
        console.log("[v0] useShirtGame - cached game:", cachedGame);

        if (cachedGame) {
          setShirtGame(cachedGame);
          setLoading(false);
          return;
        }

        const localDate = new Date().toLocaleDateString("sv-SE");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/shirt/daily?clubId=${clubId}&date=${localDate}`,
          {
            cache: "no-store",
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!data.shirtGame) {
          setErrorMessage("No hay camiseta disponible para hoy");
          return;
        }

        setShirtGame(data.shirtGame);
      } catch (error) {
        console.error("Error cargando la camiseta diaria:", error);
        setErrorMessage("Error al cargar la camiseta del día");
      } finally {
        setLoading(false);
      }
    };

    fetchShirtGame();
  }, [clubId]);

  const initializeGame = useCallback(() => {
    if (!shirtGame) return;

    setStep(1);
    setInput("");
    setCorrectSponsors([]);
    setSelectedSeasons([]);
    setSelectedEmblemType(null);
    setErrorMessage(null);

    gameLogic.startGame();

    // Skip Step 1 if no emblemType
    if (!shirtGame.shirt.emblemType) {
      setStep(2);
    }
  }, [shirtGame, gameLogic]);

  const handleSubmit = useCallback(() => {
    if (!shirtGame) return;

    let isCorrect = false;
    const shirt = shirtGame.shirt;

    if (step === 1) {
      if (!selectedEmblemType) {
        gameLogic.handleIncorrectAnswer("Por favor selecciona una opción");
        return;
      }

      const correctAnswer = shirt.emblemType?.toLowerCase() || "escudo";
      isCorrect = selectedEmblemType === correctAnswer;

      if (isCorrect) {
        gameLogic.handleCorrectAnswer(5);
        setTimeout(() => {
          setStep(2);
          setSelectedEmblemType(null);
          setInput("");
        }, 1000);
      } else {
        gameLogic.handleIncorrectAnswer(
          `Respuesta incorrecta. Esta camiseta tenía ${correctAnswer}.`
        );
      }
    } else if (step === 2) {
      const value = normalizeString(input);
      if (!value) {
        gameLogic.handleIncorrectAnswer("Por favor ingresa una respuesta");
        return;
      }

      const correctBrand = normalizeString(shirt.brand || "");
      isCorrect = value === correctBrand;

      if (isCorrect) {
        gameLogic.handleCorrectAnswer(5);
        setTimeout(() => {
          setStep(3);
          setInput("");
        }, 1000);
      } else {
        gameLogic.handleIncorrectAnswer("Marca incorrecta.");
        setInput("");
      }
    } else if (step === 3) {
      const value = input.trim().toLowerCase();
      if (!value) {
        gameLogic.handleIncorrectAnswer("Por favor ingresa una respuesta");
        return;
      }

      isCorrect = Number.parseInt(value) === (shirt.sponsors?.length || 0);

      if (isCorrect) {
        gameLogic.handleCorrectAnswer(5);
        setTimeout(() => {
          setStep(4);
          setInput("");
        }, 1000);
      } else {
        gameLogic.handleIncorrectAnswer("Cantidad incorrecta.");
        setInput("");
      }
    } else if (step === 4) {
      const value = normalizeString(input);
      if (!value) {
        gameLogic.handleIncorrectAnswer("Por favor ingresa una respuesta");
        return;
      }

      if (shirt.sponsors?.some((s) => normalizeString(s) === value)) {
        if (!correctSponsors.includes(value)) {
          setCorrectSponsors([...correctSponsors, value]);
          setInput("");

          if (
            [...correctSponsors, value].length === (shirt.sponsors?.length || 0)
          ) {
            gameLogic.handleCorrectAnswer(5);
            setTimeout(() => {
              setStep(5);
              setInput("");
            }, 1000);
          } else {
            gameLogic.handleCorrectAnswer(5);
          }
        } else {
          gameLogic.handleIncorrectAnswer("Ya ingresaste este sponsor.");
        }
      } else {
        gameLogic.handleIncorrectAnswer("Sponsor incorrecto.");
        setInput("");
      }
    } else if (step === 5) {
      if (selectedSeasons.length === 0) {
        gameLogic.handleIncorrectAnswer(
          "Por favor selecciona al menos una temporada"
        );
        return;
      }

      const correct =
        selectedSeasons.sort().join(",") ===
        (shirt.seasonsUsed?.sort().join(",") || "");

      if (correct) {
        gameLogic.handleCorrectAnswer(5);
        setTimeout(() => {
          gameLogic.endGame(true);
        }, 1000);
      } else {
        gameLogic.handleIncorrectAnswer("Temporadas incorrectas.");
      }
    }
  }, [
    shirtGame,
    step,
    selectedEmblemType,
    input,
    correctSponsors,
    selectedSeasons,
    gameLogic,
  ]);

  const toggleSeason = useCallback((season) => {
    setSelectedSeasons((prev) =>
      prev.includes(season)
        ? prev.filter((s) => s !== season)
        : [...prev, season]
    );
  }, []);

  const selectEmblemType = useCallback((type) => {
    setSelectedEmblemType(type);
  }, []);

  const renderImage = useCallback(() => {
    if (!shirtGame || !shirtGame.shirt.images) {
      return "/placeholder.svg";
    }

    const shirt = shirtGame.shirt;

    if (step === 1) return shirt.images.base;
    if (step === 2) return shirt.images.withoutEmblem || shirt.images.base;
    if (step === 3)
      return (
        shirt.images.noSponsors ||
        shirt.images.withoutEmblem ||
        shirt.images.base
      );
    if (step === 4)
      return (
        shirt.images.noSponsors ||
        shirt.images.withoutEmblem ||
        shirt.images.base
      );
    if (step === 5)
      return (
        shirt.images.withSponsors?.[0] ||
        shirt.images.noSponsors ||
        shirt.images.base
      );

    return (
      shirt.images.withSponsors?.[0] ||
      shirt.images.noSponsors ||
      shirt.images.base
    );
  }, [shirtGame, step]);

  const getStepTitle = useCallback(() => {
    if (!shirtGame) return "";

    switch (step) {
      case 1:
        return "¿Esta camiseta tenía escudo o emblema?";
      case 2:
        return "¿Qué marca diseñó esta camiseta?";
      case 3:
        return "¿Cuántos sponsors tenía esta camiseta?";
      case 4:
        return `¿Cuáles eran los sponsors? (${correctSponsors.length}/${
          shirtGame.shirt.sponsors?.length || 0
        })`;
      case 5:
        return "¿En qué temporada(s) se usó?";
      default:
        return "";
    }
  }, [shirtGame, step, correctSponsors]);

  return {
    shirtGame,
    loading,
    errorMessage,
    step,
    input,
    setInput,
    correctSponsors,
    selectedSeasons,
    selectedEmblemType,
    gameLogic,
    handleSubmit,
    toggleSeason,
    selectEmblemType,
    renderImage,
    getStepTitle,
    initializeGame,
  };
}
