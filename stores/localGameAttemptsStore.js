import { create } from "zustand";
import { persist } from "zustand/middleware";

// Store para guardar intentos localmente (sin sesión)
// Usa el mismo formato que gameAttemptsStore para consistencia
export const useLocalGameAttemptsStore = create(
  persist(
    (set, get) => ({
      clubs: {}, // { "null": { lastAttempts: {...}, totalGames: 0, lastUpdated: "..." }, "clubId": {...} }
      isLoading: false,
      error: null,

      updateLocalAttempt: (clubId, gameType, attemptData) =>
        set((state) => {
          const clubKey = clubId || "null";
          const clubData = state.clubs[clubKey] || {
            lastAttempts: {},
            totalGames: 0,
            lastUpdated: null,
          };

          return {
            clubs: {
              ...state.clubs,
              [clubKey]: {
                ...clubData,
                lastAttempts: {
                  ...clubData.lastAttempts,
                  [gameType]: {
                    ...attemptData,
                  },
                },
                totalGames: clubData.totalGames + 1,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),

      getLocalLastAttempt: (clubId, gameType) => {
        const { clubs } = get();
        const clubData = clubs[clubId || "null"];
        if (!clubData) return null;
        return clubData.lastAttempts[gameType] || null;
      },

      wasPlayedToday: (clubId, gameType) => {
        const attempt = get().getLocalLastAttempt(clubId, gameType);
        if (!attempt) return false;

        const today = new Date();
        const attemptDate = new Date(attempt.date || attempt.createdAt);

        return (
          today.getFullYear() === attemptDate.getFullYear() &&
          today.getMonth() === attemptDate.getMonth() &&
          today.getDate() === attemptDate.getDate()
        );
      },

      getCurrentStreak: (clubId, gameType) => {
        const attempt = get().getLocalLastAttempt(clubId, gameType);
        return attempt?.streak || 0;
      },

      getBestScore: (clubId, gameType) => {
        const attempt = get().getLocalLastAttempt(clubId, gameType);
        return attempt?.recordScore || attempt?.score || 0;
      },

      clearLocalAttempts: () =>
        set({
          clubs: {},
          isLoading: false,
          error: null,
        }),

      getLocalClubData: (clubId) => {
        const { clubs } = get();
        return clubs[clubId || "null"] || null;
      },
    }),
    {
      name: "local-game-attempts-storage",
      partialize: (state) => ({
        clubs: state.clubs,
      }),
    }
  )
);
