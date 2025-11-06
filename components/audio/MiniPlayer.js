"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Shuffle,
} from "lucide-react";
import { usePlayerStore } from "@/stores/usePlayerStore";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePlayerModal } from "@/stores/usePlayerModal";

export default function MiniPlayer() {
  const progressRef = useRef(null);
  const volumeRef = useRef(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDraggingProgress, setIsDraggingProgress] = useState(false);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const {
    playlist,
    currentSongIndex,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    playNext,
    playPrevious,
    playRandomSong,
    seek,
    handleVolumeChange,
    toggleMute,
  } = usePlayerStore();

  const { open } = usePlayerModal();
  const currentSong = playlist[currentSongIndex];

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 640);
      setIsTablet(window.innerWidth <= 1024 && window.innerWidth > 640);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleSeek = (e) => {
    if (!progressRef.current || duration === 0) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(x / rect.width, 1));
    seek(pct * 100);
  };

  const handleVolumeSeek = (e) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(x / rect.width, 1));
    handleVolumeChange(pct);
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(time % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDraggingProgress) handleSeek(e);
      if (isDraggingVolume) handleVolumeSeek(e);
    };

    const handleMouseUp = () => {
      setIsDraggingProgress(false);
      setIsDraggingVolume(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingProgress, isDraggingVolume]);

  if (!currentSong) return null;

  return (
    <div
      className="fixed bottom-0 left-0 w-full px-2 sm:px-4 py-1 h-[56px] md:h-[64px] shadow-lg z-50 text-white"
      style={{
        backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
      }}
    >
      {isMobile ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <div
              onClick={open}
              className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer transition-all duration-300"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <div className="relative overflow-hidden rounded-md flex-shrink-0">
                <Image
                  src={
                    currentSong.coverUrl ||
                    "/placeholder.svg?height=36&width=36"
                  }
                  alt={currentSong.title}
                  width={36}
                  height={36}
                  className="object-cover transition-all duration-300"
                />
                <div
                  className={`absolute inset-0 transition-all duration-300 ${
                    isHovering ? "opacity-30" : "opacity-0"
                  }`}
                  style={{
                    backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`font-semibold text-xs truncate overflow-hidden transition-colors duration-300 ${
                    isHovering ? "" : "text-white"
                  }`}
                  style={{
                    color: isHovering
                      ? isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)"
                      : "var(--blanco)",
                  }}
                >
                  {currentSong.title}
                </p>
                {currentSong.artist && (
                  <p
                    className={`text-xs opacity-75 truncate transition-colors duration-300 ${
                      isHovering ? "" : "text-white"
                    }`}
                    style={{
                      color: isHovering
                        ? isDarkMode
                          ? "var(--rojo)"
                          : "var(--azul)"
                        : "var(--blanco)",
                    }}
                  >
                    {currentSong.artist}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={playPrevious}
                aria-label="Anterior"
                style={{ color: isDarkMode ? "var(--rojo)" : "var(--azul)" }}
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={togglePlay}
                aria-label="Play/Pause"
                style={{ color: isDarkMode ? "var(--rojo)" : "var(--azul)" }}
              >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
              </button>
              <button
                onClick={playNext}
                aria-label="Siguiente"
                style={{ color: isDarkMode ? "var(--rojo)" : "var(--azul)" }}
              >
                <SkipForward size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div
              ref={progressRef}
              className="relative w-full h-0.5 rounded cursor-pointer bg-white"
              onMouseDown={(e) => {
                setIsDraggingProgress(true);
                handleSeek(e);
              }}
            >
              <div
                className="absolute top-0 left-0 h-full rounded"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                }}
              />
              <div
                className="absolute top-1/2 transform -translate-y-1/2"
                style={{
                  left: `${progress}%`,
                  marginLeft: "-5px",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        /* Layout para tablet y desktop */
        <div className="flex items-center justify-between gap-2">
          {/* Portada + título */}
          <div
            onClick={open}
            className="flex items-center gap-3 min-w-0 w-80 cursor-pointer transition-all duration-300"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            <div className="relative overflow-hidden rounded-md flex-shrink-0">
              <Image
                src={
                  currentSong.coverUrl || "/placeholder.svg?height=50&width=50"
                }
                alt={currentSong.title}
                width={50}
                height={50}
                className="object-cover transition-all duration-300"
              />
              <div
                className={`absolute inset-0 transition-all duration-300 ${
                  isHovering ? "opacity-30" : "opacity-0"
                }`}
                style={{
                  backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                }}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p
                className={`font-semibold text-sm truncate overflow-hidden transition-colors duration-300 ${
                  isHovering ? "" : "text-white"
                }`}
                style={{
                  color: isHovering
                    ? isDarkMode
                      ? "var(--rojo)"
                      : "var(--azul)"
                    : "var(--blanco)",
                }}
              >
                {currentSong.title}
              </p>
              {currentSong.artist && (
                <p
                  className={`text-xs opacity-75 truncate transition-colors duration-300 ${
                    isHovering ? "" : "text-white"
                  }`}
                  style={{
                    color: isHovering
                      ? isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)"
                      : "var(--blanco)",
                  }}
                >
                  {currentSong.artist}
                </p>
              )}
            </div>
          </div>

          {/* Controles */}
          <TooltipProvider delayDuration={0}>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      console.log("Desktop previous clicked");
                      playPrevious();
                    }}
                    aria-label="Anterior"
                    className="transition-colors"
                    style={{
                      color: isDarkMode ? "var(--rojo)" : "var(--azul)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--blanco)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)";
                    }}
                  >
                    <SkipBack size={isTablet ? 18 : 20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="text-white border-0"
                  style={{
                    backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                  }}
                >
                  Anterior
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      console.log(
                        "Desktop play/pause clicked, isPlaying:",
                        isPlaying
                      );
                      togglePlay();
                    }}
                    aria-label="Play/Pause"
                    className="transition-colors"
                    style={{
                      color: isDarkMode ? "var(--rojo)" : "var(--azul)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--blanco)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)";
                    }}
                  >
                    {isPlaying ? (
                      <Pause size={isTablet ? 20 : 24} />
                    ) : (
                      <Play size={isTablet ? 20 : 24} />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="text-white border-0"
                  style={{
                    backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                  }}
                >
                  {isPlaying ? "Pausar" : "Reproducir"}
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      console.log("Desktop next clicked");
                      playNext();
                    }}
                    aria-label="Siguiente"
                    className="transition-colors"
                    style={{
                      color: isDarkMode ? "var(--rojo)" : "var(--azul)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--blanco)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)";
                    }}
                  >
                    <SkipForward size={isTablet ? 18 : 20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="text-white border-0"
                  style={{
                    backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                  }}
                >
                  Siguiente
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      console.log("Desktop shuffle clicked");
                      playRandomSong();
                    }}
                    aria-label="Aleatorio"
                    className="transition-colors"
                    style={{
                      color: isDarkMode ? "var(--rojo)" : "var(--azul)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "var(--blanco)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)";
                    }}
                  >
                    <Shuffle size={isTablet ? 18 : 20} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  className="text-white border-0"
                  style={{
                    backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                  }}
                >
                  Canción aleatoria
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>

          {/* Progreso */}
          <div className="flex items-center gap-3 w-full max-w-2xl mx-4">
            <span className="text-xs w-10 text-white text-center">
              {formatTime((progress / 100) * duration)}
            </span>
            <div
              ref={progressRef}
              className="relative w-full h-2 rounded cursor-pointer bg-white"
              onMouseDown={(e) => {
                setIsDraggingProgress(true);
                handleSeek(e);
              }}
            >
              <div
                className="absolute top-0 left-0 h-full rounded"
                style={{
                  width: `${progress}%`,
                  backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                }}
              />
              <div
                className="absolute top-1/2 transform -translate-y-1/2"
                style={{
                  left: `${progress}%`,
                  marginLeft: "-6px",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                }}
              />
            </div>
            <span className="text-xs w-10 text-white text-center">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volumen - Solo en desktop */}
          {!isTablet && (
            <div className="flex items-center gap-2 w-32 flex-shrink-0">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={toggleMute}
                      aria-label="Volumen"
                      className="transition-colors"
                      style={{
                        color: isDarkMode ? "var(--rojo)" : "var(--azul)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--blanco)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = isDarkMode
                          ? "var(--rojo)"
                          : "var(--azul)";
                      }}
                    >
                      {volume === 0 ? (
                        <VolumeX size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    className="text-white border-0"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)",
                    }}
                  >
                    {volume === 0 ? "Activar volumen" : "Silenciar"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div
                ref={volumeRef}
                className="relative w-[70px] h-2 rounded cursor-pointer bg-white"
                onMouseDown={(e) => {
                  setIsDraggingVolume(true);
                  handleVolumeSeek(e);
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full rounded"
                  style={{
                    width: `${volume * 100}%`,
                    backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                  }}
                />
                <div
                  className="absolute top-1/2 transform -translate-y-1/2"
                  style={{
                    left: `${volume * 100}%`,
                    marginLeft: "-5px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
