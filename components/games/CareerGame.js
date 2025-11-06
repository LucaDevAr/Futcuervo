"use client";

import { useState, useEffect } from "react";
import { Heart, Clock } from "lucide-react";
import { Shield } from "lucide-react";
import { ArrowDown, ArrowRight } from "lucide-react";
import StartScreen from "@/components/screens/StartScreen";
import EndScreen from "@/components/screens/EndScreen";
import LoadingScreen from "@/components/ui/loading-screen";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useUserStore } from "@/stores/userStore";
import { useCareerGame } from "@/hooks/games/useCareerGame";

export const dynamic = "force-dynamic";

export default function CareerGame({ clubId, homeUrl }) {
  const [gameMode, setGameMode] = useState("lives");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const user = useUserStore((state) => state.user);

  // Hooks
  const userAttempts = useGameAttempts(clubId); // DB
  const localAttempts = useLocalGameAttempts(clubId); // localStorage

  // Si hay usuario → usamos DB, sino Local
  const attempts = user ? userAttempts : localAttempts;

  const wasPlayedToday = attempts?.wasPlayedToday?.("career") || false;
  const getLastAttempt = () => attempts?.getLastAttempt?.("career") || null;
  const attemptsLoading = user ? userAttempts.isLoading : false;

  const careerGameHook = useCareerGame({
    gameMode,
    clubId,
    onGameEnd: async (won, stats, gameData) => {
      console.log("[PlayerGame] Game ended:", { won, stats, gameData });
    },
  });

  const lastAttempt = getLastAttempt();

  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()))
      age--;
    return age;
  };

  const TimelineComponent = ({ showAll = false }) => {
    if (!careerGameHook.careerGame) return null;

    // 🔹 Traemos y ordenamos los pasos cronológicamente
    const timelineSteps = careerGameHook
      .getCareerSteps()
      .sort((a, b) => new Date(a.from) - new Date(b.from));

    if (!timelineSteps.length) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-[var(--primary)] dark:text-[var(--white)]">
          <p>No se encontraron etapas en la carrera del jugador.</p>
        </div>
      );
    }

    // 🔹 Dividimos en dos columnas si hay más de 5 clubes
    const half = Math.ceil(timelineSteps.length / 2);
    const leftColumn = timelineSteps.slice(0, half);
    const rightColumn = timelineSteps.slice(half);

    const renderStep = (
      step,
      index,
      isFirst,
      isLast,
      isLeftColumn,
      columnLength
    ) => {
      const club = step.club;
      const isCurrentClub = club?._id?.toString() === clubId?.toString();
      const isRevealed = showAll || isCurrentClub || step.revealed;

      // Determinar si mostrar flecha
      const showArrow =
        !(isLeftColumn && index === columnLength - 1) && // último de columna izquierda no muestra
        !isLast; // último global tampoco muestra

      return (
        <div key={index} className="relative flex flex-col items-center group">
          {/* 🔢 Número dentro del card */}
          <div className="absolute top-1 left-1 bg-[var(--primary)] dark:bg-white text-white dark:text-[var(--background)] text-xs font-bold px-1.5 py-0.5 rounded z-10">
            #{index + 1}
          </div>

          {/* 🔹 Card */}
          <div
            className={`
          flex items-center gap-3 p-2 mb-4 rounded-lg border
          bg-[var(--secondary)] dark:bg-[var(--primary)] 
          border-[var(--primary)] dark:border-[var(--secondary)]
          shadow-sm transition-all duration-150 hover:scale-[1.02] w-full
        `}
          >
            {/* 🛡️ Escudo */}
            <div className="w-12 h-12 flex-shrink-0 rounded-full overflow-hidden border border-[var(--primary)] dark:border-[var(--secondary)] bg-[var(--background)] flex items-center justify-center">
              {isRevealed &&
              (club?.logo || club?.shieldImage || club?.image) ? (
                <img
                  src={club.logo || club.shieldImage || club.image}
                  alt={club.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Shield
                  className="w-6 h-6 text-[var(--primary)] dark:text-[var(--secondary)] opacity-60"
                  strokeWidth={2}
                />
              )}
            </div>

            {/* 🏷️ Info */}
            <div className="flex flex-col justify-center text-[var(--black)] dark:text-[var(--white)] text-sm">
              <p
                className={`font-semibold leading-tight ${
                  isCurrentClub
                    ? "text-[var(--primary)] dark:text-[var(--secondary)]"
                    : "opacity-70"
                }`}
              >
                {isRevealed ? club?.name || "Club desconocido" : "??????"}
              </p>
              {isFirst ? (
                <p className="opacity-80">
                  {isRevealed
                    ? `${new Date(step.from).getFullYear()} (Debut)`
                    : "???? (Debut)"}
                </p>
              ) : isLast && step.to ? (
                <p className="opacity-80">
                  {isRevealed
                    ? `${new Date(step.to).getFullYear()} (Retiro)`
                    : "???? (Retiro)"}
                </p>
              ) : (
                <p className="opacity-80">
                  {isRevealed
                    ? `${new Date(step.from).getFullYear()} - ${
                        step.to ? new Date(step.to).getFullYear() : "Presente"
                      }`
                    : "???? - ???? "}
                </p>
              )}
            </div>
          </div>

          {/* Flecha hacia abajo */}
          {showArrow && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mb-2 text-[var(--primary)] dark:text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          )}
        </div>
      );
    };

    return (
      <div className="flex flex-col items-center justify-center py-4 px-2 overflow-y-auto max-h-[100vh]">
        {timelineSteps.length > 5 ? (
          <div className="grid grid-cols-2 gap-8 max-w-5xl w-full">
            <div className="flex flex-col">
              {leftColumn.map((step, i) =>
                renderStep(step, i, i === 0, false, true, leftColumn.length)
              )}
            </div>

            <div className="flex flex-col">
              {rightColumn.map((step, i) =>
                renderStep(
                  step,
                  i + half,
                  false,
                  i === rightColumn.length - 1,
                  false,
                  rightColumn.length
                )
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col w-full max-w-md">
            {timelineSteps.map((step, i) =>
              renderStep(
                step,
                i,
                i === 0,
                i === timelineSteps.length - 1 && !!step.to,
                true,
                timelineSteps.length
              )
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-primary dark:text-secondary">Cargando juego...</p>
      </div>
    );
  }

  if (attemptsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary dark:border-secondary mx-auto mb-4"></div>
          <p>Cargando datos del juego...</p>
        </div>
      </div>
    );
  }

  if (careerGameHook.loading) {
    return <LoadingScreen message="Cargando juego..." />;
  }

  if (careerGameHook.errorMessage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-primary dark:text-secondary">
          {careerGameHook.errorMessage}
        </p>
      </div>
    );
  }

  if (wasPlayedToday && lastAttempt) {
    const gameData = lastAttempt.gameData || {};
    const gameWon = lastAttempt.won || false;
    const player = careerGameHook.careerGame?.player;

    return (
      <EndScreen
        gameSlug="career"
        gameMode={lastAttempt.gameMode || gameMode}
        gameWon={gameWon}
        stats={{
          finalTime: lastAttempt.timeUsed || 0,
          livesRemaining: lastAttempt.livesRemaining || 0,
          attempts: lastAttempt.attempts,
          score: lastAttempt.score,
        }}
        formatTime={careerGameHook.gameLogic.formatTime}
        gameData={gameData}
        homeUrl={homeUrl}
        mediaContent={
          <div className="flex flex-col items-center gap-4 w-full h-full relative">
            {player?.profileImage && (
              <div className="w-20 lg:w-28 h-20 rounded-full overflow-hidden border-4 border-primary dark:border-secondary absolute top-1/2 -translate-y-1/2 lg:static">
                <img
                  src={player?.profileImage || "/placeholder.svg"}
                  alt={player?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="w-full h-full">
              <TimelineComponent showAll />
            </div>
          </div>
        }
      />
    );
  }

  if (careerGameHook.gameLogic.gameOver) {
    const player = careerGameHook.careerGame?.player;
    const gameData = {
      Nombre: player?.fullName,
      Nacionalidad: player?.nationality.name,
      Goles: player?.goals,
      Partidos: player?.appearances,
      "Pistas reveladas": careerGameHook.revealedIndices.length,
    };

    return (
      <EndScreen
        gameSlug="career"
        gameMode={gameMode}
        gameWon={careerGameHook.gameLogic.gameWon}
        stats={{
          finalTime: careerGameHook.gameLogic.gameStartTime
            ? Math.floor(
                (Date.now() -
                  careerGameHook.gameLogic.gameStartTime.getTime()) /
                  1000
              )
            : 0,
          livesRemaining: careerGameHook.gameLogic.lives,
          attempts: careerGameHook.gameLogic.attempts,
          score: careerGameHook.gameLogic.score,
        }}
        formatTime={careerGameHook.gameLogic.formatTime}
        gameData={gameData}
        homeUrl={homeUrl}
        mediaContent={
          <div className="flex flex-col items-center gap-4 w-full h-full relative">
            {player?.profileImage && (
              <div className="w-20 lg:w-28 h-20 rounded-full overflow-hidden border-4 border-primary dark:border-secondary absolute top-1/2 -translate-y-1/2 lg:static">
                <img
                  src={player?.profileImage || "/placeholder.svg"}
                  alt={player?.fullName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="w-full h-full">
              <TimelineComponent showAll />
            </div>
          </div>
        }
      />
    );
  }

  if (!careerGameHook.gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="career"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={careerGameHook.initializeGame}
        loading={careerGameHook.loading}
        availableModes={["lives", "time"]}
      />
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col lg:flex-row w-full bg-[var(--background)]">
      <div className="h-[65%] lg:w-1/2 flex flex-col lg:py-8 lg:h-full">
        <TimelineComponent />
      </div>

      <div className="h-[35%] lg:w-1/2 flex flex-col justify-center items-center p-6 bg-[var(--primary)] dark:bg-[var(--secondary)] lg:h-full">
        <h3 className="text-2xl lg:text-4xl font-bold text-white lg:mb-6">
          ¿Quién es?
        </h3>

        <div className="flex items-center gap-4 lg:mb-4">
          {gameMode === "lives" ? (
            <div className="flex items-center gap-2">
              {Array.from({
                length: careerGameHook.initialLives || 3,
              }).map((_, index) => (
                <Heart
                  key={index}
                  size={24}
                  className={
                    index < (careerGameHook.gameLogic.lives ?? 0)
                      ? "text-secondary fill-secondary dark:text-primary dark:fill-primary"
                      : "text-white opacity-30"
                  }
                />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-white">
              <Clock size={24} />
              <span className="text-xl font-bold">
                {careerGameHook.gameLogic.formatTime(
                  careerGameHook.gameLogic.timeLeft
                )}
              </span>
            </div>
          )}
        </div>

        <div className="w-full max-w-md space-y-2 lg:space-y-6">
          <div className="text-center text-white">
            <p className="text-lg lg:mb-2">
              Adivina el jugador por su trayectoria
            </p>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              value={careerGameHook.guess}
              onChange={(e) => careerGameHook.setGuess(e.target.value)}
              placeholder="Escribe el nombre del jugador..."
              className="w-full px-4 py-3 rounded-xl border-2 text-base transition-all duration-200 focus:outline-none bg-white text-primary dark:text-secondary border-white focus:border-white focus:shadow-lg placeholder:text-background"
              onKeyPress={(e) =>
                e.key === "Enter" && careerGameHook.handleSubmit()
              }
              disabled={careerGameHook.gameLogic.gameOver}
            />

            <button
              onClick={careerGameHook.handleSubmit}
              disabled={
                careerGameHook.gameLogic.gameOver ||
                !careerGameHook.guess.trim()
              }
              className="w-full py-3 rounded-xl font-bold text-base transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg bg-white text-primary dark:text-secondary hover:opacity-90 border-2 border-white"
            >
              Confirmar Respuesta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
