"use client";

import { useState, useEffect } from "react";
export function useCoachData() {
  const [clubs, setClubs] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching coach data...");

        const [clubsRes, leaguesRes, countriesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/leagues`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/countries`, {
            credentials: "include",
          }),
        ]);

        console.log("Response status:", {
          clubs: clubsRes.status,
          leagues: leaguesRes.status,
          countries: countriesRes.status,
        });

        // Check if responses are ok before parsing JSON
        const clubsData = clubsRes.ok ? await clubsRes.json() : [];
        const leaguesData = leaguesRes.ok ? await leaguesRes.json() : [];

        let countriesData = [];
        if (countriesRes.ok) {
          const countriesText = await countriesRes.text();
          try {
            countriesData = JSON.parse(countriesText);
          } catch (e) {
            console.error("Error parsing countries JSON:", e);
            console.log("Countries response text:", countriesText);
            countriesData = [];
          }
        } else {
          console.error(
            "Countries API failed with status:",
            countriesRes.status
          );
        }

        console.log("Fetched data:", {
          clubs: clubsData.length,
          leagues: leaguesData.length,
          countries: countriesData.length,
        });

        setClubs(clubsData);
        setLeagues(leaguesData);
        setCountries(countriesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addClub = (club) => {
    setClubs((prev) => [...prev, club]);
  };

  const addLeague = (league) => {
    setLeagues((prev) => [...prev, league]);
  };

  return {
    clubs,
    leagues,
    countries,
    isLoading,
    addClub,
    addLeague,
  };
}
