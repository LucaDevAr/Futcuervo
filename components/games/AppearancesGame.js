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
import { useAppearancesGame } from "@/hooks/games/useAppearancesGame";

export default function AppearancesGame({ clubId, homeUrl }) {
  const [gameMode, setGameMode] = useState("normal");

  const user = useUserStore((state) => state.user);

  // ----------------------------------------
  // ⚠️ SIEMPRE SE LLAMA (regla de hooks)
  // ----------------------------------------
  const serverAttempts = useGameAttempts(clubId);

  // ----------------------------------------
  // 🔥 LOCAL (siempre disponible)
  // ----------------------------------------
  const localAttempts = useLocalGameAttempts(clubId);

  // ----------------------------------------
  // 🔥 Elección lógica sin romper hooks
  // ----------------------------------------
  const attempts = user ? serverAttempts : localAttempts;

  const wasPlayedToday = attempts?.wasPlayedToday?.("appearances") || false;

  const attemptsLoading = user ? serverAttempts.isLoading : false;

  const attemptsAreLoaded = attemptsLoading === false; // si user -> useGameAttempts, si local -> siempre true

  const shouldSkipPreload = attemptsAreLoaded && wasPlayedToday;

  const {
    players: allPlayers,
    isLoading: dataLoading,
    error: dataError,
  } = useGameDataPreload({
    needPlayers: true,
    needClubs: false,
    needLeagues: false,
    needCoaches: false,
    clubId, // opcional
    skip: shouldSkipPreload,
  });

  const getLastAttempt = () =>
    attempts?.getLastAttempt?.("appearances") || null;

  const lastAttempt = getLastAttempt();

  const appearancesGame = useAppearancesGame({
    gameMode,
    clubId,
    preloadedPlayers: allPlayers || [],
    onGameEnd: async (won, stats, gameData) => {
      // console.log("[AppearancesGame] Game ended:", { won, stats, gameData });
    },
  });

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

    const leftAppearances = gameData.jugadores?.left?.appearances ?? 0;
    const rightAppearances = gameData.jugadores?.right?.appearances ?? 0;
    const lastGuessFromData = gameData.lastGuess;

    const isWrongAnswer =
      gameData["Razón de finalización"] === "Respuesta incorrecta" &&
      lastGuessFromData !== null;
    const showWrongMore =
      isWrongAnswer &&
      lastGuessFromData === "more" &&
      rightAppearances <= leftAppearances;

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
            {player?.appearances} presencias
          </p>
        </div>
      </div>
    );

    return (
      <EndScreen
        gameSlug="appearances"
        gameMode={lastAttempt.gameMode === "time" ? "time" : "normal"}
        gameWon={gameWon}
        stats={{ finalTime: lastAttempt.timeUsed || 0 }}
        formatTime={appearancesGame.gameLogic.formatTime}
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
  if (appearancesGame.gameLogic.gameOver) {
    const gameDataFiltered = { score: appearancesGame.score };

    return (
      <EndScreen
        gameSlug="appearances"
        gameMode={gameMode}
        gameWon={appearancesGame.gameLogic.gameWon}
        stats={{ finalTime: appearancesGame.gameLogic.timeLeft || 0 }}
        formatTime={appearancesGame.gameLogic.formatTime}
        gameData={gameDataFiltered}
        mediaContentHeightMobile="h-[45%]"
        resultsContentHeightMobile="h-[55%]"
        homeUrl={homeUrl}
        mediaContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 shadow-lg w-full max-w-md mx-4 lg:mx-0">
            <div className="flex gap-2 sm:gap-4 justify-center">
              <img
                src={appearancesGame.leftPlayer?.actionImage}
                alt={appearancesGame.leftPlayer?.displayName}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <img
                src={appearancesGame.rightPlayer?.actionImage}
                alt={appearancesGame.rightPlayer?.displayName}
                className="w-24 h-24 object-cover rounded-lg"
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                  appearancesGame.lastGuess !== "more"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
              >
                <ChevronUp className="h-4 w-4" /> Más
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 ${
                  appearancesGame.lastGuess === "more"
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
  if (appearancesGame.fetchError)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{appearancesGame.fetchError}</p>
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
  if (!appearancesGame.gameLogic.gameStarted)
    return (
      <StartScreen
        gameSlug="appearances"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={appearancesGame.initializeGame}
        loading={appearancesGame.loading}
        availableModes={["normal", "time"]}
      />
    );

  // ✅ Pantalla de juego
  return (
    <MoreOrLessGameScreen
      clubId={clubId}
      gameMode={gameMode}
      timeLeft={appearancesGame.gameLogic.timeLeft}
      players={appearancesGame.players}
      leftPlayer={appearancesGame.leftPlayer}
      rightPlayer={appearancesGame.rightPlayer}
      nextPlayer={appearancesGame.nextPlayer}
      score={appearancesGame.score}
      showRightPlayerStats={appearancesGame.showRightPlayerAppearances}
      animatedCount={appearancesGame.animatedCount}
      isCountingAnimation={appearancesGame.isCountingAnimation}
      isCarouselAnimation={appearancesGame.isCarouselAnimation}
      showFeedback={appearancesGame.gameLogic.showFeedback}
      onGuess={appearancesGame.handleGuess}
      formatTime={appearancesGame.gameLogic.formatTime}
      statType="appearances"
      onCarouselAnimationEnd={appearancesGame.handleCarouselAnimationEnd}
      carouselKey={appearancesGame.carouselKey}
    />
  );
}
