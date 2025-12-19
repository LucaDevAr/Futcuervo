"use client";

import { Play } from "lucide-react";
import GameModeSelector from "@/components/ui/game-mode-selector";
import { GAME_CONFIGS } from "@/constants/gameConfig";

export default function StartScreen({
  gameSlug,
  gameMode,
  setGameMode,
  initializeGame,
  loading,
  availableModes,
}) {
  const config = GAME_CONFIGS[gameSlug];

  if (!config) {
    console.error(
      `Game config not found for slug: ${gameSlug}. Available slugs:`,
      Object.keys(GAME_CONFIGS)
    );
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">
            Error: Configuración de juego no encontrada para `&quot;{gameSlug}
            &quot;`
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Slugs disponibles: {Object.keys(GAME_CONFIGS).join(", ")}
          </p>
        </div>
      </div>
    );
  }

  const modesForSelector = availableModes || config.modes;

  const visualWrapperSizeByGame = {
    history: "w-[250px] h-[250px] md:w-[350px] md:h-[350px]",
    shirt: "w-[250px] h-[250px] md:w-[350px] md:h-[350px]",
    song: "w-[250px] h-[250px] md:w-[350px] md:h-[350px]",
    national: "w-[250px] h-[250px] md:w-[350px] md:h-[350px]",
    league: "w-[250px] h-[250px] md:w-[350px] md:h-[350px]",
    career: "w-[180px] h-[270px] md:w-[250px] md:h-[350px]",
    player: "w-[180px] h-[270px] md:w-[250px] md:h-[350px]",
    video: "w-[250px] h-[250px] md:w-[350px] md:h-[350px]",
    goals: "w-[180px] h-[270px] md:w-[250px] md:h-[350px]",
    appearances: "w-[180px] h-[270px] md:w-[250px] md:h-[350px]",
  };

  const wrapperSize =
    visualWrapperSizeByGame[gameSlug] ||
    "w-[180px] h-[270px] md:w-[250px] md:h-[350px]";

  return (
    <>
      <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex text-[var(--text)]">
        {/* Columna izquierda */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-2 lg:p-4 bg-[var(--primary)] dark:bg-[var(--secondary)]">
          <div className="text-center text-white max-w-sm">
            <div className="flex items-center justify-center gap-1 lg:gap-2 mb-0">
              <config.icon className="h-[18px] lg:h-[24px]" />
              <h1 className="text-lg lg:text-2xl font-bold">{config.title}</h1>
            </div>
            <p className="text-xs lg:text-sm mb-0 opacity-90">
              {config.objective}
            </p>

            {/* Selector de modo de juego - solo si hay más de un modo */}
            {modesForSelector.length > 1 && (
              <div className="mb-2 lg:mb-4">
                <GameModeSelector
                  gameMode={gameMode}
                  setGameMode={setGameMode}
                  availableModes={modesForSelector}
                  gameSlug={gameSlug}
                  className="mb-2 lg:mb-2"
                />
              </div>
            )}

            <div className="space-y-1 lg:space-y-2 text-left text-[11px] text-sm mb-2 lg:mb-2">
              <div className="bg-[var(--secondary)] dark:bg-[var(--primary)] rounded-lg p-1.5 lg:p-3">
                <h3 className="font-bold mb-0.5 md:mb-1 text-white text-base">
                  🎯 Objetivo
                </h3>
                <p className="opacity-90 text-white text-sm">
                  {config.objective}
                </p>
              </div>

              <div className="bg-[var(--secondary)] dark:bg-[var(--primary)] rounded-lg p-1.5 lg:p-3">
                <h3 className="font-bold mb-0.5 lg:mb-1 text-white text-base">
                  📋 Reglas
                </h3>
                <ul className="opacity-90 space-y-0.5 lg:space-y-1 text-white text-sm">
                  {config.rules[gameMode].map((rule, idx) => (
                    <li key={idx}>• {rule}</li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={initializeGame}
              disabled={loading}
              className="w-full py-3 px-6 bg-white text-[var(--primary)] dark:text-[var(--secondary)] rounded-lg font-bold text-base hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1 lg:gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--primary)] dark:border-[var(--secondary)]"></div>
                  Preparando...
                </>
              ) : (
                <>¡Comenzar!</>
              )}
            </button>
          </div>
        </div>

        {/* Columna derecha: vista visual */}
        <div className="hidden md:flex w-1/2 items-center justify-center p-4">
          <div className={`${wrapperSize} flex items-center justify-center`}>
            <config.visual />
          </div>
        </div>
      </div>
    </>
  );
}
