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
import { refreshAccessToken } from "@/services/api";
import { performLogout } from "@/utils/auth";

function normalizeString(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function useShirtGame({ gameMode, onGameEnd, clubId }) {
  // debugLog.hookLifecycle("useShirtGame", "mount", { gameMode, clubId });

  const user = useUserStore((state) => state.user);

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
  const gameAttemptsStore = useGameAttemptsStore();

  const gameConfig = GAME_CONFIGS.shirt;
  const timeLimit = gameConfig.modes[gameMode]?.timeLimit || 60;

  const saveGameAttempt = useCallback(
    async (won, gameStats, gameData) => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        debugLog.hookLifecycle("useShirtGame", "save_start", {
          won,
          shirtBrand: shirtGame?.shirt.brand,
          step,
        });

        const lastAttemptData = localAttempts
          ? localAttempts.getLastAttempt("shirt")
          : getLastAttempt("shirt");

        const currentScore = step;
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
          gameType: "shirt",
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

        // Guardado local si NO hay usuario
        if (!user) {
          localAttempts.updateAttempt("shirt", attemptData);
          return;
        }

        // ------------------------
        // Función interna para POST seguro
        // ------------------------
        const postAttempt = async () => {
          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/shirt/save`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(attemptData),
              }
            );

            if (res.status === 401) {
              // intento refresh token
              const refreshResult = await refreshAccessToken();
              console.log("refreshAccessToken result:", refreshResult);

              if (refreshResult?.ok || refreshResult.status === 200) {
                console.log("Retrying saveGameAttempt after token refresh");
                // retry
                const retryRes = await fetch(
                  `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/shirt/save`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(attemptData),
                  }
                );

                if (!retryRes.ok) {
                  throw new Error(`Retry failed: ${retryRes.status}`);
                }
                return await retryRes.json();
              } else {
                console.log("Token refresh failed -> performLogout");
                performLogout();
                return null;
              }
            }

            if (!res.ok) throw new Error(`Error al guardar: ${res.status}`);
            return await res.json();
          } catch (err) {
            console.error("postAttempt error:", err);
            throw err;
          }
        };

        const response = await postAttempt();

        if (response?.attempt) {
          gameAttemptsStore.updateAttempt(clubId, "shirt", {
            ...attemptData,
            streak: response.attempt.streak,
            _id: response.attempt._id,
            createdAt: response.attempt.createdAt,
            updatedAt: response.attempt.updatedAt,
          });
        }
      } catch (error) {
        debugLog.apiError("saveGameAttempt", error, "useShirtGame");
        setErrorMessage(error.message);
        console.error("Error saving game attempt:", error);
      } finally {
        isSavingRef.current = false;
      }
    },
    [getLastAttempt, localAttempts, gameMode, clubId, gameAttemptsStore, user]
  );

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: timeLimit,
    initialLives: 3,
    onGameEnd: async (won, stats, overrideGameData) => {
      const gameData = {
        "Escudo/Emblema":
          shirtGame?.shirt.emblemType === "escudo" ? "Escudo" : "Emblema",
        Marca: shirtGame?.shirt.brand || "Sin marca",
        Sponsors: shirtGame?.shirt.sponsors?.join(", ") || "Sin sponsors",
        Temporadas:
          shirtGame?.shirt.seasonsUsed?.join(", ") || "Sin temporadas",
      };

      // debugLog.hookLifecycle("useShirtGame", "game_end", {
      //   won,
      //   shirtBrand: shirtGame?.shirt.brand,
      //   step,
      // });

      await saveGameAttempt(won, stats, gameData);
      await onGameEnd(won, stats, gameData);
    },
  });

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;

    setLoading(true);

    try {
      const { getGame: getStoredGame } = useDailyGamesStore.getState();
      const stored = getStoredGame(clubId, "shirt");

      if (stored) {
        // debugLog.cacheHit("shirtGame", `useShirtGame_${clubId || "global"}`);
        setShirtGame(stored);
      } else {
        // debugLog.cacheMiss("shirtGame", `useShirtGame_${clubId || "global"}`);
        console.error("[shirtGame] NO daily found in store!");
        setErrorMessage("Error: la camiseta diaria no está precargada");
      }
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  const initializeGame = useCallback(() => {
    if (!shirtGame) return;

    // debugLog.hookLifecycle("useShirtGame", "initialize_game", {
    //   shirtBrand: shirtGame.shirt.brand,
    //   step: 1,
    // });

    setStep(1);
    setInput("");
    setCorrectSponsors([]);
    setSelectedSeasons([]);
    setSelectedEmblemType(null);
    setErrorMessage(null);

    gameLogic.startGame();

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

      // debugLog.hookLifecycle("useShirtGame", "submit_emblem", {
      //   selected: selectedEmblemType,
      //   correct: correctAnswer,
      //   isCorrect,
      // });

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

      // debugLog.hookLifecycle("useShirtGame", "submit_brand", {
      //   submitted: input,
      //   correct: correctBrand,
      //   isCorrect,
      // });

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

      // debugLog.hookLifecycle("useShirtGame", "submit_count", {
      //   submitted: value,
      //   correct: shirt.sponsors?.length || 0,
      //   isCorrect,
      // });

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

      // debugLog.hookLifecycle("useShirtGame", "submit_sponsor", {
      //   submitted: input,
      //   correctSponsors: correctSponsors.length,
      //   totalSponsors: shirt.sponsors?.length || 0,
      //   isCorrect: shirt.sponsors?.some((s) => normalizeString(s) === value),
      // });
    } else if (step === 5) {
      const correct =
        selectedSeasons.sort().join(",") ===
        (shirt.seasonsUsed?.sort().join(",") || "");

      // debugLog.hookLifecycle("useShirtGame", "submit_seasons", {
      //   selectedSeasons,
      //   correctSeasons: shirt.seasonsUsed,
      //   isCorrect: correct,
      // });

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
