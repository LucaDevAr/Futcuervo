"use client";

import { useState, useEffect } from "react";
import { Delete } from "lucide-react";
import StartScreen from "@/components/screens/StartScreen";
import EndScreen from "@/components/screens/EndScreen";
import LoadingScreen from "@/components/ui/loading-screen";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useUserStore } from "@/stores/userStore";
import { usePlayerGame } from "@/hooks/games/usePlayerGame";

export const dynamic = "force-dynamic";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "Ñ"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
];

export default function PlayerGame({ clubId, homeUrl }) {
  const [gameMode, setGameMode] = useState("normal");
  const [isClient, setIsClient] = useState(false);

  const getActionImageForClub = (player, clubId) => {
    if (!player) return null;

    const clubStats = player.clubsStats?.find(
      (stats) => String(stats.club) === String(clubId)
    );

    return (
      clubStats?.actionImage ||
      player.actionImage ||
      player.profileImage ||
      "/placeholder.svg"
    );
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  const user = useUserStore((state) => state.user);

  // Hooks
  const userAttempts = useGameAttempts(clubId); // DB
  const localAttempts = useLocalGameAttempts(clubId); // localStorage

  // Si hay usuario → usamos DB, sino Local
  const attempts = user ? userAttempts : localAttempts;

  const wasPlayedToday = attempts?.wasPlayedToday?.("player") || false;
  const getLastAttempt = () => attempts?.getLastAttempt?.("player") || null;
  const attemptsLoading = user ? userAttempts.isLoading : false;

  const playerGameHook = usePlayerGame({
    gameMode,
    clubId,
    onGameEnd: async (won, stats, gameData) => {
      console.log("[PlayerGame] Game ended:", { won, stats, gameData });
    },
  });

  const lastAttempt = getLastAttempt();

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

  if (playerGameHook.loading) {
    return <LoadingScreen message="Cargando juego..." />;
  }

  if (playerGameHook.errorMessage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-primary dark:text-secondary">
          {playerGameHook.errorMessage}
        </p>
      </div>
    );
  }

  if (wasPlayedToday && lastAttempt) {
    const gameData = lastAttempt.gameData || {};
    const gameWon = lastAttempt.won || false;

    const player = gameData.Player;
    const clubStats =
      player?.clubsStats?.find((s) => s.club === clubId) ||
      player?.clubsStats?.[0] ||
      {};

    const enrichedGameData = {
      Jugador: player?.fullName,
      Nacionalidad: player?.nationality?.name,
      Posiciones: player?.positions?.slice(0, 2).join(", "),
      Partidos: clubStats?.appearances ?? 0,
      Goles: clubStats?.goals ?? 0,
      Asistencias: clubStats?.assists ?? 0,
      Palabra: gameData.Palabra,
      Intentos: gameData.Intentos,
      Letras: gameData.Letras,
      ...gameData,
    };

    const {
      Player,
      Club,
      Palabra,
      Intentos,
      Letras,
      Posiciones,
      ...gameDataFiltered
    } = enrichedGameData;

    const renderGuessGrid = () => {
      const letras = lastAttempt.gameData?.Letras || [];
      const totalRows = 6;
      const wordLength =
        letras[0]?.length ||
        playerGameHook.playerGame?.selectedName.length ||
        5;

      const renderedRows = letras.map((guess, guessIndex) => (
        <div
          key={guessIndex}
          className="flex gap-[3px] sm:gap-1 justify-center"
        >
          {guess.map((letterObj, i) => (
            <div
              key={i}
              className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border-2 flex items-center justify-center font-bold text-[10px] sm:text-xs md:text-sm uppercase ${
                letterObj.status === "correct"
                  ? "bg-green-500 border-green-500 text-white"
                  : letterObj.status === "present"
                  ? "bg-yellow-500 border-yellow-500 text-white"
                  : "bg-gray-500 border-gray-500 text-white"
              }`}
            >
              {letterObj.letter}
            </div>
          ))}
        </div>
      ));

      while (renderedRows.length < totalRows) {
        const emptyRow = Array.from({ length: wordLength }).map((_, i) => (
          <div
            key={i}
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border-2 border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        ));
        renderedRows.push(
          <div
            key={`empty-${renderedRows.length}`}
            className="flex gap-[3px] sm:gap-1 justify-center"
          >
            {emptyRow}
          </div>
        );
      }

      return renderedRows;
    };

    return (
      <EndScreen
        gameSlug="player"
        gameMode={lastAttempt.gameMode || gameMode}
        gameWon={gameWon}
        stats={{ score: lastAttempt.score }}
        mediaContentHeightMobile="h-[50%]" // Media content takes 60% height on mobile
        resultsContentHeightMobile="h-[50%]" // Results content takes 40% height on mobile
        formatTime={playerGameHook.gameLogic.formatTime}
        gameData={gameDataFiltered}
        homeUrl={homeUrl}
        mediaContent={
          <div className="w-full max-w-[18rem] sm:max-w-xs mx-auto flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              {player ? (
                <img
                  src={
                    getActionImageForClub(player, clubId) || "/placeholder.svg"
                  }
                  alt={player?.fullName}
                  width={120}
                  height={120}
                  className="rounded-xl shadow-lg object-cover w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-secondary dark:bg-primary rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white text-4xl">?</span>
                </div>
              )}
            </div>
            <div className="space-y-1 sm:space-y-2 w-full flex flex-col items-center">
              {renderGuessGrid()}
            </div>
            <div className="text-center mt-1 sm:mt-2">
              <p className="text-sm sm:text-base font-semibold text-primary dark:text-secondary hidden md:block">
                {player?.fullName}
              </p>
              <p className="hidden md:block text-xs sm:text-sm text-primary dark:text-secondary opacity-80">
                Palabra: &quot;{playerGameHook.playerGame?.selectedName}&quot;
              </p>
            </div>
          </div>
        }
      />
    );
  }

  if (playerGameHook.gameLogic.gameOver) {
    const player = playerGameHook.playerGame?.player;
    const clubStats = player?.clubsStats?.find(
      (c) => String(c.club) === String(clubId)
    );

    const gameData = {
      Jugador: player?.fullName,
      Nacionalidad: player?.nationality?.name,
      Posiciones: player?.positions?.slice(0, 2).join(", "),
      Club: clubStats?.clubName || "Desconocido",
      Partidos: clubStats?.appearances ?? 0,
      Goles: clubStats?.goals ?? 0,
      Asistencias: clubStats?.assists ?? 0,
      Palabra: playerGameHook.playerGame?.selectedName,
      Intentos: `${playerGameHook.attempts.length}/${playerGameHook.maxAttempts}`,
      Letras: playerGameHook.attempts.map((attempt) => attempt.evaluation),
    };

    const gameDataFiltered = Object.fromEntries(
      Object.entries(gameData)
        .filter(([key]) => key !== "Posiciones")
        .filter(([key]) => key !== "Letras")
        .filter(([key]) => key !== "Palabra")
        .filter(([key]) => key !== "Intentos")
    );

    const renderGuessGrid = () => {
      const totalRows = 6;
      const wordLength = playerGameHook.playerGame?.selectedName.length || 5;

      const renderedRows = playerGameHook.attempts.map(
        (attempt, guessIndex) => (
          <div
            key={guessIndex}
            className="flex gap-[3px] sm:gap-1 justify-center"
          >
            {attempt.evaluation.map((letterObj, i) => (
              <div
                key={i}
                className={`w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border-2 flex items-center justify-center font-bold text-[10px] sm:text-xs md:text-sm uppercase ${
                  letterObj.status === "correct"
                    ? "bg-green-500 border-green-500 text-white"
                    : letterObj.status === "present"
                    ? "bg-yellow-500 border-yellow-500 text-white"
                    : "bg-gray-500 border-gray-500 text-white"
                }`}
              >
                {letterObj.letter}
              </div>
            ))}
          </div>
        )
      );

      while (renderedRows.length < totalRows) {
        const emptyRow = Array.from({ length: wordLength }).map((_, i) => (
          <div
            key={i}
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 border-2 border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        ));
        renderedRows.push(
          <div
            key={`empty-${renderedRows.length}`}
            className="flex gap-[3px] sm:gap-1 justify-center"
          >
            {emptyRow}
          </div>
        );
      }

      return renderedRows;
    };

    return (
      <EndScreen
        gameSlug="player"
        gameMode={gameMode}
        gameWon={playerGameHook.gameLogic.gameWon}
        stats={{
          score: playerGameHook.gameWon ? 1 : 0,
        }}
        mediaContentHeightMobile="h-[55%]" // Media content takes 60% height on mobile
        resultsContentHeightMobile="h-[45%]" // Results content takes 40% height on mobile
        formatTime={playerGameHook.gameLogic.formatTime}
        gameData={gameDataFiltered}
        homeUrl={homeUrl}
        mediaContent={
          <div className="w-full max-w-[18rem] sm:max-w-xs mx-auto flex flex-col items-center space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              {player ? (
                <img
                  src={
                    getActionImageForClub(player, clubId) || "/placeholder.svg"
                  }
                  alt={player?.fullName}
                  width={120}
                  height={120}
                  className="rounded-xl shadow-lg object-cover w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 bg-secondary dark:bg-primary rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white text-4xl">?</span>
                </div>
              )}
            </div>
            <div className="space-y-1 sm:space-y-2 w-full flex flex-col items-center">
              {renderGuessGrid()}
            </div>
            <div className="text-center mt-1 sm:mt-2">
              <p className="text-sm sm:text-base font-semibold text-primary dark:text-secondary hidden md:block">
                {player?.fullName}
              </p>
              <p className="hidden md:block text-xs sm:text-sm text-primary dark:text-secondary opacity-80">
                Palabra: &quot;{playerGameHook.playerGame?.selectedName}&quot;
              </p>
            </div>
          </div>
        }
      />
    );
  }

  if (!playerGameHook.gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="player"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={playerGameHook.initializeGame}
        loading={playerGameHook.loading}
        availableModes={["normal"]}
      />
    );
  }

  const renderGuessGrid = () => {
    if (!playerGameHook.playerGame?.selectedName) return [];

    const wordLength = playerGameHook.playerGame.selectedName.length;
    const rows = [];

    // Render completed attempts
    playerGameHook.attempts.forEach((attempt, guessIndex) => {
      const letters = [];

      for (let i = 0; i < wordLength; i++) {
        const letterObj = attempt.evaluation[i];

        letters.push(
          <div
            key={i}
            className={`w-10 h-10 border-2 flex items-center justify-center font-bold text-lg sm:text-xl uppercase ${
              letterObj.status === "correct"
                ? "bg-green-500 border-green-500 text-white"
                : letterObj.status === "present"
                ? "bg-yellow-500 border-yellow-500 text-white"
                : letterObj.status === "absent"
                ? "bg-gray-500 border-gray-500 text-white"
                : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
            }`}
          >
            {letterObj.letter}
          </div>
        );
      }

      rows.push(
        <div key={guessIndex} className="flex gap-1 justify-center">
          {letters}
        </div>
      );
    });

    // Render current row (where user is typing)
    if (
      !playerGameHook.gameLogic.gameOver &&
      playerGameHook.attempts.length < playerGameHook.maxAttempts
    ) {
      const letters = [];
      for (let i = 0; i < wordLength; i++) {
        const letter = playerGameHook.currentGuess[i] || "";
        letters.push(
          <div
            key={i}
            className={`w-10 h-10 border-2 flex items-center justify-center font-bold text-lg sm:text-xl uppercase transition-all ${
              letter
                ? "border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white scale-105"
                : "border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
            }`}
          >
            {letter}
          </div>
        );
      }

      rows.push(
        <div key="current" className="flex gap-1 justify-center">
          {letters}
        </div>
      );
    }

    // Render remaining empty rows
    const remainingRows =
      playerGameHook.maxAttempts -
      playerGameHook.attempts.length -
      (playerGameHook.gameLogic.gameOver ? 0 : 1);
    for (let i = 0; i < remainingRows; i++) {
      const letters = [];
      for (let j = 0; j < wordLength; j++) {
        letters.push(
          <div
            key={j}
            className="w-10 h-10 border-2 border-gray-300 bg-white dark:bg-gray-800 dark:border-gray-600"
          />
        );
      }

      rows.push(
        <div key={`empty-${i}`} className="flex gap-1 justify-center">
          {letters}
        </div>
      );
    }

    return rows;
  };

  const renderKeyboard = () => {
    return (
      <div className="space-y-1">
        {playerGameHook.getKeyboardRows().map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1 justify-center">
            {row.map((key) => {
              const keyState =
                playerGameHook.keyboardStatus[key.toLowerCase()] || "unused";
              const isSpecialKey = key === "ENTER" || key === "BACKSPACE";

              return (
                <button
                  key={key}
                  onClick={() => playerGameHook.handleKeyPress(key)}
                  disabled={playerGameHook.gameLogic.gameOver}
                  className={`
                    ${
                      isSpecialKey
                        ? "px-2 text-xs sm:text-sm"
                        : "px-1 text-xs sm:text-base"
                    } py-2 rounded font-bold uppercase transition-all
                    ${
                      keyState === "correct"
                        ? "bg-green-500 text-white"
                        : keyState === "present"
                        ? "bg-yellow-500 text-white"
                        : keyState === "absent"
                        ? "bg-gray-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                    }
                    ${
                      playerGameHook.gameLogic.gameOver
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:scale-105"
                    }
                  `}
                >
                  {key === "BACKSPACE" ? (
                    <Delete className="h-3 w-3 sm:h-4 sm:w-4" />
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row">
      {/* Left column - Wordle grid */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-background p-4 order-2 md:order-1 h-full">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-center mb-4 text-primary dark:text-secondary">
            Adivina el Jugador
          </h2>
          <div className="space-y-1">{renderGuessGrid()}</div>
          <div className="mt-4 text-center">
            <p className="text-sm text-primary dark:text-secondary opacity-80">
              Intentos: {playerGameHook.attempts.length}/
              {playerGameHook.maxAttempts}
            </p>
            <p className="text-xs text-primary dark:text-secondary opacity-60 mt-1">
              {playerGameHook.playerGame?.selectedName.length} letras
            </p>
          </div>
        </div>
      </div>

      {/* Right column - Keyboard */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-4 bg-[var(--primary)] dark:bg-[var(--secondary)] order-2 h-full">
        <h3 className="text-3xl font-bold text-white mb-4 hidden lg:block">
          Jugador
        </h3>
        <div className="w-full max-w-md">
          <h2 className="text-lg font-bold mb-4 text-center text-white">
            ¿Quién es este jugador?
          </h2>

          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-white bg-opacity-10 border border-white">
              {renderKeyboard()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
