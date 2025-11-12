"use client";

import { useState } from "react";
import StartScreen from "@/components/screens/StartScreen";
import EndScreen from "@/components/screens/EndScreen";
import TeamGameScreen, {
  FORMATIONS_DESKTOP,
  FORMATIONS_MOBILE,
} from "@/components/screens/TeamGameScreen";
import LoadingScreen from "@/components/ui/loading-screen";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useMediaQuery } from "react-responsive";
import { useNationalTeamGame } from "@/hooks/games/useNationalTeamGame";
import { useGameDataPreload } from "@/hooks/games/useGameDataPreload";
import { User } from "lucide-react";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useUserStore } from "@/stores/userStore";

export default function NationalTeamGame({ clubId, homeUrl }) {
  const [gameMode, setGameMode] = useState("lives");
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const {
    wasPlayedToday: wasPlayedTodayServer,
    getLastAttempt: getLastAttemptServer,
    isLoading: attemptsLoading,
  } = useGameAttempts(clubId);

  const localGameAttemptsHook = useLocalGameAttempts(clubId);

  const user = useUserStore?.((state) => state.user) || null;

  const attempts = user
    ? {
        wasPlayedToday: wasPlayedTodayServer,
        getLastAttempt: getLastAttemptServer,
      }
    : localGameAttemptsHook;

  const wasPlayedToday = attempts?.wasPlayedToday?.("national") || false;
  const attemptsAreLoaded = attemptsLoading === false; // si user -> useGameAttempts, si local -> siempre true

  const shouldSkipPreload = attemptsAreLoaded && wasPlayedToday;

  const {
    players: allPlayers,
    clubs: allClubs,
    coaches: allCoaches,
    isLoading: dataLoading,
    error: dataError,
  } = useGameDataPreload({
    needPlayers: true,
    needClubs: true,
    needLeagues: false,
    needCoaches: true,
    clubId, // opcional
    skip: shouldSkipPreload,
  });

  const getLastAttempt = () => attempts?.getLastAttempt?.("national") || null;

  const lastAttempt = getLastAttempt();

  const hasPlayedToday = wasPlayedToday;

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: GAME_CONFIGS.national.timeLimit || 60,
    initialLives: 3,
    onGameEnd: async (won, extraData) => {
      const coachToSave =
        nationalTeamGame.coachRef?.current ??
        extraData?.coach ??
        nationalTeamGame.coach;

      console.log("[v0] National Team - onGameEnd coach sources:", {
        coachRefCurrent: nationalTeamGame.coachRef?.current?.fullName,
        extraDataCoach: extraData?.coach?.fullName,
        nationalTeamGameCoach: nationalTeamGame.coach?.fullName,
        finalCoachToSave: coachToSave?.fullName,
      });

      const formationToSave = nationalTeamGame.formation;
      const positionsToSave = nationalTeamGame.positions;
      let currentClubToSave = null;
      let possiblePlayersToSave = [];

      if (!won && nationalTeamGame.currentClub) {
        const vacantPositions = nationalTeamGame.getVacantPositions();
        const possiblePlayers = nationalTeamGame.getPossiblePlayers(
          nationalTeamGame.currentClub._id,
          vacantPositions
        );
        possiblePlayersToSave = possiblePlayers;
        currentClubToSave = nationalTeamGame.currentClub;
      }

      if (!hasPlayedToday) {
        const gameData = {
          Formación: formationToSave,
          "Posiciones completadas": `${
            positionsToSave.filter((p) => p.player).length
          }/11`,
          formation: formationToSave,
          positions: positionsToSave,
          coach: coachToSave,
          currentClub: currentClubToSave,
          possiblePlayersOnFail: possiblePlayersToSave,
        };

        const currentScore =
          positionsToSave.filter((p) => p.player).length +
          (coachToSave ? 1 : 0);
        const recordScore = lastAttempt?.recordScore
          ? Math.max(currentScore, lastAttempt.recordScore)
          : currentScore;

        const attemptData = {
          gameType: "national",
          clubId: clubId || null,
          won,
          score: currentScore,
          recordScore,
          timeUsed:
            gameMode === "time"
              ? (GAME_CONFIGS.national.timeLimit || 60) - gameLogic.timeLeft
              : gameLogic.gameStartTime
              ? Math.floor(
                  (Date.now() - gameLogic.gameStartTime.getTime()) / 1000
                )
              : 0,
          livesRemaining: gameLogic.lives || 0,
          gameMode,
          gameData,
          streak: won ? (lastAttempt?.streak || 0) + 1 : 0,
          date: new Date(),
        };

        console.log(
          "[v0] National Team - Saving attempt with coach:",
          attemptData.gameData.coach?.fullName
        );

        try {
          if (!user) {
            localGameAttemptsHook?.updateAttempt("national", attemptData);
            return;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/national-team/save`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(attemptData),
            }
          );

          if (!response.ok)
            throw new Error(`Error al guardar: ${response.status}`);
        } catch (error) {
          console.error("Error saving game attempt:", error);
        }
      }
    },
  });

  const nationalTeamGame = useNationalTeamGame({
    gameMode,
    clubId,
    preloadedPlayers: allPlayers || [],
    preloadedClubs: allClubs || [],
    preloadedCoaches: allCoaches || [],
    gameLogic,
    onIncorrectAnswer: gameLogic.handleIncorrectAnswer,
  });

  const initializeGame = async () => {
    setIsInitializing(true);
    setInitializationError(null);

    try {
      nationalTeamGame.initializeGame();
      gameLogic.startGame();
    } catch (error) {
      console.error("Error:", error);
      setInitializationError(
        "Error al inicializar el juego. Intenta de nuevo."
      );
    } finally {
      setIsInitializing(false);
    }
  };

  if (attemptsLoading) return <LoadingScreen message="Cargando datos..." />;

  if (!wasPlayedToday && dataLoading)
    return <LoadingScreen message="Cargando jugadores..." />;

  if (dataError)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary dark:text-primary mb-4">
            Error: {dataError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary dark:bg-secondary text-white rounded hover:opacity-90"
          >
            Reintentar
          </button>
        </div>
      </div>
    );

  if (isInitializing) {
    return (
      <LoadingScreen
        message="Preparando el juego..."
        subMessage="Configurando formación y equipos"
      />
    );
  }

  if (initializationError) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-secondary/10 to-secondary/20 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center p-8 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-xl max-w-md">
          <svg
            className="w-16 h-16 mx-auto text-secondary dark:text-primary mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200">
            Error de Inicialización
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {initializationError}
          </p>
          <button
            onClick={() => setInitializationError(null)}
            className="px-6 py-2 bg-primary dark:bg-secondary text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (hasPlayedToday && lastAttempt) {
    const gameWon = lastAttempt.won;
    const gameData = lastAttempt.gameData || {};
    const stats = {
      finalTime: lastAttempt.timeUsed || 0,
      livesRemaining: lastAttempt.livesRemaining || 0,
      score: lastAttempt.score,
    };
    const endScreenFormationLayout = isMobile
      ? FORMATIONS_MOBILE[gameData.formation]
      : FORMATIONS_DESKTOP[gameData.formation];

    const possiblePlayersOnFail =
      lastAttempt.gameData.possiblePlayersOnFail || [];
    const currentClub = gameData.currentClub || null;

    const formationDisplay = (
      <div className="w-full h-[80%] flex items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2 h-full w-full">
          <div
            className="relative bg-green-100 dark:bg-green-900 rounded-xl p-1 md:p-2
          w-[90%] max-w-[250px] sm:max-w-[300px] md:max-w-[350px] aspect-[4/2.5] md:w-auto md:h-[80%] lg:h-full md:aspect-[3/4] flex-shrink-0"
          >
            <div className="absolute inset-0 bg-green-500 rounded-xl overflow-hidden">
              <div className="absolute inset-0 border-2 border-white opacity-70"></div>
              <div
                className={`absolute bg-white opacity-70 ${
                  !isMobile
                    ? "top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2"
                    : "top-0 bottom-0 left-1/2 w-0.5 transform -translate-x-1/2"
                }`}
              ></div>
              <div className="absolute left-1/2 top-1/2 w-16 h-16 md:w-24 md:h-24 border-2 border-white opacity-70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              <div
                className={`absolute border-2 border-white opacity-70 ${
                  isMobile
                    ? "top-1/2 left-0 h-24 w-10 transform -translate-y-1/2"
                    : "bottom-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                }`}
              ></div>
              <div
                className={`absolute border-2 border-white opacity-70 ${
                  isMobile
                    ? "top-1/2 right-0 h-24 w-10 transform -translate-y-1/2"
                    : "top-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                }`}
              ></div>

              {gameData.positions.map((posData, index) => {
                const layoutPosition = endScreenFormationLayout.filter(
                  (layout) => layout.position === posData.position
                )[
                  gameData.positions
                    .slice(0, index)
                    .filter((p) => p.position === posData.position).length
                ];

                const displayX = layoutPosition ? layoutPosition.x : posData.x;
                const displayY = layoutPosition ? layoutPosition.y : posData.y;

                return (
                  <div
                    key={`${posData.position}-${index}`}
                    className="absolute w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${displayX}%`, top: `${displayY}%` }}
                  >
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 rounded-full shadow-md overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                        {posData.player ? (
                          posData.player.profileImage ? (
                            <img
                              src={
                                posData.player.profileImage ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={posData.player.fullName}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                                e.currentTarget.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white border-2 border-[var(--azul)] dark:border-[var(--rojo)] rounded-full">
                              <User className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-full">
                            <span className="text-[8px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400">
                              {posData.position}
                            </span>
                          </div>
                        )}
                      </div>
                      {posData.club?.logo && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                          <img
                            src={posData.club.logo || "/placeholder.svg"}
                            alt={posData.club.name}
                            className="w-full h-full object-contain rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                              e.currentTarget.onerror = null;
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-w-[40px] md:min-w-[120px] h-auto md:h-full ml-2 md:ml-0 lg:ml-4">
            <div className="w-10 h-10 md:w-14 md:h-14 mb-1 md:mb-2 flex-shrink-0">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 rounded-full shadow-md overflow-hidden bg-white border-2 border-[var(--azul)] dark:border-[var(--rojo)]">
                  {gameData.coach?.profileImage ? (
                    <img
                      src={gameData.coach.profileImage || "/placeholder.svg"}
                      alt={gameData.coach.fullName}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                        e.currentTarget.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                      <User className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[9px] md:text-xs font-bold text-black dark:text-[var(--blanco)] text-center max-w-[60px] md:max-w-[100px] leading-tight">
              {gameData.coach ? `DT: ${gameData.coach.fullName}` : "DT: ?"}
            </span>
          </div>
        </div>
      </div>
    );

    const filteredGameData = {
      formation: gameData.formation,
    };

    return (
      <EndScreen
        gameSlug="national"
        gameMode={lastAttempt.gameMode || gameMode}
        gameWon={gameWon}
        stats={stats}
        formatTime={gameLogic.formatTime}
        gameData={filteredGameData}
        mediaContent={formationDisplay}
        homeUrl={homeUrl}
        extraContentRight={
          possiblePlayersOnFail.length > 0 && (
            <div className="rounded-lg bg-[var(--rojo)] dark:bg-[var(--azul)] p-1">
              <h3 className="text-sm lg:text-base font-bold mb-1 text-white text-center">
                Jugadores posibles para {currentClub?.name || "el club"}:
              </h3>
              <div className="flex gap-2 justify-center flex-wrap">
                {possiblePlayersOnFail
                  .filter((player) => player.fullName && player.positions)
                  .map((player) => {
                    return (
                      <div
                        key={player._id}
                        className="flex flex-col items-center"
                      >
                        <div className="relative w-8 h-8 lg:w-12 lg:h-12 mb-1">
                          <div className="absolute inset-0 rounded-full overflow-hidden shadow-md border-2 border-white">
                            {player.profileImage ? (
                              <img
                                src={player.profileImage || "/placeholder.svg"}
                                alt={player.fullName}
                                width={48}
                                height={48}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-300">
                                <User className="text-white" />
                              </div>
                            )}
                          </div>
                          {currentClub?.logo && (
                            <div className="absolute bottom-0 -right-1 w-4 lg:w-6 h-4 lg:h-6 bg-white rounded-full p-0.5">
                              <img
                                src={currentClub.logo || "/placeholder.svg"}
                                alt={currentClub.name}
                                width={24}
                                height={24}
                                className="object-contain w-full h-full"
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-white text-center">
                          {player.displayName}
                        </span>
                        {player.availablePositions &&
                          player.availablePositions.length > 0 && (
                            <div className="text-xs text-white/80 text-center mt-1">
                              {player.availablePositions.join(", ")}
                            </div>
                          )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )
        }
      />
    );
  }

  if (gameLogic.gameOver) {
    const gameData = {
      Formación: nationalTeamGame.formation,
      "Posiciones completadas": `${
        nationalTeamGame.positions.filter((p) => p.player).length
      }/11`,
    };

    const endScreenFormationLayout = isMobile
      ? FORMATIONS_MOBILE[nationalTeamGame.formation]
      : FORMATIONS_DESKTOP[nationalTeamGame.formation];

    const stats = {
      finalTime:
        gameMode === "time"
          ? (GAME_CONFIGS.national.timeLimit || 60) - gameLogic.timeLeft
          : gameLogic.gameStartTime
          ? Math.floor((Date.now() - gameLogic.gameStartTime.getTime()) / 1000)
          : 0,
      livesRemaining: gameLogic.lives || 0,
      score:
        nationalTeamGame.positions.filter((p) => p.player).length +
        (nationalTeamGame.coach ? 1 : 0),
    };

    const formationDisplay = (
      <div className="w-full h-[80%] flex items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2 h-full w-full">
          <div
            className="relative bg-green-100 dark:bg-green-900 rounded-xl p-1 md:p-2
          w-[90%] max-w-[250px] sm:max-w-[300px] md:max-w-[350px] aspect-[4/2.5] md:w-auto md:h-[80%] lg:h-full md:aspect-[3/4] flex-shrink-0"
          >
            <div className="absolute inset-0 bg-green-500 rounded-xl overflow-hidden">
              <div className="absolute inset-0 border-2 border-white opacity-70"></div>
              <div
                className={`absolute bg-white opacity-70 ${
                  !isMobile
                    ? "top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2"
                    : "top-0 bottom-0 left-1/2 w-0.5 transform -translate-x-1/2"
                }`}
              ></div>
              <div className="absolute left-1/2 top-1/2 w-16 h-16 md:w-24 md:h-24 border-2 border-white opacity-70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
              <div
                className={`absolute border-2 border-white opacity-70 ${
                  isMobile
                    ? "top-1/2 left-0 h-24 w-10 transform -translate-y-1/2"
                    : "bottom-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                }`}
              ></div>
              <div
                className={`absolute border-2 border-white opacity-70 ${
                  isMobile
                    ? "top-1/2 right-0 h-24 w-10 transform -translate-y-1/2"
                    : "top-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                }`}
              ></div>

              {nationalTeamGame.positions.map((posData, index) => {
                const layoutPosition = endScreenFormationLayout.filter(
                  (layout) => layout.position === posData.position
                )[
                  nationalTeamGame.positions
                    .slice(0, index)
                    .filter((p) => p.position === posData.position).length
                ];

                const displayX = layoutPosition ? layoutPosition.x : posData.x;
                const displayY = layoutPosition ? layoutPosition.y : posData.y;

                return (
                  <div
                    key={`${posData.position}-${index}`}
                    className="absolute w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${displayX}%`, top: `${displayY}%` }}
                  >
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 rounded-full shadow-md overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                        {posData.player ? (
                          posData.player.profileImage ? (
                            <img
                              src={
                                posData.player.profileImage ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg" ||
                                "/placeholder.svg"
                              }
                              alt={posData.player.fullName}
                              className="w-full h-full object-cover rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                                e.currentTarget.onerror = null;
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-white border-2 border-[var(--azul)] dark:border-[var(--rojo)] rounded-full">
                              <User className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                            </div>
                          )
                        ) : (
                          <div className="w-full h-full flex items-center justify-center rounded-full">
                            <span className="text-[8px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400">
                              {posData.position}
                            </span>
                          </div>
                        )}
                      </div>
                      {posData.club?.logo && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                          <img
                            src={posData.club.logo || "/placeholder.svg"}
                            alt={posData.club.name}
                            className="w-full h-full object-contain rounded-full"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder.svg";
                              e.currentTarget.onerror = null;
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col items-center justify-center min-w-[40px] md:min-w-[120px] h-auto md:h-full ml-2 md:ml-0 lg:ml-4">
            <div className="w-10 h-10 md:w-14 md:h-14 mb-1 md:mb-2 flex-shrink-0">
              <div className="relative w-full h-full">
                <div className="absolute inset-0 rounded-full shadow-md overflow-hidden bg-white border-2 border-[var(--azul)] dark:border-[var(--rojo)]">
                  {nationalTeamGame.coach?.profileImage ? (
                    <img
                      src={
                        nationalTeamGame.coach.profileImage ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg" ||
                        "/placeholder.svg"
                      }
                      alt={nationalTeamGame.coach.fullName}
                      className="w-full h-full object-cover rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg";
                        e.currentTarget.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                      <User className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[9px] md:text-xs font-bold text-black dark:text-[var(--blanco)] text-center max-w-[60px] md:max-w-[100px] leading-tight">
              {nationalTeamGame.coach
                ? `DT: ${nationalTeamGame.coach.fullName}`
                : "DT: ?"}
            </span>
          </div>
        </div>
      </div>
    );

    return (
      <EndScreen
        gameSlug="national"
        gameMode={gameMode}
        gameWon={gameLogic.gameWon}
        stats={stats}
        formatTime={gameLogic.formatTime}
        gameData={gameData}
        mediaContent={formationDisplay}
        homeUrl={homeUrl}
      />
    );
  }

  if (!gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="national"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={initializeGame}
        loading={isInitializing}
        availableModes={["lives", "time"]}
      />
    );
  }

  return (
    <TeamGameScreen
      gameType="national"
      gameMode={gameMode}
      timeLeft={gameLogic.timeLeft}
      lives={gameLogic.lives}
      formation={nationalTeamGame.formation}
      positions={nationalTeamGame.positions}
      coach={nationalTeamGame.coach}
      currentTarget={nationalTeamGame.currentClub}
      needsCoach={nationalTeamGame.needsCoach}
      usedTargets={nationalTeamGame.usedClubs}
      usedPlayers={nationalTeamGame.usedPlayers}
      playerInput={nationalTeamGame.playerInput}
      coachInput={nationalTeamGame.coachInput}
      isSubmitting={nationalTeamGame.isSubmitting}
      gameOver={gameLogic.gameOver}
      gameWon={gameLogic.gameWon}
      errorMessage={nationalTeamGame.errorMessage}
      positionErrorMessage={nationalTeamGame.positionErrorMessage}
      currentPlayer={nationalTeamGame.currentPlayer}
      availablePositions={nationalTeamGame.availablePositions}
      selectedPosition={nationalTeamGame.selectedPosition}
      gameStartTime={gameLogic.gameStartTime}
      onPlayerInputChange={nationalTeamGame.setPlayerInput}
      onCoachInputChange={nationalTeamGame.setCoachInput}
      onPlayerSubmit={nationalTeamGame.handlePlayerSubmit}
      onCoachSubmit={nationalTeamGame.handleCoachSubmit}
      onPositionSelect={nationalTeamGame.setSelectedPosition}
      onConfirmPosition={nationalTeamGame.confirmPositionSelection}
      formatTime={gameLogic.formatTime}
      cachedPlayers={allPlayers || []}
      validPlayersForCurrentClub={nationalTeamGame.getValidPlayersForCurrentClub()}
    />
  );
}
