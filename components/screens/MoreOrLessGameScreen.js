// --- MoreOrLessGameScreen.jsx ---
"use client";

import {
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown,
  Timer,
} from "lucide-react";
import { cn } from "@/lib/utils"; // util para classnames condicionales

export default function MoreOrLessGameScreen({
  clubId,
  gameMode,
  timeLeft,
  players,
  leftPlayer,
  rightPlayer,
  nextPlayer,
  score,
  showRightPlayerStats,
  animatedCount,
  isCountingAnimation,
  isCarouselAnimation,
  showFeedback,
  onGuess,
  onCarouselAnimationEnd,
  formatTime,
  statType,
  carouselKey,
}) {
  const getStatValue = (player) => {
    if (!player?.clubsStats || !Array.isArray(player.clubsStats)) return 0;

    const clubStats = player.clubsStats.find(
      (s) =>
        s.club === clubId ||
        s.club?._id === clubId ||
        s.club?.toString() === clubId
    );

    if (!clubStats) return 0;

    switch (statType) {
      case "goals":
        return clubStats.goals || 0;
      case "appearances":
        return clubStats.appearances || 0;
      default:
        return 0;
    }
  };

  const getStatLabel = () => {
    return statType === "goals" ? "Goles" : "Presencias";
  };

  return (
    <>
      <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row relative overflow-hidden">
        <div
          key={carouselKey}
          className="w-full h-full relative flex flex-col md:flex-row"
        >
          {/* Jugador Izquierdo */}
          <div
            className={cn(
              "absolute top-0 left-0 w-full h-1/2 md:w-1/2 md:h-full transition-transform duration-500 ease-in-out",
              isCarouselAnimation
                ? "-translate-y-full md:translate-y-0 md:-translate-x-full"
                : "translate-y-0 md:translate-x-0"
            )}
            style={{ zIndex: 10 }}
          >
            {leftPlayer && (
              <>
                <div className="absolute inset-0 z-0">
                  <img
                    src={leftPlayer.actionImage || "/placeholder.svg"}
                    alt={leftPlayer.displayName || "Jugador"}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-[var(--primary)] dark:bg-[var(--secondary)] opacity-40 z-10" />
                <div className="relative z-20 h-full flex flex-col justify-center p-6 text-center text-white">
                  <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                    {leftPlayer.displayName}
                  </h2>
                  <div className="text-center mb-8">
                    <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">
                      {getStatLabel()}
                    </h3>
                    <p className="text-3xl sm:text-5xl font-bold">
                      {getStatValue(leftPlayer)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Jugador Derecho */}
          <div
            className={cn(
              "absolute top-1/2 left-0 w-full h-1/2 md:w-1/2 md:h-full md:top-0 md:left-1/2 transition-transform duration-500 ease-in-out",
              isCarouselAnimation
                ? "-translate-y-full md:translate-y-0 md:-translate-x-full"
                : "translate-y-0 md:translate-x-0"
            )}
            style={{ zIndex: 20 }}
            onTransitionEnd={() => {
              if (isCarouselAnimation) onCarouselAnimationEnd();
            }}
          >
            {rightPlayer && (
              <>
                <div className="absolute inset-0 z-0">
                  <img
                    src={rightPlayer.actionImage || "/placeholder.svg"}
                    alt={rightPlayer.displayName || "Jugador"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="absolute inset-0 bg-[var(--primary)] dark:bg-[var(--secondary)] opacity-40 z-10" />
                <div className="relative z-20 h-full flex flex-col justify-center items-center p-6 text-white">
                  <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                    {rightPlayer.displayName}
                  </h2>
                  {showRightPlayerStats ? (
                    <div className="text-center mb-8">
                      <h3 className="text-sm sm:text-lg font-semibold mb-1 sm:mb-2">
                        {getStatLabel()}
                      </h3>
                      <p
                        className={`text-3xl sm:text-5xl font-bold transition-all duration-300 ${
                          isCountingAnimation ? "scale-110" : "scale-100"
                        }`}
                      >
                        {animatedCount}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="mb-4 text-sm sm:text-lg font-semibold drop-shadow-lg">
                        ¿Tiene más o menos {getStatLabel().toLowerCase()}?
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          className="px-4 py-3 rounded-lg sm:px-6 sm:py-4 transition-all duration-200 font-bold text-sm sm:text-lg bg-[var(--primary)] dark:bg-[var(--secondary)] text-white hover:bg-[var(--secondary)] dark:hover:bg-[var(--primary)] hover:scale-105 cursor-pointer z-30 relative"
                          onClick={() => onGuess(true)}
                        >
                          <div className="flex items-center justify-center">
                            <ChevronUp className="mr-2 h-4 w-4 sm:h-6 sm:w-6" />{" "}
                            Más
                          </div>
                        </button>
                        <button
                          className="px-4 py-3 rounded-lg sm:px-6 sm:py-4 transition-all duration-200 font-bold text-sm sm:text-lg bg-[var(--primary)] dark:bg-[var(--secondary)] text-white hover:bg-[var(--secondary)] dark:hover:bg-[var(--primary)] hover:scale-105 cursor-pointer z-30 relative"
                          onClick={() => onGuess(false)}
                        >
                          <div className="flex items-center justify-center">
                            <ChevronDown className="mr-2 h-4 w-4 sm:h-6 sm:w-6" />{" "}
                            Menos
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Próximo Jugador */}
          {nextPlayer && (
            <div
              className={cn(
                "absolute top-full left-0 w-full h-1/2 md:w-1/2 md:h-full md:top-0 md:left-full transition-transform duration-500 ease-in-out",
                isCarouselAnimation
                  ? "-translate-y-full md:translate-y-0 md:-translate-x-full"
                  : "translate-y-0 md:translate-x-0"
              )}
              style={{ zIndex: 30 }}
            >
              <div className="absolute inset-0">
                <img
                  src={nextPlayer.actionImage || "/placeholder.svg"}
                  alt={nextPlayer.displayName || "Jugador"}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-[var(--primary)] dark:bg-[var(--secondary)] opacity-40" />
              <div className="relative z-20 h-full flex flex-col justify-center items-center p-6 text-white">
                <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                  {nextPlayer.displayName}
                </h2>
                <p className="mb-4 text-sm sm:text-lg font-semibold drop-shadow-lg">
                  ¿Tiene más o menos {getStatLabel().toLowerCase()}?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    className="px-4 py-3 rounded-lg sm:px-6 sm:py-4 font-bold text-sm sm:text-lg bg-[var(--primary)] dark:bg-[var(--secondary)] text-white opacity-50"
                    disabled
                  >
                    <div className="flex items-center justify-center">
                      <ChevronUp className="mr-2 h-4 w-4 sm:h-6 sm:w-6" /> Más
                    </div>
                  </button>
                  <button
                    className="px-4 py-3 rounded-lg sm:px-6 sm:py-4 font-bold text-sm sm:text-lg bg-[var(--primary)] dark:bg-[var(--secondary)] text-white opacity-50"
                    disabled
                  >
                    <div className="flex items-center justify-center">
                      <ChevronDown className="mr-2 h-4 w-4 sm:h-6 sm:w-6" />{" "}
                      Menos
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Puntuación y tiempo */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 transform -translate-x-1/2 md:top-3 md:translate-y-0 z-50 flex gap-2 sm:gap-4">
          <div className="px-4 py-2 rounded-full shadow-lg bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
            <span className="font-bold text-xs sm:text-lg">{score} Puntos</span>
          </div>
          {gameMode === "time" && timeLeft !== undefined && (
            <div className="px-4 py-2 rounded-full shadow-lg bg-[var(--secondary)] dark:bg-[var(--primary)] text-white flex items-center gap-2">
              <Timer className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-bold text-xs sm:text-lg">
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      </div>

      {showFeedback?.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div
            className={`px-4 py-3 rounded-xl flex items-center gap-2 shadow-lg transform transition-all duration-300 scale-110 text-sm ${
              showFeedback.correct ? "bg-green-500" : "bg-red-500"
            } text-white`}
          >
            {showFeedback.correct ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {showFeedback.message}
          </div>
        </div>
      )}
    </>
  );
}
