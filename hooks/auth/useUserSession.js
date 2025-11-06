"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUserSession } from "@/services/api";
import { useUserStore } from "@/stores/userStore";
import { useEffect, useState } from "react";

export const useUserSession = () => {
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);
  const [hydrated, setHydrated] = useState(false);

  // Hydration: cargar fallback de localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const fallback = localStorage.getItem("userFallback");
      if (fallback) {
        try {
          const parsedFallback = JSON.parse(fallback);
          console.log("[v0] Loading user from localStorage:", parsedFallback);
          setUser(parsedFallback);
        } catch (error) {
          console.error("[v0] Error parsing localStorage fallback:", error);
          localStorage.removeItem("userFallback");
        }
      }
      setHydrated(true);
    }
  }, [setUser]);

  const query = useQuery({
    queryKey: ["userSession"],
    queryFn: async () => {
      console.log("[v0] Fetching user session from API...");
      const data = await fetchUserSession();
      console.log("[v0] API response:", data);
      return data;
    },
    enabled: hydrated, // solo ejecuta fetch si estamos en cliente
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (query.data) {
      console.log("[v0] Setting user data:", query.data);
      setUser(query.data);
      localStorage.setItem("userFallback", JSON.stringify(query.data));
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.error) {
      console.log("[v0] Session fetch error:", query.error);

      // 🔥 IMPORTANTE: Si es 401, significa que no hay sesión válida
      if (query.error.response?.status === 401) {
        console.log("[v0] No valid session (401), clearing user data");
        setUser(null);
        localStorage.removeItem("userFallback");
      }
    }
  }, [query.error, setUser]);

  return {
    ...query,
    user,
    // 🔥 TEMPORAL: Considerar que no hay error si es 401 (usuario sin sesión es normal)
    error: query.error?.response?.status === 401 ? null : query.error,
  };
};
