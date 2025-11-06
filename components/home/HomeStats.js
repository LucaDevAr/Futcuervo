"use client";
import { GameGrid } from "../games/GameGrid";
import { StatsLoader } from "./StatsLoader";

export function HomeStats({
  stats,
  loading,
  error,
  onGameClick,
  gameItems = [],
  imageMode, // 👈 nuevo
}) {
  if (loading) {
    return <StatsLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Error al cargar estadísticas
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-0">
      <div className="w-full max-w-6xl px-4">
        <GameGrid
          stats={stats}
          loading={loading}
          onGameClick={onGameClick}
          items={gameItems}
          imageMode={imageMode} // 👈 se pasa
        />
      </div>
    </div>
  );
}
