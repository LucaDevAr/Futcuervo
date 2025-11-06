import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGameAttemptsStore = create(
  persist(
    (set, get) => ({
      clubs: {}, // { "null": { lastAttempts: {...}, totalGames: 0, lastUpdated: "..." }, "clubId": {...} }
      isLoading: false,
      error: null,
      allAttemptsFetched: false, // Track if we've fetched all attempts

      setLastAttempts: (clubId, data) =>
        set((state) => ({
          clubs: {
            ...state.clubs,
            [clubId || "null"]: {
              lastAttempts: data.lastAttempts || {},
              totalGames: data.totalGames || 0,
              lastUpdated: data.lastUpdated || new Date().toISOString(),
            },
          },
          error: null,
        })),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      getLastAttempt: (clubId, gameType) => {
        const { clubs } = get();
        const clubData = clubs[clubId || "null"];
        if (!clubData) return null;
        return clubData.lastAttempts[gameType] || null;
      },

      wasPlayedToday: (clubId, gameType) => {
        const attempt = get().getLastAttempt(clubId, gameType);
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
        const attempt = get().getLastAttempt(clubId, gameType);
        return attempt?.streak || 0;
      },

      getBestScore: (clubId, gameType) => {
        const attempt = get().getLastAttempt(clubId, gameType);
        return attempt?.recordScore || attempt?.score || 0;
      },

      updateAttempt: (clubId, gameType, attemptData) =>
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

      getClubData: (clubId) => {
        const { clubs } = get();
        return clubs[clubId || "null"] || null;
      },

      setAllAttempts: (attemptsByClub) =>
        set((state) => {
          const newClubs = {};

          for (const [clubId, data] of Object.entries(attemptsByClub)) {
            newClubs[clubId] = {
              lastAttempts: data.lastAttempts || {},
              totalGames: data.totalGames || 0,
              lastUpdated: new Date().toISOString(),
            };
          }

          return {
            clubs: { ...state.clubs, ...newClubs },
            allAttemptsFetched: true,
            error: null,
          };
        }),

      // Limpiar datos (logout)
      clearAttempts: () =>
        set({
          clubs: {},
          isLoading: false,
          error: null,
          allAttemptsFetched: false, // Reset flag
        }),

      needsRefresh: (clubId) => {
        const { clubs, allAttemptsFetched } = get();

        if (allAttemptsFetched && clubs[clubId || "null"]) {
          const clubData = clubs[clubId || "null"];
          const lastUpdate = new Date(clubData.lastUpdated);
          const now = new Date();

          // Only refresh if day changed or more than 2 hours passed
          const lastUpdateDay = lastUpdate.toDateString();
          const currentDay = now.toDateString();

          if (lastUpdateDay !== currentDay) {
            console.log("[v0] needsRefresh: true - day changed");
            return true;
          }

          const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
          return hoursDiff > 2;
        }

        const clubData = clubs[clubId || "null"];

        if (!clubData || !clubData.lastUpdated) {
          console.log(
            "[v0] needsRefresh: true - no data for club:",
            clubId || "null"
          );
          return true;
        }

        const lastUpdate = new Date(clubData.lastUpdated);
        const now = new Date();

        // Refrescar si cambió el día
        const lastUpdateDay = lastUpdate.toDateString();
        const currentDay = now.toDateString();

        if (lastUpdateDay !== currentDay) {
          console.log(
            "[v0] needsRefresh: true - day changed from",
            lastUpdateDay,
            "to",
            currentDay,
            "for club:",
            clubId || "null"
          );
          return true;
        }

        // También refrescar si han pasado más de 2 horas
        const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
        const shouldRefresh = hoursDiff > 2;

        console.log(
          "[v0] needsRefresh:",
          shouldRefresh,
          "- hours diff:",
          hoursDiff,
          "for club:",
          clubId || "null"
        );
        return shouldRefresh;
      },

      forceRefresh: (clubId = null) => {
        if (clubId === null) {
          // Limpiar todos los clubs
          set({ clubs: {}, allAttemptsFetched: false }); // Reset flag
        } else {
          // Limpiar solo un club específico
          set((state) => {
            const newClubs = { ...state.clubs };
            delete newClubs[clubId || "null"];
            return { clubs: newClubs };
          });
        }
      },
    }),
    {
      name: "game-attempts-storage",
      partialize: (state) => ({
        clubs: state.clubs,
        allAttemptsFetched: state.allAttemptsFetched, // Persist flag
      }),
    }
  )
);
