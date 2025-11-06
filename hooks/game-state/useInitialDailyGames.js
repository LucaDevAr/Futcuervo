import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dailyGamesApi } from "@/services/dailyGamesApi";
import { useDailyGamesStore } from "@/stores/dailyGamesStore";

export const useInitialDailyGames = () => {
  console.log("[v0] useInitialDailyGames mounted ✅");

  const { setAllGames, allGamesFetched, forceRefresh } = useDailyGamesStore();

  // 🧠 Verificamos si cambió el día para limpiar cache
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem("dailyGamesDate");

    if (storedDate !== today) {
      console.log("[v0] New day detected 🗓️ Clearing cached games...");
      forceRefresh(); // limpiamos todos los juegos
      localStorage.setItem("dailyGamesDate", today);
    }
  }, [forceRefresh]);

  // 🔹 Query para traer TODOS los daily games
  const query = useQuery({
    queryKey: ["allDailyGames", new Date().toDateString()],
    queryFn: async () => {
      console.log("[v0] Fetching ALL daily games from API...");
      const data = await dailyGamesApi.getAllDailyGames();
      console.log("[v0] ✅ Games fetched from API:", data);
      return data;
    },
    enabled: !allGamesFetched,
    retry: 1,
    staleTime: 1000 * 60 * 60 * 24, // 1 día
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // 🧩 Guardamos en el store cuando se cargan
  useEffect(() => {
    if (query.data && !allGamesFetched) {
      console.log("[v0] Setting allGames in store...");
      setAllGames(query.data);
    }
  }, [query.data, allGamesFetched, setAllGames]);

  return query;
};
