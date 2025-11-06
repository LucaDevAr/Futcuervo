import { iconHelpers } from "../../utils/iconHelpers";

export function GameStatsOverlay({ stats }) {
  if (!stats) {
    return (
      <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Partidas:</span>
          <span>0</span>
        </div>
        <div className="flex justify-between">
          <span>Racha:</span>
          <span>0</span>
        </div>
        <div className="flex justify-between">
          <span>Mejor:</span>
          <span>0</span>
        </div>
      </div>
    );
  }

  const streakIcon = iconHelpers.getStreakIcon(stats.currentStreak);

  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between text-gray-700 dark:text-gray-300 group-hover:text-gray-100">
        <span>Partidas jugadas:</span>
        <span className="font-semibold">{stats.totalAttempts || 0}</span>
      </div>

      <div className="flex justify-between text-gray-700 dark:text-gray-300 group-hover:text-gray-100">
        <span>Tasa de éxito:</span>
        <span className="font-semibold">{stats.winRate || 0}%</span>
      </div>

      <div className="flex justify-between text-gray-700 dark:text-gray-300 group-hover:text-gray-100">
        <span className="flex items-center space-x-1">
          <span>Racha actual:</span>
          <span>{streakIcon}</span>
        </span>
        <span className="font-semibold">{stats.currentStreak || 0}</span>
      </div>

      <div className="flex justify-between text-gray-700 dark:text-gray-300 group-hover:text-gray-100">
        <span>Mejor racha:</span>
        <span className="font-semibold">{stats.bestStreak || 0}</span>
      </div>

      {stats.lastPlayed && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-600 group-hover:border-gray-400">
          <div className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-200">
            Último juego: {new Date(stats.lastPlayed).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
