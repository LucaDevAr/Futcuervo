"use client";

import { memo, useMemo, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import EndScreen from "@/components/screens/EndScreen";

const MoreOrLessEndScreen = memo(function MoreOrLessEndScreen({
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
}) {
  // Memo para nombre del jugador
  const getDisplayName = useCallback((p) => {
    if (!p) return "Jugador";
    return p.displayName || p.fullName || "Jugador";
  }, []);

  // Memo de stats
  const { leftStat, rightStat } = useMemo(
    () => ({
      leftStat: leftPlayer?.[statField] ?? 0,
      rightStat: rightPlayer?.[statField] ?? 0,
    }),
    [leftPlayer, rightPlayer, statField]
  );

  // Memo para lógica de respuesta incorrecta
  const showWrongMore = useMemo(() => {
    const isWrong =
      gameData?.["Razón de finalización"] === "Respuesta incorrecta" &&
      lastGuess !== null;

    return isWrong && lastGuess === "more" && rightStat <= leftStat;
  }, [gameData, lastGuess, rightStat, leftStat]);

  // Memo para filtrar gameData
  const gameDataFiltered = useMemo(() => {
    if (!gameData) return {};
    const excluded = new Set(["jugadores", "lastGuess"]);
    return Object.fromEntries(
      Object.entries(gameData).filter(([key]) => !excluded.has(key))
    );
  }, [gameData]);

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
            <PlayerSide
              player={leftPlayer}
              stat={leftStat}
              label={statLabel}
              getDisplayName={getDisplayName}
            />

            {/* Jugador Derecho */}
            <PlayerSide
              player={rightPlayer}
              stat={rightStat}
              label={statLabel}
              getDisplayName={getDisplayName}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-2 mt-4">
            <ResultButton
              label="Más"
              icon={<ChevronUp className="h-4 w-4" />}
              active={!showWrongMore}
            />
            <ResultButton
              label="Menos"
              icon={<ChevronDown className="h-4 w-4" />}
              active={showWrongMore}
            />
          </div>
        </div>
      }
    />
  );
});

// --- COMPONENTES AUXILIARES MÁS LIVIANOS ---

function PlayerSide({ player, stat, label, getDisplayName }) {
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full h-full rounded-lg overflow-hidden mb-1">
        <img
          src={player?.actionImage || "/placeholder.svg?height=112&width=112"}
          alt={getDisplayName(player)}
          width={112}
          height={112}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="text-center">
        <h3 className="font-bold text-sm sm:text-base text-[var(--azul)] dark:text-[var(--blanco)] truncate">
          {getDisplayName(player)}
        </h3>
        <p className="text-base sm:text-lg font-bold text-[var(--azul)] dark:text-[var(--blanco)]">
          {stat} {label}
        </p>
      </div>
    </div>
  );
}

function ResultButton({ label, icon, active }) {
  return (
    <button
      className={`flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
        active ? "bg-green-500 text-white" : "bg-red-500 text-white"
      }`}
      disabled
    >
      {icon}
      {label}
    </button>
  );
}

export default MoreOrLessEndScreen;
