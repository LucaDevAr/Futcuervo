import { create } from "zustand";
import { persist } from "zustand/middleware";

const DEBUG =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_DEBUG === "true";

export const useDailyGamesStore = create(
  persist(
    (set, get) => ({
      clubs: {},
      allGamesFetched: false,
      isLoading: false,
      error: null,

      // -------------------------------
      // 🧠 Validar fechas de juegos
      // -------------------------------
      isGameFromToday: (dateStr) => {
        if (!dateStr) return false;
        const today = new Date().toLocaleDateString("sv-SE");
        const d = new Date(dateStr).toLocaleDateString("sv-SE");
        return d === today;
      },

      // -----------------------------------------
      // 🧠 Detecta si hay que resetear por nuevo día
      // -----------------------------------------
      needsDailyReset: () => {
        const { clubs } = get();
        const isGameFromToday = get().isGameFromToday;

        if (!clubs || Object.keys(clubs).length === 0) {
          if (DEBUG) console.log("[DailyGames] No hay clubs → reset necesario");
          return true;
        }

        for (const clubId in clubs) {
          const lastGames = clubs[clubId]?.lastGames;
          if (!lastGames) return true;

          for (const gameType in lastGames) {
            const game = lastGames[gameType];
            if (!game?.date) return true;

            if (!isGameFromToday(game.date)) {
              if (DEBUG)
                console.log(
                  `[DailyGames] Juego viejo encontrado ${gameType} (${game.date})`
                );
              return true;
            }
          }
        }

        return false;
      },

      // -----------------------------------------
      // Reset
      // -----------------------------------------
      resetForNewDay: () => {
        if (DEBUG) console.log("[DailyGames] ResetForNewDay ejecutado");
        set({
          clubs: {},
          allGamesFetched: false,
          error: null,
        });
      },

      // -------------------------------
      // Métodos existentes
      // -------------------------------
      setAllGames: (gamesByClub) => {
        if (DEBUG) console.log("[v0] setAllGames called");

        const isToday = get().isGameFromToday;
        const cleaned = {};

        for (const clubId in gamesByClub) {
          const entry = gamesByClub[clubId];
          const lastGames = entry.lastGames || {};

          const filtered = {};

          for (const type in lastGames) {
            const game = lastGames[type];
            if (game?.date && isToday(game.date)) {
              filtered[type] = game;
            } else {
              if (DEBUG) console.warn(`[DailyGames] ❌ Juego viejo: ${type}`);
            }
          }

          cleaned[clubId] = {
            lastGames: filtered,
            totalGames: Object.keys(filtered).length,
            lastUpdated: new Date().toISOString(),
          };
        }

        set({
          clubs: cleaned,
          allGamesFetched: true,
          error: null,
        });
      },

      setClubGames: (clubId, gamesData) => {
        const key = clubId || "null";
        if (DEBUG)
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
        return clubs[clubId || "null"]?.lastGames || null;
      },

      getGame: (clubId, gameType) => {
        const { clubs } = get();
        const key = clubId || "null";
        const game = clubs[key]?.lastGames?.[gameType] || null;
        if (DEBUG) console.log("[v0] getGame:", key, gameType, game);
        return game;
      },

      getClubData: (clubId) => {
        const { clubs } = get();
        return clubs[clubId || "null"] || null;
      },

      forceRefresh: () =>
        set({
          clubs: {},
          allGamesFetched: false,
          error: null,
        }),

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
