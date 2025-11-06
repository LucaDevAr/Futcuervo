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
import { useLeagueTeamGame } from "@/hooks/games/useLeagueTeamGame";
import { useGameDataPreload } from "@/hooks/games/useGameDataPreload";
import { User } from "lucide-react";
import { useLocalGameAttempts } from "@/hooks/game-state/useLocalGameAttempts";
import { useUserStore } from "@/stores/userStore";

export default function LeagueTeamGame({ clubId, homeUrl }) {
  const [gameMode, setGameMode] = useState("lives");
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState(null);

  const isMobile = useMediaQuery({ maxWidth: 767 });

  const {
    players: preloadedPlayers,
    clubs: preloadedClubs,
    leagues: preloadedLeagues,
    coaches: preloadedCoaches,
    isLoading: dataLoading,
    error: dataError,
  } = useGameDataPreload("league-team", clubId);

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

  const wasPlayedToday = attempts?.wasPlayedToday?.("league") || false;
  const getLastAttempt = () => attempts?.getLastAttempt?.("league") || null;
  const lastAttempt = getLastAttempt();
  const hasPlayedToday = wasPlayedToday;

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: GAME_CONFIGS.league?.timeLimit || 60,
    initialLives: 3,
    onGameEnd: async (won, extraData) => {
      console.log(
        "%c🎮 ON GAME END DEBUG",
        "background: #111; color: #0f0; padding: 4px; font-size: 14px;"
      );

      console.log("🟢 ¿Ganó?", won);
      console.log("📦 extraData recibido:", extraData);
      console.log("🎯 extraData.coach:", extraData?.coach);
      console.log("👤 leagueGame.coach:", leagueGame?.coach);
      console.log(
        "📌 leagueGame.coachRef.current:",
        leagueGame?.coachRef?.current
      );

      console.log("📌 Formación:", leagueGame?.formation);
      console.log(
        "📌 Posiciones:",
        leagueGame?.positions?.filter((p) => p.player).length + "/11"
      );

      console.log("%c--------------------------------------", "color: #888;");

      const coachToSave =
        leagueGame?.coachRef?.current || extraData?.coach || leagueGame?.coach;

      console.log("✅ coachToSave (final):", coachToSave);
      console.log("✅ coachToSave fullName:", coachToSave?.fullName);

      const formationToSave = leagueGame.formation;
      const positionsToSave = leagueGame.positions;
      let currentLeagueToSave = null;
      let possiblePlayersToSave = [];

      if (!won && leagueGame.currentLeague) {
        const vacantPositions = leagueGame.getVacantPositions();
        const possiblePlayers = leagueGame.getPossiblePlayers(
          leagueGame.currentLeague._id,
          vacantPositions
        );
        possiblePlayersToSave = possiblePlayers;
        currentLeagueToSave = leagueGame.currentLeague;
      }

      if (!hasPlayedToday) {
        const gameData = {
          Formación: formationToSave,
          "Posiciones completadas": `${
            positionsToSave.filter((p) => p.player).length
          }/11`,
          formation: formationToSave,
          positions: positionsToSave,
          coach: coachToSave, // Ahora debería contener el coach correcto
          currentLeague: currentLeagueToSave,
          possiblePlayersOnFail: possiblePlayersToSave,
        };

        const currentScore =
          positionsToSave.filter((p) => p.player).length +
          (coachToSave ? 1 : 0);

        const recordScore = lastAttempt?.recordScore
          ? Math.max(currentScore, lastAttempt.recordScore)
          : currentScore;

        const attemptData = {
          gameType: "league",
          clubId: clubId || null,
          won,
          score: currentScore,
          recordScore,
          timeUsed:
            gameMode === "time"
              ? (GAME_CONFIGS.league.timeLimit || 60) - gameLogic.timeLeft
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

        console.log("===== 📦 DEBUG DATA TO SAVE =====");
        console.log("🧑‍🏫 coach in attemptData:", attemptData.gameData.coach);
        console.log("📝 attemptData FULL:", attemptData);
        console.log("==================================");

        try {
          if (!user) {
            localGameAttemptsHook?.updateAttempt("league", attemptData);
            return;
          }

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/games/league-team/save`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify(attemptData),
            }
          );

          console.log("✅ Response:", response.status);

          if (!response.ok)
            throw new Error(`Error al guardar: ${response.status}`);

          const savedData = await response.json();
          console.log("✅ Attempt guardado:", savedData);
        } catch (error) {
          console.error("❌ Error saving game attempt:", error);
        }
      }
    },
  });

  const leagueGame = useLeagueTeamGame({
    gameMode,
    clubId,
    preloadedPlayers: preloadedPlayers || [],
    preloadedClubs: preloadedClubs || [],
    preloadedLeagues: preloadedLeagues || [],
    preloadedCoaches: preloadedCoaches || [],
    gameLogic,
    onIncorrectAnswer: gameLogic.handleIncorrectAnswer,
  });

  const initializeGame = async () => {
    setIsInitializing(true);
    setInitializationError(null);

    try {
      leagueGame.initializeGame();
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

  if (dataLoading || attemptsLoading)
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
    const formationFromData = gameData.formation || "";
    const positionsFromData = gameData.positions || [];
    const coachFromData = gameData.coach || null;
    const currentLeagueFromData = gameData.currentLeague || null;
    const possiblePlayersFromData = gameData.possiblePlayersOnFail || [];

    const stats = {
      finalTime: lastAttempt.timeUsed || 0,
      livesRemaining: lastAttempt.livesRemaining || 0,
      score: lastAttempt.score || 0,
      totalQuestions: 12,
    };

    const filteredGameData = {
      Formación: formationFromData,
      "Posiciones completadas": `${
        positionsFromData.filter((p) => p.player).length
      }/11`,
    };

    const endScreenFormationLayout = isMobile
      ? FORMATIONS_MOBILE[formationFromData]
      : FORMATIONS_DESKTOP[formationFromData];

    const formationDisplay = (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2 h-full w-full">
          <div className="relative bg-green-100 dark:bg-green-900 rounded-xl p-1 md:p-2 w-[90%] max-w-[250px] sm:max-w-[300px] md:max-w-[350px] aspect-[4/2.5] md:w-auto md:h-[80%] lg:h-full md:aspect-[3/4] flex-shrink-0">
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

              {positionsFromData.map((posData, index) => {
                const layoutPosition = endScreenFormationLayout?.filter(
                  (layout) => layout.position === posData.position
                )[
                  positionsFromData
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
                                "/placeholder.svg"
                              }
                              alt={posData.player.fullName}
                              className="w-full h-full object-cover rounded-full"
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
                      {posData.league?.logoUrl && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                          <img
                            src={posData.league.logoUrl || "/placeholder.svg"}
                            alt={posData.league.name}
                            className="w-full h-full object-contain rounded-full"
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
                  {coachFromData?.profileImage ? (
                    <img
                      src={coachFromData.profileImage || "/placeholder.svg"}
                      alt={coachFromData.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[9px] md:text-xs font-bold text-black dark:text-[var(--blanco)] text-center max-w-[60px] md:max-w-[100px] leading-tight">
              {coachFromData ? `DT: ${coachFromData.fullName}` : "DT: ?"}
            </span>
          </div>
        </div>
      </div>
    );

    return (
      <EndScreen
        gameSlug="league"
        gameMode={gameMode}
        gameWon={gameWon}
        stats={stats}
        formatTime={gameLogic.formatTime}
        gameData={filteredGameData}
        mediaContent={formationDisplay}
        homeUrl={homeUrl}
        extraContentRight={
          !gameWon &&
          possiblePlayersFromData.length > 0 && (
            <div className="rounded-lg bg-[var(--rojo)] dark:bg-[var(--azul)] p-1">
              <h3 className="text-base font-bold mb-1 text-white text-center">
                Jugadores posibles para {currentLeagueFromData?.name}
              </h3>
              <div className="flex gap-2 justify-center flex-wrap">
                {possiblePlayersFromData.map((player) => (
                  <div key={player._id} className="flex flex-col items-center">
                    <div className="relative w-8 h-8 lg:w-12 lg:h-12 mb-1">
                      <div className="absolute inset-0 rounded-full overflow-hidden shadow-md border-2 border-white">
                        {player.profileImage ? (
                          <img
                            src={player.profileImage || "/placeholder.svg"}
                            alt={player.fullName}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <User className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white text-center">
                      {player.fullName}
                    </span>
                    {player.availablePositions &&
                      player.availablePositions.length > 0 && (
                        <div className="text-xs text-white/80 text-center mt-1">
                          {player.availablePositions.join(", ")}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )
        }
      />
    );
  }

  if (gameLogic.gameOver) {
    const stats = {
      finalTime:
        gameMode === "time"
          ? (GAME_CONFIGS["league-team"]?.timeLimit || 300) - gameLogic.timeLeft
          : gameLogic.gameStartTime
          ? Math.floor(
              (new Date().getTime() - gameLogic.gameStartTime.getTime()) / 1000
            )
          : 0,
      livesRemaining: gameLogic.lives,
      score:
        leagueGame.positions.filter((p) => p.player).length +
        (leagueGame.coach ? 1 : 0),
      totalQuestions: 12,
    };

    const filteredGameData = {
      Formación: leagueGame.formation,
      "Posiciones completadas": `${
        leagueGame.positions.filter((p) => p.player).length
      }/11`,
    };

    const endScreenFormationLayout = isMobile
      ? FORMATIONS_MOBILE[leagueGame.formation]
      : FORMATIONS_DESKTOP[leagueGame.formation];

    const formationDisplay = (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-row items-center justify-center gap-2 h-full w-full">
          <div className="relative bg-green-100 dark:bg-green-900 rounded-xl p-1 md:p-2 w-[90%] max-w-[250px] sm:max-w-[300px] md:max-w-[350px] aspect-[4/2.5] md:w-auto md:h-[80%] lg:h-full md:aspect-[3/4] flex-shrink-0">
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

              {leagueGame.positions.map((posData, index) => {
                const layoutPosition = endScreenFormationLayout?.filter(
                  (layout) => layout.position === posData.position
                )[
                  leagueGame.positions
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
                                "/placeholder.svg"
                              }
                              alt={posData.player.fullName}
                              className="w-full h-full object-cover rounded-full"
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
                      {posData.league?.logoUrl && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                          <img
                            src={posData.league.logoUrl || "/placeholder.svg"}
                            alt={posData.league.name}
                            className="w-full h-full object-contain rounded-full"
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
                  {leagueGame.coach?.profileImage ? (
                    <img
                      src={leagueGame.coach.profileImage || "/placeholder.svg"}
                      alt={leagueGame.coach.fullName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-gray-500 dark:text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[9px] md:text-xs font-bold text-black dark:text-[var(--blanco)] text-center max-w-[60px] md:max-w-[100px] leading-tight">
              {leagueGame.coach ? `DT: ${leagueGame.coach.fullName}` : "DT: ?"}
            </span>
          </div>
        </div>
      </div>
    );

    const possiblePlayers = leagueGame.getPossiblePlayers(
      leagueGame.currentLeague?._id,
      leagueGame.getVacantPositions()
    );

    return (
      <EndScreen
        gameSlug="league"
        gameMode={gameMode}
        gameWon={gameLogic.gameWon}
        stats={stats}
        formatTime={gameLogic.formatTime}
        gameData={filteredGameData}
        mediaContent={formationDisplay}
        homeUrl={homeUrl}
        extraContentRight={
          !gameLogic.gameWon &&
          possiblePlayers.length > 0 && (
            <div className="rounded-lg bg-[var(--rojo)] dark:bg-[var(--azul)] p-1">
              <h3 className="text-base font-bold mb-1 text-white text-center">
                Jugadores posibles para {leagueGame.currentLeague?.name}
              </h3>
              <div className="flex gap-2 justify-center flex-wrap">
                {possiblePlayers.map((player) => (
                  <div key={player._id} className="flex flex-col items-center">
                    <div className="relative w-8 h-8 lg:w-12 lg:h-12 mb-1">
                      <div className="absolute inset-0 rounded-full overflow-hidden shadow-md border-2 border-white">
                        {player.profileImage ? (
                          <img
                            src={player.profileImage || "/placeholder.svg"}
                            alt={player.fullName}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300">
                            <User className="text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-white text-center">
                      {player.fullName}
                    </span>
                    {player.availablePositions &&
                      player.availablePositions.length > 0 && (
                        <div className="text-xs text-white/80 text-center mt-1">
                          {player.availablePositions.join(", ")}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          )
        }
      />
    );
  }

  if (!gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="league"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={initializeGame}
        loading={false}
        availableModes={["lives", "time"]}
      />
    );
  }

  return (
    <TeamGameScreen
      gameType="league"
      gameMode={gameMode}
      timeLeft={gameLogic.timeLeft}
      lives={gameLogic.lives}
      formation={leagueGame.formation}
      positions={leagueGame.positions}
      coach={leagueGame.coach}
      currentTarget={leagueGame.currentLeague}
      needsCoach={leagueGame.needsCoach}
      usedTargets={leagueGame.usedLeagues}
      usedPlayers={leagueGame.usedPlayers}
      playerInput={leagueGame.playerInput}
      coachInput={leagueGame.coachInput}
      isSubmitting={leagueGame.isSubmitting}
      gameOver={gameLogic.gameOver}
      gameWon={gameLogic.gameWon}
      errorMessage={leagueGame.errorMessage}
      positionErrorMessage={leagueGame.positionErrorMessage}
      currentPlayer={leagueGame.currentPlayer}
      availablePositions={leagueGame.availablePositions}
      selectedPosition={leagueGame.selectedPosition}
      gameStartTime={gameLogic.gameStartTime}
      allPlayers={preloadedPlayers}
      validPlayersForCurrentTarget={leagueGame.getValidPlayersForCurrentLeague()}
      onPlayerInputChange={leagueGame.setPlayerInput}
      onCoachInputChange={leagueGame.setCoachInput}
      onPlayerSubmit={leagueGame.handlePlayerSubmit}
      onCoachSubmit={leagueGame.handleCoachSubmit}
      onPositionSelect={leagueGame.setSelectedPosition}
      onConfirmPosition={leagueGame.confirmPositionSelection}
      formatTime={gameLogic.formatTime}
      cachedPlayers={preloadedPlayers || []}
      validPlayersForCurrentClub={leagueGame.getValidPlayersForCurrentLeague()}
    />
  );
}
