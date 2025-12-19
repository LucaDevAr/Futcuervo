import { create } from "zustand";
import { persist } from "zustand/middleware";

const normalizeAttempt = (attempt) => {
  if (!attempt) return null;
  return {
    _id: attempt._id || undefined,
    gameType: attempt.gameType,
    won: attempt.won ?? false,
    score: attempt.score ?? 0,
    streak: attempt.streak ?? 0,
    recordScore: attempt.recordScore ?? attempt.score ?? 0,
    timeUsed: attempt.timeUsed ?? 0,
    livesRemaining: attempt.livesRemaining ?? 0,
    date: attempt.date || new Date().toISOString(),
    gameData: attempt.gameData ?? {},
    gameMode: attempt.gameMode ?? "daily",
    clubId: attempt.clubId || null,
    createdAt: attempt.createdAt,
    updatedAt: attempt.updatedAt,
  };
};

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
                  [gameType]: normalizeAttempt(attemptData),
                },
                totalGames: clubData.totalGames + 1,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        }),

      setLocalLastAttempts: (clubId, data) =>
        set((state) => ({
          clubs: {
            ...state.clubs,
            [clubId || "null"]: {
              lastAttempts: Object.entries(data.lastAttempts || {}).reduce(
                (acc, [gameType, attempt]) => {
                  acc[gameType] = normalizeAttempt(attempt);
                  return acc;
                },
                {}
              ),
              totalGames: data.totalGames || 0,
              lastUpdated: data.lastUpdated || new Date().toISOString(),
            },
          },
          error: null,
        })),

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

      getLocalClubData: (clubId) => {
        const { clubs } = get();
        return clubs[clubId || "null"] || null;
      },

      clearLocalAttempts: () =>
        set({
          clubs: {},
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "local-game-attempts-storage",
      partialize: (state) => ({
        clubs: state.clubs,
      }),
    }
  )
);
