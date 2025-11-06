import { create } from "zustand";
import { isToday } from "@/utils/dateHelpers";

export const useGameProgressStore = create((set, get) => ({
  gameProgress: {},

  setGameProgress: (gameType, progress) =>
    set((state) => ({
      gameProgress: {
        ...state.gameProgress,
        [gameType]: progress,
      },
    })),

  getGameProgress: (gameType) => {
    const progress = get().gameProgress[gameType];
    if (!progress) {
      return {
        hasPlayedToday: false,
        gameResult: null,
        currentStreak: 0,
        currentRecord: 0,
      };
    }
    return progress;
  },

  clearGameProgress: () => set({ gameProgress: {} }),
}));

export const checkGameProgress = async (gameType, userEmail) => {
  try {
    // Obtener stats del cache usando el hook existente
    const response = await fetch("/api/game-stats", {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error fetching game stats");
    }

    const data = await response.json();
    const lastAttempt = data.lastAttempts?.[gameType];

    if (!lastAttempt) {
      return {
        hasPlayedToday: false,
        gameResult: null,
        currentStreak: 0,
        currentRecord: 0,
      };
    }

    const hasPlayedToday = isToday(lastAttempt.date || lastAttempt.createdAt);

    return {
      hasPlayedToday,
      gameResult: hasPlayedToday ? lastAttempt : null,
      currentStreak: lastAttempt.streak || 0,
      currentRecord: lastAttempt.recordScore || 0,
    };
  } catch (error) {
    console.error("Error checking game progress:", error);
    return {
      hasPlayedToday: false,
      gameResult: null,
      currentStreak: 0,
      currentRecord: 0,
    };
  }
};
