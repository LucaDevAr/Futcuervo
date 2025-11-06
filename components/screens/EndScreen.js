"use client";

import { useRouter } from "next/navigation";
import { GAME_CONFIGS } from "@/constants/gameConfig";
import { cn } from "@/lib/utils";

export default function EndScreen({
  gameSlug,
  gameMode,
  gameWon,
  stats,
  mediaContent,
  gameData,
  formatTime,
  extraContentRight,
  mediaContentHeightMobile = "h-[40%]",
  resultsContentHeightMobile = "h-[60%]",
  mediaContentHeightDesktop = "md:h-full",
  resultsContentHeightDesktop = "md:h-full",
  homeUrl = "/",
}) {
  const router = useRouter();
  const config = GAME_CONFIGS[gameSlug];

  return (
    <div className="h-[calc(100vh-56px)] md:h-[calc(100vh-64px)] flex flex-col md:flex-row bg-[var(--background)]">
      {/* Columna izquierda: contenido multimedia */}
      <div
        className={cn(
          "w-full md:w-1/2 flex items-center justify-center relative",
          mediaContentHeightMobile,
          mediaContentHeightDesktop
        )}
      >
        <div className="h-full flex items-center justify-center gap-4 w-full">
          {mediaContent}
        </div>
      </div>

      {/* Columna derecha: resultados + contenido adicional */}
      <div
        className={cn(
          "w-full md:w-1/2 flex flex-col justify-center items-center p-4 bg-[var(--primary)] dark:bg-[var(--secondary)]",
          resultsContentHeightMobile,
          resultsContentHeightDesktop
        )}
      >
        <h3 className="text-2xl font-bold text-[var(--white)] mb-4 hidden lg:block">
          {config.title}
        </h3>

        <div className="w-full max-w-md">
          <h2 className="text-lg font-bold hidden lg:block mb-4 text-center text-[var(--white)]">
            {gameWon ? "🎉¡Felicitaciones!🎉" : "😔 Juego Terminado"}
          </h2>

          <div className="space-y-1 lg:space-y-3">
            <div className="py-1 px-3 lg:p-4 rounded-xl bg-[var(--white)] shadow-xl border-2 border-[var(--white)]">
              <h3 className="text-lg font-bold mb-3 text-center text-[var(--primary)] dark:text-[var(--secondary)]">
                Resultados
              </h3>

              <div className="space-y-2 text-[var(--primary)] dark:text-[var(--secondary)] text-sm">
                <div className="flex justify-between items-center border-b border-[var(--primary)] dark:border-[var(--secondary)] border-opacity-30 pb-1">
                  <strong>Resultado:</strong>
                  <span>{gameWon ? "¡Ganaste!" : "Perdiste"}</span>
                </div>

                <div className="flex justify-between items-center border-b border-[var(--primary)] dark:border-[var(--secondary)] border-opacity-30 pb-1">
                  <strong>Modo de juego:</strong>
                  <span>
                    {gameMode === "time"
                      ? "Tiempo"
                      : gameMode === "lives"
                      ? "Vidas"
                      : "Normal"}
                  </span>
                </div>

                {gameMode === "time" && (
                  <div className="flex justify-between items-center border-b border-[var(--primary)] dark:border-[var(--secondary)] border-opacity-30 pb-1">
                    <strong>Tiempo usado:</strong>
                    <span>{formatTime(stats.finalTime)}</span>
                  </div>
                )}

                {gameMode === "lives" && (
                  <div className="flex justify-between items-center border-b border-[var(--primary)] dark:border-[var(--secondary)] border-opacity-30 pb-1">
                    <strong>Vidas restantes:</strong>
                    <span>{stats.livesRemaining}</span>
                  </div>
                )}

                {/* Datos específicos del juego */}
                {gameData &&
                  Object.entries(gameData).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center border-b border-[var(--primary)] dark:border-[var(--secondary)] border-opacity-30 pb-1"
                    >
                      <strong>{key}:</strong>
                      <span>
                        {Array.isArray(value)
                          ? value.join(", ")
                          : String(value)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <button
              onClick={() => router.push(homeUrl)}
              className="w-full py-2 rounded-xl font-bold text-sm transition-all duration-200 hover:shadow-lg bg-[var(--white)] text-[var(--primary)] dark:text-[var(--secondary)] hover:opacity-90 border-2 border-[var(--white)]"
            >
              Volver al Home
            </button>
          </div>

          {/* Contenido adicional opcional */}
          {extraContentRight && (
            <div className="mt-1 lg:mt-3 w-full">{extraContentRight}</div>
          )}
        </div>
      </div>
    </div>
  );
}
