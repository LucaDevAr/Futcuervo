"use client";

import { useState, useEffect } from "react";
import StartScreen from "@/components/screens/StartScreen";
import EndScreen from "@/components/screens/EndScreen";
import LoadingScreen from "@/components/ui/loading-screen";
import GameScreen from "@/components/screens/GameScreen";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useUserStore } from "@/stores/userStore";
import { useShirtGame } from "@/hooks/games/useShirtGame";

export const dynamic = "force-dynamic";

export default function ShirtGame({ clubId, homeUrl }) {
  const [gameMode, setGameMode] = useState("lives");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const user = useUserStore((state) => state.user);

  const userAttempts = useGameAttempts(clubId);
  const localAttempts = useLocalGameAttempts(clubId);

  // Use local attempts if no user, otherwise use user attempts
  const attempts = user ? userAttempts : localAttempts;
  const wasPlayedToday = attempts?.wasPlayedToday?.("shirt") || false;
  const getLastAttempt = () => attempts?.getLastAttempt?.("shirt") || null;
  const attemptsLoading = user ? userAttempts.isLoading : false;

  const shirtGameHook = useShirtGame({
    gameMode,
    clubId,
    onGameEnd: async (won, stats, gameData) => {
      console.log("[ShirtGame] Game ended:", { won, stats, gameData });
    },
  });

  const lastAttempt = getLastAttempt();

  // 🔹 Evita mismatch SSR/CSR
  if (!isClient) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-[var(--azul)] dark:text-[var(--blanco)]">
          Cargando juego...
        </p>
      </div>
    );
  }

  if (attemptsLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] dark:border-[var(--secondary)] mx-auto mb-4"></div>
          <p>Cargando datos del juego...</p>
        </div>
      </div>
    );
  }

  if (shirtGameHook.loading) {
    return <LoadingScreen message="Cargando juego..." />;
  }

  if (shirtGameHook.errorMessage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-[var(--azul)] dark:text-[var(--blanco)]">
          {shirtGameHook.errorMessage}
        </p>
      </div>
    );
  }

  // 🔹 Ya jugó hoy
  if (wasPlayedToday && lastAttempt) {
    const gameData = lastAttempt.gameData || {};
    const gameWon = lastAttempt.won || false;
    const stats = {
      finalTime: lastAttempt.timeUsed || 0,
      livesRemaining: lastAttempt.livesRemaining || 0,
      attempts: lastAttempt.attempts,
      score: lastAttempt.score,
      totalQuestions: 5,
    };

    return (
      <EndScreen
        gameSlug="shirt"
        gameMode={lastAttempt.gameMode || gameMode}
        gameWon={gameWon}
        stats={stats}
        formatTime={shirtGameHook.gameLogic.formatTime}
        gameData={gameData}
        homeUrl={homeUrl}
        mediaContent={
          <img
            src={
              shirtGameHook.shirtGame?.shirt.images.withSponsors?.[0] ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt="Camiseta del día"
            width={300}
            height={400}
            className="h-full w-auto object-contain max-h-[80%] rounded-lg shadow-lg"
          />
        }
      />
    );
  }

  // 🔹 Game over
  if (shirtGameHook.gameLogic.gameOver) {
    const stats = {
      finalTime:
        gameMode === "time"
          ? shirtGameHook.gameLogic.timeLimit - shirtGameHook.gameLogic.timeLeft
          : shirtGameHook.gameLogic.gameStartTime
          ? Math.floor(
              (Date.now() - shirtGameHook.gameLogic.gameStartTime.getTime()) /
                1000
            )
          : 0,
      livesRemaining: shirtGameHook.gameLogic.lives,
      attempts: shirtGameHook.gameLogic.attempts,
      score: shirtGameHook.gameLogic.score,
      totalQuestions: 5,
    };

    const gameData = {
      "Escudo/Emblema":
        shirtGameHook.shirtGame?.shirt.emblemType === "escudo"
          ? "Escudo"
          : "Emblema",
      Marca: shirtGameHook.shirtGame?.shirt.brand || "Sin marca",
      Sponsors:
        shirtGameHook.shirtGame?.shirt.sponsors?.join(", ") || "Sin sponsors",
      Temporadas:
        shirtGameHook.shirtGame?.shirt.seasonsUsed?.join(", ") ||
        "Sin temporadas",
    };

    return (
      <EndScreen
        gameSlug="shirt"
        gameMode={gameMode}
        gameWon={shirtGameHook.gameLogic.gameWon}
        stats={stats}
        formatTime={shirtGameHook.gameLogic.formatTime}
        gameData={gameData}
        homeUrl={homeUrl}
        mediaContent={
          <img
            src={
              shirtGameHook.shirtGame?.shirt.images.withSponsors?.[0] ||
              "/placeholder.svg" ||
              "/placeholder.svg"
            }
            alt="Camiseta del día"
            width={300}
            height={400}
            className="h-full w-auto object-contain max-h-[80%] rounded-lg shadow-lg"
          />
        }
      />
    );
  }

  // 🔹 Pantalla inicial
  if (!shirtGameHook.gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="shirt"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={shirtGameHook.initializeGame}
        loading={false}
        availableModes={["lives", "time"]}
      />
    );
  }

  // 🔹 Juego activo
  return (
    <GameScreen
      gameSlug="shirt"
      gameMode={gameMode}
      timeLeft={shirtGameHook.gameLogic.timeLeft}
      lives={shirtGameHook.gameLogic.lives}
      currentStep={shirtGameHook.step}
      totalSteps={5}
      title="Camiseta"
      question={shirtGameHook.getStepTitle()}
      onSubmit={shirtGameHook.handleSubmit}
      canSubmit={
        (shirtGameHook.step === 1 && !!shirtGameHook.selectedEmblemType) ||
        (shirtGameHook.step === 5 &&
          shirtGameHook.selectedSeasons.length > 0) ||
        (shirtGameHook.step !== 1 && shirtGameHook.step !== 5)
      }
      showFeedback={shirtGameHook.gameLogic.showFeedback}
      formatTime={shirtGameHook.gameLogic.formatTime}
      mediaContent={
        <img
          src={shirtGameHook.renderImage() || "/placeholder.svg"}
          alt="Camiseta del día"
          width={400}
          height={500}
          className="h-full w-auto object-contain max-h-full rounded-lg shadow-lg"
        />
      }
      gameLogic={shirtGameHook.gameLogic}
    >
      {/* Paso 1: Escudo o Emblema */}
      {shirtGameHook.step === 1 ? (
        <div className="grid grid-cols-2 gap-3">
          <button
            className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-bold text-base ${
              shirtGameHook.selectedEmblemType === "escudo"
                ? "bg-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] border-[var(--blanco)] shadow-lg"
                : "bg-transparent border-[var(--blanco)] text-[var(--blanco)] hover:bg-[var(--blanco)] hover:text-[var(--azul)] dark:hover:text-[var(--rojo)]"
            }`}
            onClick={() => shirtGameHook.selectEmblemType("escudo")}
          >
            Escudo
          </button>
          <button
            className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-bold text-base ${
              shirtGameHook.selectedEmblemType === "emblema"
                ? "bg-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] border-[var(--blanco)] shadow-lg"
                : "bg-transparent border-[var(--blanco)] text-[var(--blanco)] hover:bg-[var(--blanco)] hover:text-[var(--azul)] dark:hover:text-[var(--rojo)]"
            }`}
            onClick={() => shirtGameHook.selectEmblemType("emblema")}
          >
            Emblema
          </button>
        </div>
      ) : shirtGameHook.step === 5 ? (
        // Paso 5: Temporadas
        <div className="grid grid-cols-6 lg:grid-cols-8 gap-1">
          {Array.from({ length: 46 }, (_, i) => (1980 + i).toString()).map(
            (season) => (
              <button
                key={season}
                className={`px-1 py-0.5 rounded-xl border-2 transition-all duration-200 font-bold text-xs lg:text-base ${
                  shirtGameHook.selectedSeasons.includes(season)
                    ? "bg-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] border-[var(--blanco)] shadow-lg"
                    : "bg-transparent border-[var(--blanco)] text-[var(--blanco)] hover:bg-[var(--blanco)] hover:text-[var(--azul)] dark:hover:text-[var(--rojo)]"
                }`}
                onClick={() => shirtGameHook.toggleSeason(season)}
              >
                {season}
              </button>
            )
          )}
        </div>
      ) : (
        // Pasos 2-4
        <div className="space-y-4">
          <input
            type="text"
            value={shirtGameHook.input}
            onChange={(e) => shirtGameHook.setInput(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 text-base bg-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] focus:outline-none focus:shadow-lg placeholder:text-[var(--gris)]"
            placeholder="Escribí tu respuesta..."
            onKeyPress={(e) =>
              e.key === "Enter" && shirtGameHook.handleSubmit()
            }
          />

          {shirtGameHook.step === 4 &&
            shirtGameHook.correctSponsors.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-[var(--blanco)]">
                  Sponsors correctos:
                </p>
                <div className="flex flex-wrap gap-2">
                  {shirtGameHook.correctSponsors.map((s, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] shadow-md"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </GameScreen>
  );
}
