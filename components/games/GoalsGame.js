"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import StartScreen from "@/components/screens/StartScreen";
import EndScreen from "@/components/screens/EndScreen";
import LoadingScreen from "@/components/ui/loading-screen";
import MoreOrLessGameScreen from "@/components/screens/MoreOrLessGameScreen";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useUserStore } from "@/stores/userStore";
import { useGameDataPreload } from "@/hooks/games/useGameDataPreload";
import { useGoalsGame } from "@/hooks/games/useGoalsGame";

export const dynamic = "force-dynamic";

export default function GoalsGame({ clubId, homeUrl }) {
  const [gameMode, setGameMode] = useState("normal");

  const {
    players: allPlayers,
    isLoading: dataLoading,
    error: dataError,
  } = useGameDataPreload("goals", clubId);

  const user = useUserStore((state) => state.user);

  const userAttempts = useGameAttempts(clubId);
  const localAttempts = useLocalGameAttempts(clubId);

  // Use local attempts if no user, otherwise use user attempts
  const attempts = user ? userAttempts : localAttempts;
  const wasPlayedToday = attempts?.wasPlayedToday?.("goals") || false;
  const getLastAttempt = () => attempts?.getLastAttempt?.("goals") || null;
  const attemptsLoading = user ? userAttempts.isLoading : false;

  const goalsGame = useGoalsGame({
    gameMode,
    clubId,
    preloadedPlayers: allPlayers || [],
    onGameEnd: async (won, stats, gameData) => {
      console.log("[GoalsGame] Game ended:", { won, stats, gameData });
    },
  });

  const lastAttempt = getLastAttempt();

  if (dataLoading) return <LoadingScreen message="Cargando jugadores..." />;

  if (dataError)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error: {dataError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  if (attemptsLoading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] dark:border-[var(--secondary)] mx-auto mb-4"></div>
          <p>Cargando datos del juego...</p>
        </div>
      </div>
    );

  // ✅ Caso: el usuario ya jugó hoy
  if (wasPlayedToday && lastAttempt) {
    const gameData = lastAttempt.gameData || {};
    const gameWon = lastAttempt.won || false;

    const leftGoals = gameData.jugadores?.left?.goals ?? 0;
    const rightGoals = gameData.jugadores?.right?.goals ?? 0;
    const lastGuessFromData = gameData.lastGuess;

    const isWrongAnswer =
      gameData["Razón de finalización"] === "Respuesta incorrecta" &&
      lastGuessFromData !== null;
    const showWrongMore =
      isWrongAnswer && lastGuessFromData === "more" && rightGoals <= leftGoals;

    const gameDataFiltered = Object.fromEntries(
      Object.entries(gameData)
        .filter(([key]) => key !== "jugadores")
        .filter(([key]) => key !== "lastGuess")
    );

    const playerCard = (player, highlight) => (
      <div className="flex-1 flex flex-col items-center">
        <div className="w-full h-full rounded-lg overflow-hidden mb-1">
          <img
            src={
              player?.actionImage ||
              "/placeholder.svg?height=112&width=112" ||
              "/placeholder.svg"
            }
            alt={player?.displayName || "Jugador"}
            width={112}
            height={112}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-sm sm:text-base text-[var(--primary)] dark:text-[var(--secondary)] truncate">
            {player?.displayName}
          </h3>
          <p className="text-base sm:text-lg font-bold text-[var(--primary)] dark:text-[var(--secondary)]">
            {player?.goals} goles
          </p>
        </div>
      </div>
    );

    return (
      <EndScreen
        gameSlug="goals"
        gameMode={lastAttempt.gameMode === "time" ? "time" : "normal"}
        gameWon={gameWon}
        stats={{ finalTime: lastAttempt.timeUsed || 0 }}
        formatTime={goalsGame.gameLogic.formatTime}
        gameData={gameDataFiltered}
        mediaContentHeightMobile="h-[45%]"
        resultsContentHeightMobile="h-[55%]"
        homeUrl={homeUrl}
        mediaContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 shadow-lg w-full max-w-md mx-4 lg:mx-0">
            <div className="flex gap-2 sm:gap-4 justify-center">
              {playerCard(gameData.jugadores?.left)}
              {playerCard(gameData.jugadores?.right)}
            </div>

            <div className="flex gap-2 mt-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                  !showWrongMore
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                <ChevronUp className="h-4 w-4" />
                Más
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                  showWrongMore
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                <ChevronDown className="h-4 w-4" />
                Menos
              </button>
            </div>
          </div>
        }
      />
    );
  }

  // ✅ Caso: el juego terminó (perdió)
  if (goalsGame.gameLogic.gameOver) {
    const gameDataFiltered = { score: goalsGame.score };

    return (
      <EndScreen
        gameSlug="goals"
        gameMode={gameMode}
        gameWon={goalsGame.gameLogic.gameWon}
        stats={{ finalTime: goalsGame.gameLogic.timeLeft || 0 }}
        formatTime={goalsGame.gameLogic.formatTime}
        gameData={gameDataFiltered}
        mediaContentHeightMobile="h-[45%]"
        resultsContentHeightMobile="h-[55%]"
        homeUrl={homeUrl}
        mediaContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 shadow-lg w-full max-w-md mx-4 lg:mx-0">
            <div className="flex gap-2 sm:gap-4 justify-center">
              <img
                src={goalsGame.leftPlayer?.actionImage}
                alt={goalsGame.leftPlayer?.displayName}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <img
                src={goalsGame.rightPlayer?.actionImage}
                alt={goalsGame.rightPlayer?.displayName}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                  goalsGame.lastGuess !== "more"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                <ChevronUp className="h-4 w-4" /> Más
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                  goalsGame.lastGuess === "more"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                <ChevronDown className="h-4 w-4" /> Menos
              </button>
            </div>
          </div>
        }
      />
    );
  }

  // ✅ Caso: error al obtener datos
  if (goalsGame.fetchError)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{goalsGame.fetchError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  // ✅ Caso: pantalla inicial
  if (!goalsGame.gameLogic.gameStarted)
    return (
      <StartScreen
        gameSlug="goals"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={goalsGame.initializeGame}
        loading={goalsGame.loading}
        availableModes={["normal", "time"]}
      />
    );

  // ✅ Pantalla de juego
  return (
    <MoreOrLessGameScreen
      clubId={clubId}
      gameMode={gameMode}
      timeLeft={goalsGame.gameLogic.timeLeft}
      players={goalsGame.players}
      leftPlayer={goalsGame.leftPlayer}
      rightPlayer={goalsGame.rightPlayer}
      nextPlayer={goalsGame.nextPlayer}
      score={goalsGame.score}
      showRightPlayerStats={goalsGame.showRightPlayerGoals}
      animatedCount={goalsGame.animatedCount}
      isCountingAnimation={goalsGame.isCountingAnimation}
      isCarouselAnimation={goalsGame.isCarouselAnimation}
      showFeedback={goalsGame.gameLogic.showFeedback}
      onGuess={goalsGame.handleGuess}
      formatTime={goalsGame.gameLogic.formatTime}
      statType="goals"
      onCarouselAnimationEnd={goalsGame.handleCarouselAnimationEnd}
      carouselKey={goalsGame.carouselKey}
    />
  );
}
