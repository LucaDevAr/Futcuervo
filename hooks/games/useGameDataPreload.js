"use client";

import { useState, useEffect } from "react";

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24h
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";

const CACHE_KEYS = {
  players: "futcuervo_players_cache",
  coaches: "futcuervo_coaches_cache",
  leagues: "futcuervo_leagues_cache",
  clubs: "futcuervo_clubs_cache",
};

export function useGameDataPreload({
  needPlayers = false,
  needCoaches = false,
  needLeagues = false,
  needClubs = false,
  clubId = null,
  skip = false,
}) {
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [isLoading, setIsLoading] = useState(!skip);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (skip) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function load(key, url, setState, keyWithClub = false) {
      const cacheKey =
        keyWithClub && clubId
          ? `${CACHE_KEYS[key]}:${clubId}`
          : CACHE_KEYS[key];

      let cached = [];
      let valid = false;
      const raw = localStorage.getItem(cacheKey);

      if (raw) {
        const { data, timestamp } = JSON.parse(raw);
        if (Date.now() - timestamp < CACHE_DURATION) valid = true;
        cached = data;
      }

      let fresh = [];
      if (!valid) {
        const res = await fetch(url);
        const json = await res.json();
        fresh = json?.[key] || json || [];
      }

      // Merge sin duplicados
      const merged = [
        ...new Map([...cached, ...fresh].map((i) => [i._id, i])).values(),
      ];

      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data: merged, timestamp: Date.now() })
      );
      if (!cancelled) setState(merged);
    }

    async function preload() {
      try {
        setIsLoading(true);

        if (needClubs) await load("clubs", `${BASE_URL}/api/clubs`, setClubs);

        if (needPlayers)
          await load(
            "players",
            clubId
              ? `${BASE_URL}/api/players/by-club-id?clubId=${clubId}`
              : `${BASE_URL}/api/players`,
            setPlayers,
            true
          );

        if (needCoaches)
          await load(
            "coaches",
            clubId
              ? `${BASE_URL}/api/coaches/by-club-id?clubId=${clubId}`
              : `${BASE_URL}/api/coaches`,
            setCoaches,
            true
          );

        if (needLeagues)
          await load("leagues", `${BASE_URL}/api/leagues`, setLeagues);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    preload();
    return () => (cancelled = true);
  }, [needPlayers, needCoaches, needLeagues, needClubs, clubId, skip]);

  return { players, coaches, leagues, clubs, isLoading, error };
}
