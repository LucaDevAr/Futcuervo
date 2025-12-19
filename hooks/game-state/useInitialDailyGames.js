"use client";

import { useEffect, useRef } from "react";
import { dailyGamesApi } from "@/services/dailyGamesApi";
import { useDailyGamesStore } from "@/stores/dailyGamesStore";

const DEBUG =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_DEBUG === "true";

export const useInitialDailyGames = () => {
  const { setAllGames, allGamesFetched, needsDailyReset, resetForNewDay } =
    useDailyGamesStore();

  const mountedRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) {
      if (DEBUG) console.log("[v3] useInitialDailyGames mounted (REAL)");
      mountedRef.current = true;
    }
  }, []);

  // 🟢 1. Reset automático por cambio de día
  useEffect(() => {
    if (needsDailyReset()) {
      if (DEBUG) console.log("[v3] Nuevo día → reseteando");
      resetForNewDay();
    }
  }, [needsDailyReset, resetForNewDay]);

  // 🔥 2. Fetch si hace falta
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }

    const fetchAll = async () => {
      if (allGamesFetched) {
        if (DEBUG)
          console.log("%c[v3] Daily games ya cargados", "color:#22c55e");
        initializedRef.current = true;
        return;
      }

      try {
        const cachedGames = localStorage.getItem("daily-games-storage");
        if (cachedGames) {
          const parsed = JSON.parse(cachedGames);
          if (parsed.state?.allGamesFetched && parsed.state?.clubs) {
            const todayStr = new Date().toLocaleDateString("sv-SE");
            const clubs = parsed.state.clubs;

            // Verificar que todos los juegos sean de hoy
            let allFromToday = true;
            for (const clubId in clubs) {
              const lastGames = clubs[clubId]?.lastGames || {};
              for (const gameType in lastGames) {
                const game = lastGames[gameType];
                if (game?.date) {
                  const gameDate = new Date(game.date).toLocaleDateString(
                    "sv-SE"
                  );
                  if (gameDate !== todayStr) {
                    allFromToday = false;
                    if (DEBUG)
                      console.log(
                        `[v3] ⚠️ Cache inválido: juego ${gameType} de fecha ${gameDate}`
                      );
                    break;
                  }
                }
              }
              if (!allFromToday) break;
            }

            if (allFromToday) {
              if (DEBUG)
                console.log("%c[v3] ✅ Cache válido y actual", "color:#10b981");
              setAllGames(clubs);
              initializedRef.current = true;
              return;
            } else {
              if (DEBUG)
                console.log("[v3] ⚠️ Cache contiene juegos viejos → refetch");
            }
          }
        }
      } catch (err) {
        if (DEBUG) console.warn("[v3] localStorage error:", err.message);
      }

      try {
        if (DEBUG) console.log("[v3] 🔥 Fetching daily games...");
        const data = await dailyGamesApi.getAllDailyGames();

        if (data) {
          setAllGames(data);
        }
        initializedRef.current = true;
      } catch (err) {
        console.error("[v3] Error fetching games:", err);
        initializedRef.current = true;
      }
    };

    fetchAll();
  }, [allGamesFetched, setAllGames]);

  return {};
};
