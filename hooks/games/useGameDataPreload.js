"use client";

import { useState, useEffect } from "react";
import { requiresDataPreload } from "@/constants/gameDataRequirements";
import { useClubs } from "@/hooks/data/useClubs";

const PLAYERS_CACHE_KEY = "futcuervo_players_cache";
const COACHES_CACHE_KEY = "futcuervo_coaches_cache";
const LEAGUES_CACHE_KEY = "futcuervo_leagues_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas

/**
 * Hook para precargar jugadores, clubes, ligas y coaches al entrar a juegos random
 * Solo precarga si el juego lo requiere (goals, appearances, national-team, league-team)
 *
 * Flujo:
 * 1. Detecta si el juego necesita precarga
 * 2. Obtiene clubes (una sola vez, globalmente)
 * 3. Revisa si hay jugadores cacheados en localStorage
 * 4. Hace fetch de jugadores del backend filtrados por clubId
 * 5. Fusiona cache local + nuevos jugadores
 * 6. Elimina duplicados por _id
 * 7. Guarda jugadores fusionados en localStorage
 * 8. Hace lo mismo con los coaches
 * 9. Hace lo mismo con las ligas
 */
export function useGameDataPreload(gameSlug, clubId = null) {
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { clubs, loading: clubsLoading, error: clubsError } = useClubs();

  useEffect(() => {
    const needsPreload = requiresDataPreload(gameSlug);

    if (!needsPreload) {
      console.log(`[v0] Game "${gameSlug}" doesn't require data preload`);
      setIsLoading(false);
      return;
    }

    if (clubsLoading) {
      console.log("[v0] Waiting for clubs to load...");
      return;
    }

    if (clubsError) {
      console.error("[v0] Error loading clubs:", clubsError);
      setError(clubsError);
      setIsLoading(false);
      return;
    }

    async function preloadData() {
      try {
        console.log(
          `[v0] Preloading players, coaches, and leagues for game: ${gameSlug}`
        );

        // --- Jugadores ---
        const cacheKey = clubId
          ? `${PLAYERS_CACHE_KEY}:${clubId}`
          : PLAYERS_CACHE_KEY;

        let cachedPlayers = [];
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            cachedPlayers = Array.isArray(data) ? data : data.players || [];
            console.log("[v0] Found cached players:", cachedPlayers.length);
          } else {
            console.log("[v0] Cache expired");
          }
        }

        console.log("[v0] Fetching players from backend...");
        const playersUrl = clubId
          ? `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
            }/api/players/by-club-id?clubId=${clubId}`
          : `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
            }/api/players`;

        console.log("[v0] Fetch players URL:", playersUrl);

        const playersResponse = await fetch(playersUrl);
        console.log("[v0] Players response status:", playersResponse.status);

        if (!playersResponse.ok) {
          const text = await playersResponse.text();
          console.error("[v0] Backend error response:", text);
          throw new Error(
            `Failed to fetch players (status ${playersResponse.status})`
          );
        }

        const newPlayers = await playersResponse.json();
        console.log("[v0] Fetched new players:", newPlayers.length);

        const playersMap = new Map();
        (cachedPlayers || []).forEach((player) => {
          if (player._id) playersMap.set(player._id, player);
        });
        (newPlayers || []).forEach((player) => {
          if (player._id) playersMap.set(player._id, player);
        });

        const mergedPlayers = Array.from(playersMap.values());
        console.log(
          "[v0] Merged players (no duplicates):",
          mergedPlayers.length
        );

        localStorage.setItem(
          cacheKey,
          JSON.stringify({ data: mergedPlayers, timestamp: Date.now() })
        );

        setPlayers(mergedPlayers);

        // --- Entrenadores ---
        const coachesCacheKey = clubId
          ? `${COACHES_CACHE_KEY}:${clubId}`
          : COACHES_CACHE_KEY;

        let cachedCoaches = [];
        const coachesCached = localStorage.getItem(coachesCacheKey);
        if (coachesCached) {
          const { data, timestamp } = JSON.parse(coachesCached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            cachedCoaches = Array.isArray(data) ? data : data.coaches || [];
            console.log("[v0] Found cached coaches:", cachedCoaches.length);
          } else {
            console.log("[v0] Coaches cache expired");
          }
        }

        console.log("[v0] Fetching coaches from backend...");
        const coachesUrl = clubId
          ? `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
            }/api/coaches/by-club-id?clubId=${clubId}`
          : `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
            }/api/coaches`;

        console.log("[v0] Fetch coaches URL:", coachesUrl);

        const coachesResponse = await fetch(coachesUrl);
        console.log("[v0] Coaches response status:", coachesResponse.status);

        if (!coachesResponse.ok) {
          const text = await coachesResponse.text();
          console.error("[v0] Backend coaches error response:", text);
          throw new Error(
            `Failed to fetch coaches (status ${coachesResponse.status})`
          );
        }

        const coachesData = await coachesResponse.json();
        const newCoaches = Array.isArray(coachesData)
          ? coachesData
          : coachesData.coaches || [];

        console.log("[v0] Fetched new coaches:", newCoaches.length);

        const coachesMap = new Map();
        (cachedCoaches || []).forEach((coach) => {
          if (coach && coach._id) coachesMap.set(coach._id, coach);
        });
        (newCoaches || []).forEach((coach) => {
          if (coach && coach._id) coachesMap.set(coach._id, coach);
        });

        const mergedCoaches = Array.from(coachesMap.values());
        console.log(
          "[v0] Merged coaches (no duplicates):",
          mergedCoaches.length
        );

        localStorage.setItem(
          coachesCacheKey,
          JSON.stringify({ data: mergedCoaches, timestamp: Date.now() })
        );

        setCoaches(mergedCoaches);

        // --- LIGAS ---
        let cachedLeagues = [];
        const leaguesCached = localStorage.getItem(LEAGUES_CACHE_KEY);
        if (leaguesCached) {
          const { data, timestamp } = JSON.parse(leaguesCached);
          if (Date.now() - timestamp < CACHE_DURATION) {
            cachedLeagues = Array.isArray(data) ? data : data.leagues || [];
            console.log("[v0] Found cached leagues:", cachedLeagues.length);
          } else {
            console.log("[v0] Leagues cache expired");
          }
        }

        // Fetch leagues desde backend
        console.log("[v0] Fetching leagues from backend...");
        const leaguesUrl = `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
        }/api/leagues`;

        console.log("[v0] Fetch leagues URL:", leaguesUrl);

        const leaguesResponse = await fetch(leaguesUrl);
        console.log("[v0] Leagues response status:", leaguesResponse.status);

        if (!leaguesResponse.ok) {
          const text = await leaguesResponse.text();
          console.error("[v0] Backend leagues error response:", text);
          throw new Error(
            `Failed to fetch leagues (status ${leaguesResponse.status})`
          );
        }

        const newLeagues = await leaguesResponse.json();
        console.log("[v0] Fetched new leagues:", newLeagues.length);

        // Merge sin duplicados
        const leaguesMap = new Map();
        (cachedLeagues || []).forEach((league) => {
          if (league && league._id) leaguesMap.set(league._id, league);
        });
        (newLeagues || []).forEach((league) => {
          if (league && league._id) leaguesMap.set(league._id, league);
        });

        const mergedLeagues = Array.from(leaguesMap.values());
        console.log(
          "[v0] Merged leagues (no duplicates):",
          mergedLeagues.length
        );

        // Guardar cache
        localStorage.setItem(
          LEAGUES_CACHE_KEY,
          JSON.stringify({ data: mergedLeagues, timestamp: Date.now() })
        );

        setLeagues(mergedLeagues);
      } catch (err) {
        console.error("[v0] Error preloading data:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    }

    preloadData();
  }, [gameSlug, clubId, clubsLoading, clubsError, clubs]);

  return {
    players,
    clubs,
    coaches,
    leagues,
    isLoading: isLoading || clubsLoading,
    error: error || clubsError,
  };
}
