"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { debugLog } from "@/utils/debugLogger";
import { toast } from "sonner";

export function useGameLogic({
  gameMode,
  timeLimit = 300,
  initialLives = 3,
  onGameEnd,
}) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameStartTime, setGameStartTime] = useState(null);

  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [lives, setLives] = useState(initialLives);

  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [showFeedback, setShowFeedback] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    if (gameStarted && gameMode === "time" && !gameOver && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // debugLog.gameEvent("timer", "end", {
            //   gameMode: "time",
            //   totalTime: timeLimit,
            //   timeLeft: prev,
            // });
            endGame(false);
            toast.error("¡Se acabó el tiempo!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameStarted, gameMode, gameOver, timeLeft]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startGame = useCallback(() => {
    // debugLog.gameEvent("game", "start", {
    //   gameMode,
    //   timeLimit,
    //   initialLives,
    //   timestamp: new Date().toISOString(),
    // });

    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setGameStartTime(new Date());
    setScore(0);
    setAttempts(0);
    setTotalQuestions(0);

    if (gameMode === "time") {
      setTimeLeft(timeLimit);
    } else {
      setLives(initialLives);
    }
  }, [gameMode, timeLimit, initialLives]);

  const endGame = useCallback(
    (won, extraData) => {
      const finalTime = gameStartTime
        ? Math.floor((Date.now() - gameStartTime.getTime()) / 1000)
        : 0;

      // debugLog.gameEvent("game", "end", {
      //   won,
      //   finalTime,
      //   score,
      //   attempts,
      //   livesRemaining: lives,
      //   totalQuestions,
      //   gameMode,
      //   duration: `${finalTime}s`,
      // });
      // debugLog.performanceMetric("gameSessionDuration", finalTime, "seconds");

      setGameOver(true);
      setGameWon(won);
      if (timerRef.current) clearInterval(timerRef.current);

      const stats = {
        finalTime,
        livesRemaining: lives,
        attempts,
        score,
        totalQuestions,
      };

      if (onGameEnd) {
        onGameEnd(won, stats, extraData);
      }
    },
    [gameStartTime, lives, attempts, score, totalQuestions, onGameEnd]
  );

  const handleCorrectAnswer = useCallback(
    (totalQuestionsCount) => {
      // debugLog.gameEvent("answer", "correct", {
      //   currentScore: score + 1,
      //   totalQuestions: totalQuestionsCount,
      //   newStreak: score + 1,
      // });

      setScore((prev) => prev + 1);
      setAttempts((prev) => prev + 1);

      if (totalQuestionsCount !== undefined) {
        setTotalQuestions(totalQuestionsCount);
      }

      setShowFeedback({
        show: true,
        correct: true,
        message: "¡Respuesta correcta!",
      });

      setTimeout(() => setShowFeedback(null), 1000);

      if (totalQuestionsCount && score + 1 >= totalQuestionsCount) {
        setTimeout(() => endGame(true), 1000);
      }
    },
    [score, endGame]
  );

  const handleIncorrectAnswer = useCallback(
    (message) => {
      // debugLog.gameEvent("answer", "incorrect", {
      //   gameMode,
      //   livesRemaining: gameMode === "lives" ? lives - 1 : null,
      //   message,
      //   attempts: attempts + 1,
      // });

      setAttempts((prev) => prev + 1);

      if (gameMode === "lives") {
        const newLives = lives - 1;
        setLives(newLives);

        setShowFeedback({
          show: true,
          correct: false,
          message:
            message || `Respuesta incorrecta. Te quedan ${newLives} vidas.`,
        });

        setTimeout(() => {
          setShowFeedback(null);
          if (newLives <= 0) {
            // debugLog.gameEvent("lives", "exhausted", {
            //   totalAttempts: attempts + 1,
            // });
            endGame(false);
            toast.error("¡Se acabaron las vidas! Game Over");
          }
        }, 1500);
      } else {
        setShowFeedback({
          show: true,
          correct: false,
          message: message || "Respuesta incorrecta. Intenta de nuevo.",
        });

        setTimeout(() => setShowFeedback(null), 1500);
      }
    },
    [gameMode, lives, endGame, attempts]
  );

  const resetGame = useCallback(() => {
    // debugLog.gameEvent("game", "reset", {
    //   gameMode,
    //   timeLimit,
    //   initialLives,
    // });

    if (timerRef.current) clearInterval(timerRef.current);

    setGameStarted(false);
    setGameOver(false);
    setGameWon(false);
    setGameStartTime(null);
    setTimeLeft(timeLimit);
    setLives(initialLives);
    setScore(0);
    setAttempts(0);
    setTotalQuestions(0);
    setShowFeedback(null);
  }, [timeLimit, initialLives, gameMode]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    gameStarted,
    gameOver,
    gameWon,
    timeLeft,
    lives,
    score,
    attempts,
    totalQuestions,
    showFeedback,
    gameStartTime,
    startGame,
    endGame,
    handleCorrectAnswer,
    handleIncorrectAnswer,
    resetGame,
    formatTime,
    setGameStarted,
  };
}
