import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useDailyGamesStore = create(
  persist(
    (set, get) => ({
      clubs: {},
      allGamesFetched: false,
      isLoading: false,
      error: null,

      setAllGames: (gamesByClub) => {
        console.log("[v0] setAllGames called with:", gamesByClub);
        set(() => ({
          clubs: gamesByClub || {},
          allGamesFetched: true,
          error: null,
        }));
      },

      setClubGames: (clubId, gamesData) => {
        const key = clubId || "null";
        console.log("[v0] setClubGames called for club:", key, gamesData);

        set((state) => ({
          clubs: {
            ...state.clubs,
            [key]: {
              lastGames: gamesData.lastGames || gamesData,
              totalGames:
                gamesData.totalGames ||
                Object.keys(gamesData.lastGames || gamesData).length,
              lastUpdated: new Date().toISOString(),
            },
          },
        }));
      },

      getClubGames: (clubId) => {
        const { clubs } = get();
        const key = clubId || "null";
        return clubs[key]?.lastGames || null;
      },

      getGame: (clubId, gameType) => {
        const { clubs } = get();
        const key = clubId || "null";
        const game = clubs[key]?.lastGames?.[gameType] || null;
        console.log(
          "[v0] getGame called for club:",
          key,
          "gameType:",
          gameType,
          "result:",
          game
        );
        return game;
      },

      getClubData: (clubId) => {
        const { clubs } = get();
        return clubs[clubId || "null"] || null;
      },

      needsRefresh: (clubId) => {
        const { clubs, allGamesFetched } = get();

        // If we've fetched all games and this club exists, check if it's stale
        if (allGamesFetched && clubs[clubId || "null"]) {
          const clubData = clubs[clubId || "null"];
          const lastUpdate = new Date(clubData.lastUpdated);
          const now = new Date();

          // Refresh if day changed
          const lastUpdateDay = lastUpdate.toDateString();
          const currentDay = now.toDateString();

          if (lastUpdateDay !== currentDay) {
            console.log("[v0] needsRefresh: true - day changed");
            return true;
          }

          // Refresh if more than 24 hours passed
          const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
          return hoursDiff > 24;
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

        // Refresh if day changed
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

        // Refresh if more than 24 hours passed
        const hoursDiff = (now - lastUpdate) / (1000 * 60 * 60);
        const shouldRefresh = hoursDiff > 24;

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
          // Clear all clubs
          set({ clubs: {}, allGamesFetched: false });
        } else {
          // Clear specific club
          set((state) => {
            const newClubs = { ...state.clubs };
            delete newClubs[clubId || "null"];
            return { clubs: newClubs };
          });
        }
      },

      clearGames: () =>
        set({
          clubs: {},
          isLoading: false,
          error: null,
          allGamesFetched: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),
    }),
    {
      name: "daily-games-storage",
      partialize: (state) => ({
        clubs: state.clubs,
        allGamesFetched: state.allGamesFetched,
      }),
    }
  )
);
