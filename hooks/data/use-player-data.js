"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

export function usePlayerData() {
  const [clubs, setClubs] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

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

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json();
          setClubs(clubsData);
        }

        if (leaguesRes.ok) {
          const leaguesData = await leaguesRes.json();
          setLeagues(leaguesData);
        }

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json();
          setCountries(countriesData);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast.error("Error al cargar datos necesarios");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const addClub = (newClub) => {
    setClubs((prev) => [...prev, newClub]);
  };

  const addLeague = (newLeague) => {
    setLeagues((prev) => [...prev, newLeague]);
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
