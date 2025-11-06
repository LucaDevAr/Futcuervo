class LocalStorageGameManager {
  constructor() {
    this.prefix = "futcuervo_";
    this.version = "1.0";
  }

  static getInstance() {
    if (!LocalStorageGameManager.instance) {
      LocalStorageGameManager.instance = new LocalStorageGameManager();
    }
    return LocalStorageGameManager.instance;
  }

  getKey(gameType) {
    return `${this.prefix}${gameType}`;
  }

  saveGameAttempt(gameType, result, metadata = {}) {
    try {
      const key = this.getKey(gameType);
      const existingData = this.getGameData(gameType) || {
        attempts: [],
        stats: {},
      };

      const attempt = {
        id: Date.now(),
        result,
        timestamp: new Date().toISOString(),
        metadata,
        version: this.version,
      };

      existingData.attempts.push(attempt);
      existingData.stats = this.calculateStats(existingData.attempts);
      existingData.lastUpdated = new Date().toISOString();

      localStorage.setItem(key, JSON.stringify(existingData));

      // Disparar evento personalizado para notificar cambios
      window.dispatchEvent(
        new CustomEvent("localStatsUpdate", {
          detail: { gameType, data: existingData },
        })
      );

      return attempt;
    } catch (error) {
      console.error("Error saving game attempt:", error);
      return null;
    }
  }

  getGameData(gameType) {
    try {
      const key = this.getKey(gameType);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error getting game data:", error);
      return null;
    }
  }

  getAllGameStats() {
    const stats = {};

    Object.values([
      "wordle",
      "connections",
      "mini_crossword",
      "spelling_bee",
      "strands",
    ]).forEach((gameType) => {
      const data = this.getGameData(gameType);
      if (data) {
        stats[gameType] = {
          ...data.stats,
          lastPlayed:
            data.attempts.length > 0
              ? data.attempts[data.attempts.length - 1].timestamp
              : null,
          totalAttempts: data.attempts.length,
        };
      } else {
        stats[gameType] = {
          currentStreak: 0,
          bestStreak: 0,
          winRate: 0,
          totalAttempts: 0,
          lastPlayed: null,
        };
      }
    });

    return stats;
  }

  calculateStats(attempts) {
    if (!attempts || attempts.length === 0) {
      return {
        currentStreak: 0,
        bestStreak: 0,
        winRate: 0,
        totalGames: 0,
      };
    }

    const wins = attempts.filter((a) => a.result === "success").length;
    const winRate = Math.round((wins / attempts.length) * 100);

    // Calcular racha actual (desde el final hacia atrás)
    let currentStreak = 0;
    for (let i = attempts.length - 1; i >= 0; i--) {
      if (attempts[i].result === "success") {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calcular mejor racha
    let bestStreak = 0;
    let tempStreak = 0;

    attempts.forEach((attempt) => {
      if (attempt.result === "success") {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    });

    return {
      currentStreak,
      bestStreak,
      winRate,
      totalGames: attempts.length,
    };
  }

  clearGameData(gameType) {
    try {
      const key = this.getKey(gameType);
      localStorage.removeItem(key);

      window.dispatchEvent(
        new CustomEvent("localStatsUpdate", {
          detail: { gameType, data: null },
        })
      );

      return true;
    } catch (error) {
      console.error("Error clearing game data:", error);
      return false;
    }
  }

  clearAllData() {
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });

      window.dispatchEvent(
        new CustomEvent("localStatsUpdate", {
          detail: { gameType: "all", data: null },
        })
      );

      return true;
    } catch (error) {
      console.error("Error clearing all data:", error);
      return false;
    }
  }

  exportData() {
    const data = {};

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(this.prefix)) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch (error) {
          console.error(`Error parsing data for key ${key}:`, error);
        }
      }
    });

    return {
      version: this.version,
      exportDate: new Date().toISOString(),
      data,
    };
  }

  importData(importedData) {
    try {
      if (!importedData.data) {
        throw new Error("Invalid import data format");
      }

      Object.entries(importedData.data).forEach(([key, value]) => {
        if (key.startsWith(this.prefix)) {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });

      window.dispatchEvent(
        new CustomEvent("localStatsUpdate", {
          detail: { gameType: "all", data: "imported" },
        })
      );

      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  }
}

export { LocalStorageGameManager };
