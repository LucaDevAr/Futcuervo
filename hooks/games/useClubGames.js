"use client";

import { useMemo } from "react";
import { getClubGames } from "@/config/games";

/**
 * Hook para obtener los juegos disponibles de un club
 * No hace fetch, solo lee configuración estática
 *
 * @param clubKey Identificador del club (ObjectId string o null)
 */
export function useClubGames(clubKey) {
  return useMemo(() => getClubGames(clubKey), [clubKey]);
}
