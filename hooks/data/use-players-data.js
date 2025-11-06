"use client";

import { useState, useEffect } from "react";

const CACHE_KEY_PREFIX = "players_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

/**
 * Hook para obtener jugadores con cache en localStorage
 * Según el flujo: verifica cache local → fetch backend → guarda en cache
 * // Now accepts club parameter (can be clubId or club name)
 */
export function usePlayersData(club = null) {
  const [players, setPlayers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const cacheKey = club
          ? `${CACHE_KEY_PREFIX}:${club}`
          : `${CACHE_KEY_PREFIX}:global`;

        // 1. Verificar localStorage
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const now = Date.now();

          // Verificar si el cache es válido (menos de 24 horas)
          if (parsed.timestamp && now - parsed.timestamp < CACHE_DURATION) {
            console.log("[v0] Using cached players from localStorage");
            setPlayers(parsed.data.players || parsed.data);
            setClubs(parsed.data.clubs || []);
            setIsLoading(false);
            return;
          }
        }

        // 2. Si no hay cache válido, fetch del backend
        console.log(
          "[v0] Fetching players from backend for club:",
          club || "all"
        );

        const url = club
          ? `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
            }/api/admin/players/by-club?club=${club}`
          : `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
            }/api/admin/players`;

        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const data = await response.json();

        // 3. Guardar en localStorage
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            data: Array.isArray(data) ? data : { players: data, clubs: [] },
            timestamp: Date.now(),
          })
        );

        console.log(
          "[v0] Players fetched and cached, total:",
          Array.isArray(data) ? data.length : data.players?.length || 0
        );

        setPlayers(Array.isArray(data) ? data : data.players || []);
        setClubs(Array.isArray(data) ? [] : data.clubs || []);
      } catch (err) {
        console.error("[v0] Error fetching players:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, [club]); // Changed dependency from clubSlug to club

  return { players, clubs, isLoading, error };
}
