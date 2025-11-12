"use client";

import { useState, useEffect } from "react";

const CLUBS_CACHE_KEY = "futcuervo_clubs";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Hook to fetch and cache clubs globally
 * Checks localStorage first, then fetches from API if needed
 */
export const useClubs = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        console.log("[v0] useClubs - Starting fetch");
        const apiUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000";
        console.log("[v0] useClubs - API URL:", apiUrl);

        // Check localStorage first
        const cachedData = localStorage.getItem(CLUBS_CACHE_KEY);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const now = Date.now();
          const cacheAge = now - parsed.timestamp;

          // If cache is less than 24 hours old, use it
          if (cacheAge < CACHE_DURATION) {
            console.log("[v0] useClubs - Using localStorage cache");
            setClubs(parsed.clubs);
            setLoading(false);
            return;
          } else {
            console.log("[v0] useClubs - Cache expired, fetching fresh data");
          }
        }

        // Fetch from API
        const fullUrl = `${apiUrl}/api/clubs`;
        console.log("[v0] useClubs - Fetching from:", fullUrl);

        const response = await fetch(fullUrl, {
          credentials: "include",
        });

        console.log("[v0] useClubs - Response status:", response.status);
        console.log("[v0] useClubs - Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[v0] useClubs - Error response:", errorText);
          throw new Error(
            `Failed to fetch clubs: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        const clubsData = data.clubs || [];

        console.log("[v0] useClubs - Fetched clubs:", clubsData.length);

        // Save to localStorage
        localStorage.setItem(
          CLUBS_CACHE_KEY,
          JSON.stringify({
            clubs: clubsData,
            timestamp: Date.now(),
          })
        );

        setClubs(clubsData);
        setLoading(false);
      } catch (err) {
        console.error("[v0] useClubs - Error:", err);
        console.error("[v0] useClubs - Error message:", err.message);
        console.error("[v0] useClubs - Error stack:", err.stack);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  return { clubs, loading, error };
};

/**
 * Helper function to clear clubs cache
 */
export const clearClubsCache = () => {
  localStorage.removeItem(CLUBS_CACHE_KEY);
  console.log("[v0] Clubs cache cleared from localStorage");
};
