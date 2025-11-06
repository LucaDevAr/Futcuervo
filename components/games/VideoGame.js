"use client";

import { useState } from "react";
import StartScreen from "@/components/screens/StartScreen";
import GameScreen from "@/components/screens/GameScreen";
import EndScreen from "@/components/screens/EndScreen";
import LoadingScreen from "@/components/ui/loading-screen";
import CustomVideoPlayer from "@/components/media/CustomVideoPlayer";
import { useGameAttempts } from "@/hooks/game-state/useGameAttempts";
import { useUserStore } from "@/stores/userStore";
import { useVideoGame } from "@/hooks/games/useVideoGame";

export const dynamic = "force-dynamic";

export default function VideoGame({ clubId, homeUrl }) {
  const [gameMode] = useState("normal");

  const user = useUserStore((state) => state.user);
  const {
    wasPlayedToday,
    getLastAttempt,
    isLoading: attemptsLoading,
  } = useGameAttempts(clubId);

  const videoGameHook = useVideoGame({
    gameMode,
    clubId,
    onGameEnd: async (won, stats, gameData) => {
      console.log("[VideoGame] Game ended:", { won, stats, gameData });
    },
  });

  const hasPlayedToday = wasPlayedToday("video");
  const lastAttempt = getLastAttempt("video");

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

  if (videoGameHook.loading) {
    return <LoadingScreen message="Cargando juego..." />;
  }

  if (videoGameHook.errorMessage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--azul)] dark:text-[var(--blanco)]">
            {videoGameHook.errorMessage}
          </p>
        </div>
      </div>
    );
  }

  // User already played today
  if (hasPlayedToday && lastAttempt) {
    const gameData = lastAttempt.gameData || {};
    const gameWon = lastAttempt.won || false;

    const stats = {
      finalTime: lastAttempt.timeUsed || 0,
      livesRemaining: lastAttempt.livesRemaining || 0,
      attempts: lastAttempt.attempts,
      score: lastAttempt.score,
      totalQuestions: 1,
    };

    return (
      <EndScreen
        gameSlug="video"
        gameMode="normal"
        gameWon={gameWon}
        stats={stats}
        formatTime={videoGameHook.gameLogic.formatTime}
        gameData={gameData}
        homeUrl={homeUrl}
        mediaContent={
          <div className="w-full max-w-2xl aspect-video rounded-lg">
            <CustomVideoPlayer
              videoId={videoGameHook.videoGame?.video._id}
              startTime={videoGameHook.videoGame?.answerStart || 0}
              endTime={videoGameHook.videoGame?.answerEnd || 30}
              autoplay={true}
              className="w-[90%] mx-auto lg:w-[90%] lg:h-auto"
              showControls={true}
              allowReplay={true}
            />
          </div>
        }
      />
    );
  }

  // Game over screen
  if (videoGameHook.gameLogic.gameOver) {
    const stats = {
      finalTime: videoGameHook.gameLogic.gameStartTime
        ? Math.floor(
            (new Date().getTime() -
              videoGameHook.gameLogic.gameStartTime.getTime()) /
              1000
          )
        : 0,
      livesRemaining: videoGameHook.gameLogic.lives,
      attempts: videoGameHook.gameLogic.attempts,
      score: videoGameHook.gameLogic.score,
      totalQuestions: 1,
    };

    const gameData = {
      "Tu respuesta":
        videoGameHook.selectedOption !== null
          ? videoGameHook.videoGame?.options[videoGameHook.selectedOption].text
          : "Ninguna",
      "Respuesta correcta":
        videoGameHook.videoGame?.options.find((opt) => opt.isCorrect)?.text ||
        "No disponible",
    };

    return (
      <EndScreen
        gameSlug="video"
        gameMode="normal"
        gameWon={videoGameHook.gameLogic.gameWon}
        stats={stats}
        formatTime={videoGameHook.gameLogic.formatTime}
        gameData={gameData}
        homeUrl={homeUrl}
        mediaContent={
          <div className="w-full max-w-2xl aspect-video rounded-lg">
            <CustomVideoPlayer
              videoId={videoGameHook.videoGame?.video._id}
              startTime={videoGameHook.videoGame?.answerStart || 0}
              endTime={videoGameHook.videoGame?.answerEnd || 30}
              autoplay={true}
              className="w-[90%] mx-auto lg:w-[90%] lg:h-auto"
              showControls={true}
              allowReplay={true}
            />
          </div>
        }
      />
    );
  }

  // Start screen
  if (!videoGameHook.gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="video"
        gameMode="normal"
        setGameMode={() => {}}
        initializeGame={videoGameHook.initializeGame}
        loading={false}
      />
    );
  }

  // Game screen
  return (
    <GameScreen
      gameSlug="video"
      gameMode="normal"
      title="Video"
      question="¿Cómo termina esta jugada?"
      onSubmit={videoGameHook.handleSubmit}
      canSubmit={videoGameHook.selectedOption !== null}
      showFeedback={videoGameHook.gameLogic.showFeedback}
      formatTime={videoGameHook.gameLogic.formatTime}
      mediaContent={
        <div className="w-full max-w-2xl aspect-video rounded-lg shadow-lg">
          {videoGameHook.showAnswer ? (
            <CustomVideoPlayer
              videoId={videoGameHook.videoGame?.video._id}
              startTime={videoGameHook.videoGame?.answerStart || 0}
              endTime={videoGameHook.videoGame?.answerEnd || 30}
              autoplay={true}
              className="w-[95%] mx-auto lg:w-full lg:h-full"
              showControls={true}
              allowReplay={true}
            />
          ) : (
            <CustomVideoPlayer
              videoId={videoGameHook.videoGame?.video._id}
              startTime={videoGameHook.videoGame?.clipStart || 0}
              endTime={videoGameHook.videoGame?.clipEnd || 10}
              autoplay={false}
              className="w-[95%] mx-auto lg:w-full lg:h-full"
              showControls={true}
              allowReplay={true}
            />
          )}
        </div>
      }
      gameLogic={videoGameHook.gameLogic}
    >
      <div className="grid grid-cols-1 gap-3">
        {videoGameHook.videoGame?.options.map((option, index) => (
          <button
            key={index}
            className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 font-bold text-base ${
              videoGameHook.selectedOption === index
                ? "bg-[var(--blanco)] border-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] shadow-lg"
                : "bg-transparent border-[var(--blanco)] text-[var(--blanco)] hover:bg-[var(--blanco)] hover:text-[var(--azul)] dark:hover:text-[var(--rojo)]"
            }`}
            onClick={() => videoGameHook.handleOptionSelect(index)}
            disabled={videoGameHook.showAnswer}
          >
            {option.text}
          </button>
        ))}
      </div>
    </GameScreen>
  );
}
