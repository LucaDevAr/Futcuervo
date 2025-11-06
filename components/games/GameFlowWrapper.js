"use client";

import { useGameFlow } from "@/hooks/useGameFlow";
import StartScreen from "@/components/screens/StartScreen";
import EndScreen from "@/components/screens/EndScreen";
import LoadingScreen from "@/components/ui/loading-screen";

export default function GameFlowWrapper({
  gameType,
  gameConfig,
  children, // El componente del juego específico
  renderEndScreenMedia,
  formatGameData,
}) {
  const {
    gameState,
    currentAttempt,
    gameData,
    isLoading,
    startGame,
    endGame,
    shouldShowEndScreen,
    shouldShowStartScreen,
    shouldShowGameScreen,
  } = useGameFlow(gameType);

  if (isLoading) {
    return <LoadingScreen message="Cargando juego..." />;
  }

  if (shouldShowEndScreen && currentAttempt) {
    return (
      <EndScreen
        gameSlug={gameType}
        gameMode={currentAttempt.gameMode || "daily"}
        gameWon={currentAttempt.won}
        stats={{
          finalTime: currentAttempt.timeUsed || 0,
          livesRemaining: currentAttempt.livesRemaining || 0,
          score: currentAttempt.score || 0,
          streak: currentAttempt.streak || 0,
          recordScore: currentAttempt.recordScore || 0,
        }}
        gameData={
          formatGameData
            ? formatGameData(currentAttempt.gameData)
            : currentAttempt.gameData
        }
        mediaContent={
          renderEndScreenMedia
            ? renderEndScreenMedia(currentAttempt.gameData)
            : null
        }
        formatTime={(time) =>
          `${Math.floor(time / 60)}:${(time % 60).toString().padStart(2, "0")}`
        }
      />
    );
  }

  if (shouldShowStartScreen) {
    return (
      <StartScreen
        gameSlug={gameType}
        gameMode="daily"
        setGameMode={() => {}} // Para juegos diarios no cambia
        initializeGame={startGame}
        loading={false}
        availableModes={["daily"]}
      />
    );
  }

  // Renderizar el juego específico
  return children({ endGame, gameState });
}
