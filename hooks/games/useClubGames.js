"use client";

import { useMemo } from "react";
import { getClubGames } from "@/config/clubGames";

/**
 * Hook para obtener los juegos disponibles de un club
 * No hace fetch, solo lee la configuración local
 *
 * @param {string} clubKey - Identificador del club (ej: "futcuervo", "barcelona", "general")
 * @returns {Array} Lista de juegos disponibles para ese club
 *
 * @example
 * const games = useClubGames("futcuervo");
 * // games = [{ title: "Equipo nacional", gameType: "national", ... }, ...]
 */
export function useClubGames(clubKey = "general") {
  const games = useMemo(() => {
    return getClubGames(clubKey);
  }, [clubKey]);

  return games;
}
