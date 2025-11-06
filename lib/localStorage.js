export const STREAK_GAMES = [
  "player",
  "shirt",
  "song",
  "career",
  "video",
  "history",
  "national",
  "league",
];

export const SCORE_GAMES = ["goals", "appearances"];

export class LocalStorageGameManager {
  static getDeviceId() {
    let deviceId = localStorage.getItem("futcuervo_device_id");
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      localStorage.setItem("futcuervo_device_id", deviceId);
    }
    return deviceId;
  }

  static getStorageKey(gameType, date) {
    return `futcuervo_${gameType}_${date}`;
  }

  static getStreakKey(gameType) {
    return `futcuervo_streak_${gameType}`;
  }

  static getRecordKey(gameType) {
    return `futcuervo_record_${gameType}`;
  }

  static hasPlayedToday(gameType) {
    const today = new Date().toISOString().split("T")[0];
    const key = this.getStorageKey(gameType, today);
    return localStorage.getItem(key) !== null;
  }

  static getGameResult(gameType, date) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const key = this.getStorageKey(gameType, targetDate);
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  static saveGameResult(gameData) {
    const key = this.getStorageKey(gameData.gameType, gameData.date);

    let newStreak = 0;
    if (STREAK_GAMES.includes(gameData.gameType)) {
      if (gameData.won) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        const yesterdayResult = this.getGameResult(
          gameData.gameType,
          yesterdayStr
        );

        newStreak =
          yesterdayResult?.won && yesterdayResult.streak
            ? yesterdayResult.streak + 1
            : 1;
      } else {
        newStreak = 0;
      }
    }

    const dataToSave = {
      ...gameData,
      streak: newStreak,
      timestamp: Date.now(),
    };

    localStorage.setItem(key, JSON.stringify(dataToSave));

    if (STREAK_GAMES.includes(gameData.gameType)) {
      this.updateStreak(gameData.gameType, gameData.won, newStreak);
    } else if (SCORE_GAMES.includes(gameData.gameType)) {
      this.updateRecord(gameData.gameType, gameData.score);
    }
  }

  static updateStreak(gameType, won, newStreak) {
    const streakKey = this.getStreakKey(gameType);
    localStorage.setItem(streakKey, newStreak.toString());
  }

  static updateRecord(gameType, score) {
    const recordKey = this.getRecordKey(gameType);
    const currentRecord = Number.parseInt(
      localStorage.getItem(recordKey) || "0"
    );

    if (score > currentRecord) {
      localStorage.setItem(recordKey, score.toString());
    }
  }

  static getCurrentStreak(gameType) {
    if (!STREAK_GAMES.includes(gameType)) return 0;

    const today = new Date();
    let streak = 0;

    for (let i = 1; i <= 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split("T")[0];

      const gameResult = this.getGameResult(gameType, dateStr);

      if (gameResult) {
        if (gameResult.won) {
          streak++;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return streak;
  }

  static getCurrentRecord(gameType) {
    if (!SCORE_GAMES.includes(gameType)) return 0;

    const recordKey = this.getRecordKey(gameType);
    return Number.parseInt(localStorage.getItem(recordKey) || "0");
  }

  static getStreakWithTodayStatus(gameType) {
    const today = new Date().toISOString().split("T")[0];
    const todayResult = this.getGameResult(gameType, today);

    if (todayResult) {
      return {
        streak: todayResult.streak,
        playedToday: true,
        wonToday: todayResult.won,
      };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const yesterdayResult = this.getGameResult(gameType, yesterdayStr);

    return {
      streak: yesterdayResult?.streak || 0,
      playedToday: false,
      wonToday: false,
    };
  }

  static getDeviceIdForAPI() {
    return this.getDeviceId();
  }

  static clearGameData(gameType, date) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const key = this.getStorageKey(gameType, targetDate);
    localStorage.removeItem(key);
  }

  static getAllGameData() {
    const allData = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key?.startsWith("futcuervo_") &&
        !key.includes("device_id") &&
        !key.includes("streak_") &&
        !key.includes("record_")
      ) {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            allData[key] = JSON.parse(data);
          }
        } catch {}
      }
    }

    return allData;
  }

  static clearOldGameResults(gameType, keepDates) {
    const keysToKeep = new Set(
      keepDates.map((date) => this.getStorageKey(gameType, date))
    );

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        key.startsWith(`futcuervo_${gameType}_`) &&
        !keysToKeep.has(key)
      ) {
        localStorage.removeItem(key);
      }
    }
  }

  static getRecordWithTodayStatus(gameType) {
    const today = new Date().toISOString().split("T")[0];
    const todayResult = this.getGameResult(gameType, today);

    return {
      record: this.getCurrentRecord(gameType),
      playedToday: !!todayResult,
      wonToday: !!todayResult?.won,
    };
  }
}

// Función de verificación para backend o localStorage
export async function checkGameProgress(gameType, userEmail) {
  try {
    if (userEmail) {
      const response = await fetch(
        `http://localhost:5000/api/game-progress?gameType=${gameType}`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          hasPlayed: data.hasPlayedToday,
          result: data.gameResult,
        };
      }
    }

    const hasPlayed = LocalStorageGameManager.hasPlayedToday(gameType);
    const result = hasPlayed
      ? LocalStorageGameManager.getGameResult(gameType)
      : null;

    return { hasPlayed, result };
  } catch (error) {
    console.error("Error checking game progress:", error);

    const hasPlayed = LocalStorageGameManager.hasPlayedToday(gameType);
    const result = hasPlayed
      ? LocalStorageGameManager.getGameResult(gameType)
      : null;

    return { hasPlayed, result };
  }
}
