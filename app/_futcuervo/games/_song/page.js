"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { Music } from "lucide-react";
import { toast } from "sonner";
import StartScreen from "@/components/screens/StartScreen";
import GameScreen from "@/components/screens/GameScreen";
import EndScreen from "@/components/screens/EndScreen";
import MediaRenderer from "@/components/media/MediaRenderer";
import LoadingScreen from "@/components/ui/loading-screen";
import { useGameLogic } from "@/hooks/games/useGameLogic";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import {
  useGameProgressStore,
  checkGameProgress,
} from "@/stores/useGameProgressStore";
import { useGameSave } from "@/hooks/game-state/useGameSave";

export default function SongGamePage() {
  const [gameMode, setGameMode] = useState("lives");
  const [songGame, setSongGame] = useState(null);
  const [progressChecked, setProgressChecked] = useState(false);
  // Eliminamos isLoadingSong ya que la gestionaremos directamente con songGame y errorMessage
  // const [isLoadingSong, setIsLoadingSong] = useState(true)
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = (useState < string) | (null > null);

  // ...existing code...
  const { setGameProgress, getGameProgress } = useGameProgressStore();

  const { hasPlayedToday, gameResult: savedGameResult } =
    getGameProgress("song");

  const { saveGame } = useGameSave();

  const inputRef = useRef < HTMLInputElement > null;

  const gameConfig = GAME_CONFIGS.song;
  const timeLimit = gameConfig.modes[gameMode]?.timeLimit || 60;

  const isSavingRef = useRef(false);

  // Game state
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [gameOptions, setGameOptions] = useState({
    step1: [],
    step2: [],
    step3: [],
    step4: [],
  });

  const gameLogic = useGameLogic({
    gameMode,
    timeLimit: GAME_CONFIGS.league.timeLimit || 60,
    initialLives: 3,
    onGameEnd: async (won, stats) => {
      if (!hasPlayedToday && songGame && !isSavingRef.current) {
        isSavingRef.current = true;

        try {
          const gameData = {
            Canción: songGame.song.title,
            "Canción Original": songGame.song.originalSong?.title || "No tiene",
            Autor: songGame.song.originalSong?.author || "N/A",
            Año: songGame.song.originalSong?.year || "N/A",
          };

          await saveGame({
            gameType: "song",
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
        } finally {
          isSavingRef.current = false;
        }
      }
    },
  });

  const checkGameProgressHelper = useCallback(async () => {
    if (progressChecked) return;

    try {
      const progress = await checkGameProgress("song", session?.user?.email);

      setGameProgress("song", {
        hasPlayedToday: progress.hasPlayedToday,
        gameResult: progress.gameResult,
        currentStreak: progress.currentStreak,
        currentRecord: progress.currentRecord,
      });

      if (progress.gameResult?.gameMode) {
        setGameMode(progress.gameResult.gameMode);
      }

      // No necesitamos extraer gameData aquí para songGame, se cargará en el useEffect de fetchSongGameData
    } catch (error) {
      console.error("Error al verificar el progreso:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Error desconocido al verificar progreso"
      );
    } finally {
      setProgressChecked(true);
    }
  }, [progressChecked, session?.user?.email, setGameProgress]);

  useEffect(() => {
    if (sessionStatus !== "loading") {
      checkGameProgressHelper();
    }
  }, [checkGameProgressHelper, sessionStatus]);

  // Nuevo useEffect para cargar la canción del día
  useEffect(() => {
    const fetchSongGameData = async () => {
      try {
        const localDate = new Date().toLocaleDateString("sv-SE"); // ✅ Usa fecha local YYYY-MM-DD
        const res = await fetch(`/api/song-game?date=${localDate}`);

        const data = await res.json();

        if (!data?.songGame) {
          setErrorMessage("No hay canción disponible para hoy");
          return;
        }

        setSongGame(data.songGame);
      } catch (error) {
        console.error("Error cargando la canción del día:", error);
        setErrorMessage("Error al cargar la canción del día");
      }
    };

    // Cargar la canción si el progreso ya fue verificado y songGame aún no está cargado
    if (progressChecked && !songGame) {
      fetchSongGameData();
    }
  }, [progressChecked, songGame]); // Dependencia songGame para re-ejecutar si se resetea o es null

  const initializeGame = async () => {
    if (!songGame) return;

    setStep(1);
    setSelectedAnswer("");
    setErrorMessage(null); // Clear any previous error
    await generateGameOptions(songGame.song);

    gameLogic.startGame();

    toast.success(
      `¡Nuevo juego iniciado! Modo: ${gameMode === "time" ? "Tiempo" : "Vidas"}`
    );
  };

  const generateGameOptions = async (selectedSong) => {
    try {
      const allSongsRes = await fetch("/api/songs");
      if (!allSongsRes.ok) {
        throw new Error("Error fetching songs");
      }
      const allSongs = await allSongsRes.json();

      const otherTitles = allSongs
        .filter((song) => song._id !== selectedSong._id)
        .map((song) => song.title)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);

      const step1Options = [selectedSong.title, ...otherTitles].sort(
        () => Math.random() - 0.5
      );

      let step2Options = [];
      if (selectedSong.originalSong) {
        const otherOriginalTitles = allSongs
          .filter(
            (song) =>
              song.originalSong &&
              song._id !== selectedSong._id &&
              song.originalSong.title !== selectedSong.originalSong.title
          )
          .map((song) => song.originalSong.title)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        step2Options = [
          selectedSong.originalSong.title,
          ...otherOriginalTitles,
        ].sort(() => Math.random() - 0.5);
      } else {
        const randomOriginalTitles = allSongs
          .filter((song) => song.originalSong)
          .map((song) => song.originalSong.title)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        step2Options = ["No tiene", ...randomOriginalTitles].sort(
          () => Math.random() - 0.5
        );
      }

      let step3Options = [];
      if (selectedSong.originalSong) {
        const otherAuthors = allSongs
          .filter(
            (song) =>
              song.originalSong &&
              song._id !== selectedSong._id &&
              song.originalSong.author !== selectedSong.originalSong.author
          )
          .map((song) => song.originalSong.author)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        step3Options = [selectedSong.originalSong.author, ...otherAuthors].sort(
          () => Math.random() - 0.5
        );
      } else {
        step3Options = [];
      }

      let step4Options = [];
      if (selectedSong.originalSong) {
        const otherYears = allSongs
          .filter(
            (song) =>
              song.originalSong &&
              song._id !== selectedSong._id &&
              song.originalSong.year !== selectedSong.originalSong.year
          )
          .map((song) => song.originalSong.year.toString())
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);

        step4Options = [
          selectedSong.originalSong.year.toString(),
          ...otherYears,
        ].sort(() => Math.random() - 0.5);
      } else {
        step4Options = [];
      }

      setGameOptions({
        step1: step1Options,
        step2: step2Options,
        step3: step3Options,
        step4: step4Options,
      });
    } catch (error) {
      console.error("Error generating options:", error);
      setErrorMessage("Error al generar opciones del juego.");
      setGameOptions({
        step1: [selectedSong.title, "Canción A", "Canción B", "Canción C"].sort(
          () => Math.random() - 0.5
        ),
        step2: selectedSong.originalSong
          ? [
              selectedSong.originalSong.title,
              "No tiene",
              "Canción Original A",
              "Canción Original B",
            ].sort(() => Math.random() - 0.5)
          : ["No tiene", "Canción A", "Canción B", "Canción C"].sort(
              () => Math.random() - 0.5
            ),
        step3: selectedSong.originalSong
          ? [
              selectedSong.originalSong.author,
              "Autor A",
              "Autor B",
              "Autor C",
            ].sort(() => Math.random() - 0.5)
          : [],
        step4: selectedSong.originalSong
          ? [
              selectedSong.originalSong.year.toString(),
              "2020",
              "2018",
              "2015",
            ].sort(() => Math.random() - 0.5)
          : [],
      });
    }
  };

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    if (!selectedAnswer || !songGame) return;

    let isCorrect = false;

    switch (step) {
      case 1:
        isCorrect = selectedAnswer === songGame.song.title;
        break;
      case 2:
        isCorrect =
          (selectedAnswer === "No tiene" && !songGame.song.originalSong) ||
          (selectedAnswer === songGame.song.originalSong?.title &&
            songGame.song.originalSong);
        break;
      case 3:
        isCorrect =
          songGame.song.originalSong &&
          selectedAnswer === songGame.song.originalSong.author;
        break;
      case 4:
        isCorrect =
          songGame.song.originalSong &&
          Number.parseInt(selectedAnswer) === songGame.song.originalSong.year;
        break;
    }

    if (isCorrect) {
      gameLogic.handleCorrectAnswer(4);

      setTimeout(() => {
        if (step === 4 || (step === 2 && selectedAnswer === "No tiene")) {
          gameLogic.endGame(true);
        } else {
          setStep(step + 1);
          setSelectedAnswer("");
        }
      }, 1000);
    } else {
      gameLogic.handleIncorrectAnswer(
        `Respuesta incorrecta. Te quedan ${gameLogic.lives - 1} vidas.`
      );
      setSelectedAnswer("");
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "¿Cómo se llama esta canción?";
      case 2:
        return "¿Cuál es el nombre de la canción original?";
      case 3:
        return "¿Quién es el autor de la canción original?";
      case 4:
        return "¿En qué año se lanzó la canción original?";
      default:
        return "";
    }
  };

  const getCurrentOptions = () => {
    switch (step) {
      case 1:
        return gameOptions.step1;
      case 2:
        return gameOptions.step2;
      case 3:
        return gameOptions.step3;
      case 4:
        return gameOptions.step4;
      default:
        return [];
    }
  };

  const getYoutubeVideoId = (url) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  };

  // Lógica de pantallas de carga
  if (sessionStatus === "loading") {
    return <LoadingScreen message="Iniciando sesión..." />;
  }

  if (!progressChecked) {
    return <LoadingScreen message="Verificando progreso del juego..." />;
  }

  // Si songGame es null y no hay un mensaje de error, significa que la canción aún está cargando
  if (!songGame && !errorMessage) {
    return <LoadingScreen message="Cargando canción del día..." />;
  }

  // Si hay un mensaje de error después de todos los intentos de carga, mostrarlo
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

  // Si ya se jugó hoy, mostrar EndScreen directamente
  const showEndScreen =
    (hasPlayedToday && savedGameResult) || gameLogic.gameOver;

  if (showEndScreen) {
    const gameWon =
      hasPlayedToday && savedGameResult
        ? savedGameResult.won
        : gameLogic.gameWon;

    const stats =
      hasPlayedToday && savedGameResult
        ? {
            finalTime: savedGameResult.timeUsed || 0,
            livesRemaining: savedGameResult.livesRemaining || 0,
            attempts: savedGameResult.attempts,
            score: savedGameResult.score,
            totalQuestions: 4,
          }
        : {
            finalTime:
              gameMode === "time"
                ? timeLimit - gameLogic.timeLeft
                : gameLogic.gameStartTime
                ? Math.floor(
                    (Date.now() - gameLogic.gameStartTime.getTime()) / 1000
                  )
                : 0,
            livesRemaining: gameLogic.lives,
            attempts: gameLogic.attempts,
            score: gameLogic.score,
            totalQuestions: 4,
          };

    const gameData = {
      Canción: songGame?.song.title,
      "Canción Original": songGame?.song.originalSong?.title || "No tiene",
      Autor: songGame?.song.originalSong?.author || "N/A",
      Año: songGame?.song.originalSong?.year || "N/A",
    };

    return (
      <EndScreen
        gameSlug="song"
        gameMode={gameMode}
        gameWon={gameWon}
        stats={stats}
        formatTime={gameLogic.formatTime}
        gameData={gameData}
        mediaContentHeightMobile="h-[50%]" // Media content takes 60% height on mobile
        resultsContentHeightMobile="h-[50%]" // Results content takes 40% height on mobile
        mediaContent={
          <div className="flex flex-col items-center justify-center gap-2 lg:gap-3 w-full max-w-xs md:max-w-md mx-auto">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48">
              <Image
                src={songGame?.song.coverUrl || "/placeholder.svg"}
                alt="Cover de la canción"
                fill
                className="object-contain rounded-lg shadow-lg"
                priority
              />
            </div>
            {songGame?.song.originalSong && (
              <div className="w-full aspect-video rounded-lg overflow-hidden shadow-lg max-w-[300px] sm:max-w-[360px] md:max-w-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                    songGame.song.originalSong.url
                  )}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            )}
          </div>
        }
      />
    );
  }

  // Start screen
  if (!gameLogic.gameStarted) {
    return (
      <StartScreen
        gameSlug="song"
        gameMode={gameMode}
        setGameMode={setGameMode}
        initializeGame={initializeGame}
        loading={false}
        availableModes={["lives", "time"]}
      />
    );
  }

  // Main game screen
  const mediaItems = [
    {
      type: step === 1 ? "audio" : "image",
      url: step === 1 ? songGame?.song.audioUrl : songGame?.song.coverUrl || "",
    },
  ];

  return (
    <GameScreen
      gameSlug="song"
      gameMode={gameMode}
      timeLeft={gameLogic.timeLeft}
      lives={gameLogic.lives}
      currentStep={step}
      totalSteps={4}
      title="Música"
      question={getStepTitle()}
      onSubmit={handleSubmit}
      canSubmit={!!selectedAnswer}
      showFeedback={gameLogic.showFeedback}
      formatTime={gameLogic.formatTime}
      mediaContent={
        <MediaRenderer
          media={mediaItems}
          gameType="song"
          audioClipStart={songGame.clipStart}
          audioClipEnd={songGame.clipEnd}
          defaultIcon={Music}
        />
      }
      gameLogic={gameLogic}
    >
      {(step <= 2 || (step > 2 && songGame?.song.originalSong)) && (
        <div className="grid grid-cols-1 gap-3">
          {getCurrentOptions().map((option, index) => (
            <button
              key={index}
              className={`px-4 py-2 lg:py-3 rounded-xl border-2 transition-all duration-200 font-bold text-base ${
                selectedAnswer === option
                  ? "bg-[var(--blanco)] border-[var(--blanco)] text-[var(--azul)] dark:text-[var(--rojo)] shadow-lg"
                  : "bg-transparent border-[var(--blanco)] text-[var(--blanco)] hover:bg-[var(--blanco)] hover:text-[var(--azul)] dark:hover:text-[var(--rojo)]"
              }`}
              onClick={() => handleAnswerSelect(option)}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </GameScreen>
  );
}
