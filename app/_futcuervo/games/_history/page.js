"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import StartScreen from "@/components/screens/StartScreen";
import GameScreen from "@/components/screens/GameScreen";
import EndScreen from "@/components/screens/EndScreen";
import EndScreenCollage from "@/components/screens/EndScreenCollage";
import MediaRenderer from "@/components/media/MediaRenderer";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import {
  useGameProgressStore,
  checkGameProgress,
} from "@/stores/useGameProgressStore";
import { useGameSave } from "@/hooks/game-state/useGameSave";
import LoadingScreen from "@/components/ui/loading-screen";

export default function HistoryGamePage() {
  const [gameMode, setGameMode] = useState("time");
  const [historyGame, setHistoryGame] = useState(null);
  const [progressChecked, setProgressChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setGameProgress, getGameProgress } = useGameProgressStore();
  const { hasPlayedToday, gameResult: savedGameResult } =
    getGameProgress("history");

  const { saveGame } = useGameSave();
  const gameConfig = GAME_CONFIGS.history;
  const timeLimit = gameConfig.modes[gameMode]?.timeLimit || 60;

  const isSavingRef = useRef(false);

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: GAME_CONFIGS.league.timeLimit || 60,
    initialLives: 3,
    onGameEnd: async (won, stats) => {
      if (!hasPlayedToday && historyGame && !isSavingRef.current) {
        isSavingRef.current = true;
        try {
          const allMedia = historyGame.questions.flatMap((q) => q.media || []);
          const gameData = {
            Tema: historyGame.topic,
            "Preguntas respondidas": `${
              currentQuestionIndex + (won ? 1 : 0)
            } de ${historyGame.questions.length}`,
            mediaUsed: allMedia,
          };

          await saveGame({
            gameType: "history",
            won,
            gameData,
            timeUsed: stats.finalTime,
            livesRemaining: stats.livesRemaining,
            gameMode,
          });
          toast.success(
            won ? "¡Felicitaciones! Juego completado" : "Juego terminado"
          );
        } catch (error) {
          console.error("Error saving game:", error);
          toast.error("Error al guardar el resultado");
        }
      }
    },
  });

  const checkGameProgressHelper = useCallback(async () => {
    if (progressChecked) return;

    try {
      setLoading(true);
      const progress = await checkGameProgress("history", session?.user?.email);

      setGameProgress("history", {
        hasPlayedToday: progress.hasPlayedToday,
        gameResult: progress.gameResult,
        currentStreak: progress.currentStreak,
        currentRecord: progress.currentRecord,
      });

      if (progress.gameResult?.gameMode) {
        setGameMode(progress.gameResult.gameMode);
      }
    } catch (error) {
      console.error("Error checking game progress:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error desconocido al verificar progreso"
      );
    } finally {
      setLoading(false);
      setProgressChecked(true);
    }
  }, [progressChecked, session?.user?.email, setGameProgress]);

  useEffect(() => {
    if (sessionStatus !== "loading") {
      checkGameProgressHelper();
    }
  }, [checkGameProgressHelper, sessionStatus]);

  useEffect(() => {
    const fetchHistoryGame = async () => {
      try {
        setLoading(true);
        const localDate = new Date().toLocaleDateString("sv-SE");
        const res = await fetch(`/api/history-game?date=${localDate}`);
        const data = await res.json();

        if (!data.historyGame) {
          setErrorMessage("No hay historia disponible para hoy");
          return;
        }

        setHistoryGame(data.historyGame);
      } catch (error) {
        console.error("Error cargando la historia diaria:", error);
        setErrorMessage("Error al cargar la historia del día");
      } finally {
        setLoading(false);
      }
    };

    if (progressChecked && !historyGame) {
      fetchHistoryGame();
    }
  }, [progressChecked, historyGame]);

  const initializeGame = async () => {
    if (!historyGame) return;
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsSubmitting(false);
    setErrorMessage(null);
    gameLogic.startGame();
    toast.success(
      `¡Nuevo juego iniciado! Modo: ${gameMode === "time" ? "Tiempo" : "Vidas"}`
    );
  };

  const handleAnswerSelect = (answer) => {
    if (isSubmitting) return;
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !historyGame || isSubmitting) return;

    setIsSubmitting(true);
    const currentQuestion = historyGame.questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    if (isCorrect) {
      gameLogic.handleCorrectAnswer(historyGame.questions.length);
      setTimeout(() => {
        if (currentQuestionIndex < historyGame.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer(null);
          setIsSubmitting(false);
        }
      }, 1000);
    } else {
      if (gameMode === "lives") {
        gameLogic.handleIncorrectAnswer(
          `Respuesta incorrecta. Te quedan ${
            gameLogic.lives - 1
          } vidas. Intenta de nuevo.`
        );
      } else {
        gameLogic.handleIncorrectAnswer(
          "Respuesta incorrecta. Intenta de nuevo."
        );
      }
      setTimeout(() => {
        setSelectedAnswer(null);
        setIsSubmitting(false);
      }, 1500);
    }
  };

  if (sessionStatus === "loading") {
    return <LoadingScreen message="Iniciando sesión..." />;
  }

  if (!progressChecked) {
    return <LoadingScreen message="Verificando progreso del juego..." />;
  }

  if (loading) {
    return <LoadingScreen message="Cargando historia del día..." />;
  }

  if (errorMessage) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--azul)] dark:text-[var(--blanco)]">
            {errorMessage}
          </p>
        </div>
      </div>
    );
  }

  const showEndScreen =
    (hasPlayedToday && savedGameResult) || gameLogic.gameOver;

  if (showEndScreen) {
    const gameWon =
      hasPlayedToday && savedGameResult
        ? savedGameResult.won
        : gameLogic.gameWon;
    const gameData = savedGameResult?.gameData || {
      Tema: "Historia del día",
      "Modo de juego":
        savedGameResult?.gameMode === "time" ? "Tiempo (30s)" : "Vidas",
    };

    const allImages = savedGameResult?.gameData?.mediaUsed?.length
      ? savedGameResult.gameData.mediaUsed
      : [{ type: "image", url: "/placeholder.svg?height=400&width=300" }];

    const gameDataFiltered = Object.fromEntries(
      Object.entries(gameData).filter(([key]) => key !== "mediaUsed")
    );

    return (
      <EndScreen
        gameSlug="history"
        gameMode={savedGameResult?.gameMode || gameMode}
        gameWon={gameWon}
        stats={{
          finalTime: savedGameResult?.timeUsed || 0,
          livesRemaining: savedGameResult?.livesRemaining || 0,
          attempts: savedGameResult?.attempts,
          score: savedGameResult?.score,
          totalQuestions: 4,
        }}
        formatTime={gameLogic.formatTime}
        gameData={gameDataFiltered}
        mediaContent={
          <EndScreenCollage images={allImages} defaultIcon={BookOpen} />
        }
      />
    );
  }

  if (!gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="history"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={initializeGame}
        loading={false}
      />
    );
  }

  const currentQuestion = historyGame?.questions[currentQuestionIndex];

  return (
    <GameScreen
      gameSlug="history"
      gameMode={gameMode}
      timeLeft={gameLogic.timeLeft}
      lives={gameLogic.lives}
      title="Historia"
      topic={historyGame?.topic}
      question={currentQuestion?.question}
      onSubmit={handleSubmit}
      canSubmit={!!selectedAnswer && !isSubmitting}
      showFeedback={gameLogic.showFeedback}
      formatTime={gameLogic.formatTime}
      progressInfo={`Pregunta ${currentQuestionIndex + 1} de ${
        historyGame?.questions.length
      }`}
      mediaContent={
        <MediaRenderer
          media={currentQuestion?.media}
          gameType="history"
          defaultIcon={BookOpen}
        />
      }
    >
      <div className="grid grid-cols-1 gap-2">
        {currentQuestion?.options.map((option, index) => (
          <button
            key={index}
            className={`px-3 py-2 rounded-lg border-2 transition-all duration-200 font-medium text-sm ${
              selectedAnswer === option
                ? "bg-[var(--blanco)] border-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] shadow-lg"
                : "bg-transparent border-[var(--blanco)] text-[var(--blanco)] hover:bg-[var(--blanco)] hover:text-[var(--azul)] dark:hover:text-[var(--rojo)]"
            }`}
            onClick={() => handleAnswerSelect(option)}
            disabled={isSubmitting}
          >
            {option}
          </button>
        ))}
      </div>
    </GameScreen>
  );
}
