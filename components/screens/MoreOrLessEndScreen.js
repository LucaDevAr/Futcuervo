"use client";

import { memo } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import EndScreen from "@/components/screens/EndScreen";

/**
 * Componente reutilizable optimizado para mostrar la pantalla final de juegos "Más o Menos"
 */
const MoreOrLessEndScreen = memo(
  ({
    gameSlug,
    gameMode,
    gameWon,
    stats,
    formatTime,
    gameData,
    statField,
    statLabel,
    lastGuess,
    leftPlayer,
    rightPlayer,
  }) => {
    // Función optimizada para obtener el nombre a mostrar
    const getDisplayName = (player) => {
      if (!player) return "Jugador";
      return player.displayName || player.fullName || "Jugador";
    };

    // Determinar si la respuesta fue incorrecta
    const leftStat = leftPlayer?.[statField] ?? 0;
    const rightStat = rightPlayer?.[statField] ?? 0;
    const isWrongAnswer =
      gameData?.["Razón de finalización"] === "Respuesta incorrecta" &&
      lastGuess !== null;
    const showWrongMore =
      isWrongAnswer && lastGuess === "more" && rightStat <= leftStat;

    // Filtrar datos del juego para mostrar
    const gameDataFiltered = Object.fromEntries(
      Object.entries(gameData || {})
        .filter(([key]) => key !== "jugadores")
        .filter(([key]) => key !== "lastGuess")
    );

    return (
      <EndScreen
        gameSlug={gameSlug}
        gameMode={gameMode}
        gameWon={gameWon}
        stats={stats}
        formatTime={formatTime}
        gameData={gameDataFiltered}
        mediaContentHeightMobile="h-[45%]"
        resultsContentHeightMobile="h-[55%]"
        mediaContent={
          <div className="bg-white dark:bg-gray-800 rounded-xl p-2 sm:p-4 shadow-lg w-full max-w-md mx-4 lg:mx-0">
            <div className="flex gap-2 sm:gap-4 justify-center">
              {/* Jugador Izquierdo */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-full rounded-lg overflow-hidden mb-1">
                  <img
                    src={
                      leftPlayer?.actionImage ||
                      "/placeholder.svg?height=112&width=112"
                    }
                    alt={getDisplayName(leftPlayer)}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-sm sm:text-base text-[var(--azul)] dark:text-[var(--blanco)] truncate">
                    {getDisplayName(leftPlayer)}
                  </h3>
                  <p className="text-base sm:text-lg font-bold text-[var(--azul)] dark:text-[var(--blanco)]">
                    {leftStat} {statLabel}
                  </p>
                </div>
              </div>

              {/* Jugador Derecho */}
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full h-full rounded-lg overflow-hidden mb-1">
                  <img
                    src={
                      rightPlayer?.actionImage ||
                      "/placeholder.svg?height=112&width=112"
                    }
                    alt={getDisplayName(rightPlayer)}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-sm sm:text-base text-[var(--azul)] dark:text-[var(--blanco)] truncate">
                    {getDisplayName(rightPlayer)}
                  </h3>
                  <p className="text-base sm:text-lg font-bold text-[var(--azul)] dark:text-[var(--blanco)]">
                    {rightStat} {statLabel}
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de respuesta */}
            <div className="flex gap-2 mt-4">
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  !showWrongMore
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
                disabled
              >
                <ChevronUp className="h-4 w-4" />
                Más
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                  showWrongMore
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                }`}
                disabled
              >
                <ChevronDown className="h-4 w-4" />
                Menos
              </button>
            </div>
          </div>
        }
      />
    );
  }
);

MoreOrLessEndScreen.displayName = "MoreOrLessEndScreen";

export default MoreOrLessEndScreen;
