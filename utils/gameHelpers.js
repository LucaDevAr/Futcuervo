import { GAME_TYPES, GAME_CONFIG } from "../services/gameTypes";

export const gameHelpers = {
  calculateStreak(attempts) {
    if (!attempts || attempts.length === 0) return 0;

    let streak = 0;
    const sortedAttempts = attempts.sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    for (const attempt of sortedAttempts) {
      if (attempt.result === "success") {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },

  calculateBestStreak(attempts) {
    if (!attempts || attempts.length === 0) return 0;

    let maxStreak = 0;
    let currentStreak = 0;

    const sortedAttempts = attempts.sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );

    for (const attempt of sortedAttempts) {
      if (attempt.result === "success") {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    return maxStreak;
  },

  calculateWinRate(attempts) {
    if (!attempts || attempts.length === 0) return 0;

    const wins = attempts.filter(
      (attempt) => attempt.result === "success"
    ).length;
    return Math.round((wins / attempts.length) * 100);
  },

  getGameConfig(gameType) {
    return GAME_CONFIG[gameType] || null;
  },

  isGameAvailable(gameType) {
    return Object.values(GAME_TYPES).includes(gameType);
  },

  formatGameStats(stats) {
    if (!stats) return null;

    return {
      totalGames: stats.totalAttempts || 0,
      winRate: this.calculateWinRate(stats.attempts),
      currentStreak: this.calculateStreak(stats.attempts),
      bestStreak: this.calculateBestStreak(stats.attempts),
      lastPlayed:
        stats.attempts && stats.attempts.length > 0
          ? new Date(
              Math.max(...stats.attempts.map((a) => new Date(a.timestamp)))
            )
          : null,
    };
  },

  canPlayToday(lastPlayed) {
    if (!lastPlayed) return true;

    const today = new Date();
    const lastPlayedDate = new Date(lastPlayed);

    return today.toDateString() !== lastPlayedDate.toDateString();
  },
};
