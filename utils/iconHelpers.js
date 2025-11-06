import { GAME_CONFIG } from "../services/gameTypes";

export const iconHelpers = {
  getGameIcon(gameType) {
    const config = GAME_CONFIG[gameType];
    return config ? config.icon : "🎮";
  },

  getGameColor(gameType) {
    const config = GAME_CONFIG[gameType];
    return config ? config.color : "bg-gray-500";
  },

  getGameHoverColor(gameType) {
    const config = GAME_CONFIG[gameType];
    return config ? config.hoverColor : "hover:bg-gray-600";
  },

  getGameTextColor(gameType) {
    const config = GAME_CONFIG[gameType];
    return config ? config.textColor : "text-gray-600";
  },

  getStatusIcon(status) {
    const statusIcons = {
      not_started: "⭕",
      in_progress: "🔄",
      completed: "✅",
      failed: "❌",
    };

    return statusIcons[status] || "❓";
  },

  getStreakIcon(streak) {
    if (streak === 0) return "💔";
    if (streak < 5) return "🔥";
    if (streak < 10) return "🚀";
    if (streak < 20) return "⭐";
    return "👑";
  },

  getDifficultyColor(difficulty) {
    const colors = {
      easy: "text-green-500",
      medium: "text-yellow-500",
      hard: "text-red-500",
    };

    return colors[difficulty] || "text-gray-500";
  },
};
