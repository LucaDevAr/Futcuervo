"use client";

import type { GameMode, GameSlug } from "@/constants/gameConfig";
import { GAME_CONFIGS } from "@/constants/gameConfig";

interface GameModeSelectorProps {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  availableModes?: GameMode[];
  className?: string;
  gameSlug: GameSlug;
}

const MODE_CONFIG = {
  normal: {
    label: "Normal",
    description: "Juego estándar",
    icon: "🎯",
  },
  time: {
    label: "Tiempo",
    description: "Contra el reloj",
    icon: "⏱️",
  },
  lives: {
    label: "Vidas",
    description: "3 vidas disponibles",
    icon: "❤️",
  },
};

export default function GameModeSelector({
  gameMode,
  setGameMode,
  availableModes = ["normal", "time", "lives"],
  className = "",
  gameSlug,
}: GameModeSelectorProps) {
  // Determinar el número de columnas basado en los modos disponibles
  const gridCols = availableModes.length === 2 ? "grid-cols-2" : "grid-cols-3";

  // Obtener configuración del juego para mostrar tiempo específico
  const gameConfig = GAME_CONFIGS[gameSlug];
  const timeLimit =
    gameConfig?.modes?.time?.timeLimit || gameConfig?.timeLimit || 60;

  const getModeConfig = (mode: GameMode) => {
    const baseConfig = MODE_CONFIG[mode];

    if (mode === "time") {
      return {
        ...baseConfig,
        description: `${timeLimit}s contra el reloj`,
      };
    }

    return baseConfig;
  };

  return (
    <div className={`w-full space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-center text-[var(--azul)] dark:text-[var(--blanco)]">
        Modo de Juego
      </h3>
      <div className={`grid ${gridCols} gap-2 w-full`}>
        {availableModes.map((mode) => {
          const config = getModeConfig(mode);
          const isSelected = gameMode === mode;

          return (
            <button
              key={mode}
              onClick={() => setGameMode(mode)}
              className={`
                flex flex-col items-center gap-2 p-1 lg:p-3 rounded-xl border-2 transition-all duration-200 text-center w-full
                ${
                  isSelected
                    ? "border-[var(--rojo)] dark:border-[var(--azul)] bg-[var(--rojo)] dark:bg-[var(--azul)] text-white shadow-lg transform scale-105"
                    : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-[var(--azul)] dark:text-[var(--blanco)] hover:border-[var(--rojo)] dark:hover:border-[var(--azul)] hover:shadow-md"
                }
              `}
            >
              <span className="text-xl lg:text-2xl">{config.icon}</span>
              <div className="w-full">
                <div className="font-bold text-sm">{config.label}</div>
                <div
                  className={`text-xs ${
                    isSelected
                      ? "text-white opacity-90"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {config.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
