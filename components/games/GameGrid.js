"use client";
import { GameCard } from "./GameCard";

export function GameGrid({
  stats,
  loading,
  onGameClick,
  items = [],
  imageMode,
}) {
  // 🟡 Estado de carga
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 justify-center">
        {Array.from({ length: items.length || 8 }).map((_, index) => (
          <div
            key={index}
            className="aspect-square rounded-xl p-4 animate-pulse bg-gray-300 dark:bg-gray-600"
          />
        ))}
      </div>
    );
  }

  // 🟢 Grid adaptativo (sin huecos visuales)
  return (
    <div
      className="
        grid
        grid-cols-2
        sm:grid-cols-3
        md:grid-cols-4
        gap-4
        justify-center
      "
    >
      {items.map((item, index) => {
        const bgColor =
          index % 2 === 0 ? "var(--home-card-bg)" : "var(--home-card-bg-2)";
        return (
          <GameCard
            key={index}
            item={{ ...item, color: bgColor }}
            stats={stats?.[item.gameType]}
            index={index}
            onClick={() => onGameClick?.(item)}
            imageMode={imageMode} // 👈 lo pasamos
          />
        );
      })}
    </div>
  );
}
