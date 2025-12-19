import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DEBUG =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_DEBUG === "true";

/**
 * Utilidad: comparamos YYYY-MM-DD de dos ISO strings
 */
function isSameDay(isoA, isoB) {
  try {
    const a = new Date(isoA);
    const b = new Date(isoB);
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  } catch {
    return false;
  }
}

/**
 * Validación estricta de la estructura guardada en storage
 * Debe tener: { clubs: { [clubId|'null']: { lastAttempts: {...}, totalGames, lastUpdated } }, allAttemptsFetched: boolean }
 */
function isValidPersistedAttempts(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (!obj.clubs || typeof obj.clubs !== "object") return false;

  // Validar que las keys sean válidas (null o hex de 24 chars)
  const keys = Object.keys(obj.clubs);
  for (const key of keys) {
    if (key !== "null" && !/^[0-9a-f]{24}$/i.test(key)) return false;

    const clubData = obj.clubs[key];
    if (!clubData || typeof clubData !== "object") return false;
    if (!clubData.lastAttempts || typeof clubData.lastAttempts !== "object")
      return false;
  }

  return typeof obj.allAttemptsFetched === "boolean";
}

const customStorage = {
  getItem: (name) => {
    const str = localStorage.getItem(name);
    return str || null;
  },
  setItem: (name, value) => {
    try {
      const parsed = JSON.parse(value);
      // Si state está vacío (sin clubs y no fetched), NO escribir
      if (
        parsed.state &&
        Object.keys(parsed.state.clubs || {}).length === 0 &&
        !parsed.state.allAttemptsFetched
      ) {
        // Limpiar si ya existe
        localStorage.removeItem(name);
        return;
      }
      // Solo escribir si hay datos reales
      localStorage.setItem(name, value);
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
  },
};

const useGameAttemptsStore = create(
  persist(
    (set, get) => ({
      clubs: {},
      allAttemptsFetched: false,

      setAttemptForGame: (clubId, gameType, attemptData) => {
        set((state) => {
          const key = clubId || "null";
          const existing = state.clubs[key] || {
            lastAttempts: {},
            totalGames: 0,
          };
          const newAttempts = {
            ...existing.lastAttempts,
            [gameType]: attemptData,
          };

          return {
            clubs: {
              ...state.clubs,
              [key]: {
                lastAttempts: newAttempts,
                totalGames: Object.keys(newAttempts).length,
                lastUpdated: new Date().toISOString(),
              },
            },
          };
        });
      },

      setAllAttempts: (clubsData) => {
        set((state) => {
          const merged = { ...state.clubs };

          Object.entries(clubsData).forEach(([clubId, clubAttempts]) => {
            const key = clubId || "null";
            const existing = merged[key];

            // Si no hay datos existentes, usar los nuevos directamente
            if (!existing) {
              merged[key] = clubAttempts;
              return;
            }

            // Si hay datos existentes, mergear por gameType y mantener el más reciente
            const mergedAttempts = { ...existing.lastAttempts };
            Object.entries(clubAttempts.lastAttempts || {}).forEach(
              ([gameType, newAttempt]) => {
                const existingAttempt = mergedAttempts[gameType];

                // Si no existe o el nuevo es más reciente, usar el nuevo
                if (
                  !existingAttempt ||
                  new Date(newAttempt.date) > new Date(existingAttempt.date)
                ) {
                  mergedAttempts[gameType] = newAttempt;
                }
              }
            );

            merged[key] = {
              lastAttempts: mergedAttempts,
              totalGames: Object.keys(mergedAttempts).length,
              lastUpdated: new Date().toISOString(),
            };
          });

          return { clubs: merged, allAttemptsFetched: true };
        });
      },

      getClubData: (clubId) => {
        const key = clubId || "null";
        return get().clubs[key] || null;
      },

      getAttemptForGame: (clubId, gameType) => {
        const key = clubId || "null";
        return get().clubs[key]?.lastAttempts?.[gameType] || null;
      },

      getLastAttempt: (clubId, gameType) => {
        return get().getAttemptForGame(clubId, gameType);
      },

      wasPlayedToday: (clubId, gameType) => {
        return get().hasAttemptToday(clubId, gameType);
      },

      getCurrentStreak: (clubId, gameType) => {
        const attempt = get().getAttemptForGame(clubId, gameType);
        return attempt?.streak || 0;
      },

      getBestScore: (clubId, gameType) => {
        const attempt = get().getAttemptForGame(clubId, gameType);
        return attempt?.recordScore || 0;
      },

      updateAttempt: (clubId, gameType, attemptData) => {
        get().setAttemptForGame(clubId, gameType, attemptData);
      },

      clearAttempts: () => {
        if (DEBUG) console.log("[ATTEMPTS] Limpiando todos los intentos");
        set({ clubs: {}, allAttemptsFetched: false });
      },

      hasAttemptToday: (clubId, gameType) => {
        const attempt = get().getAttemptForGame(clubId, gameType);
        if (!attempt?.date) return false;
        const today = new Date().toISOString().split("T")[0];
        const attemptDate = attempt.date.split("T")[0];
        return attemptDate === today;
      },

      resetForNewDay: () => {
        if (DEBUG) console.log("[ATTEMPTS] Reset para nuevo día");
        set({ clubs: {}, allAttemptsFetched: false });
      },

      cleanupOldAttempts: () => {
        const today = new Date();
        set((state) => {
          const cleaned = {};
          Object.entries(state.clubs).forEach(([key, clubData]) => {
            const filteredAttempts = {};
            Object.entries(clubData.lastAttempts || {}).forEach(
              ([gameType, attempt]) => {
                if (
                  attempt.date &&
                  isSameDay(attempt.date, today.toISOString())
                ) {
                  filteredAttempts[gameType] = attempt;
                }
              }
            );
            if (Object.keys(filteredAttempts).length > 0) {
              cleaned[key] = {
                ...clubData,
                lastAttempts: filteredAttempts,
                totalGames: Object.keys(filteredAttempts).length,
              };
            }
          });
          return { clubs: cleaned };
        });
      },
    }),
    {
      name: "game-attempts-storage",
      storage: createJSONStorage(() => customStorage),
      partialize: (state) => {
        if (
          Object.keys(state.clubs).length === 0 &&
          !state.allAttemptsFetched
        ) {
          return {}; // No guardar nada si está completamente vacío
        }
        return {
          clubs: state.clubs,
          allAttemptsFetched: state.allAttemptsFetched,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (DEBUG && state) {
          console.log("[ATTEMPTS] Hidratación completa desde localStorage");
        }
      },
    }
  )
);

export { useGameAttemptsStore };
export default useGameAttemptsStore;
