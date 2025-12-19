// components/ClientProviders.jsx
"use client";

import React, { useEffect, useRef } from "react";
import { useUserStore } from "@/stores/userStore";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { fetchUserSession, refreshAccessToken } from "@/services/api";
import { gameStatsApi } from "@/services/gameStatsApi";
import Navbar from "@/components/layout/Navbar";
import { usePathname } from "next/navigation";
import { useInitialDailyGames } from "@/hooks/game-state/useInitialDailyGames";

/**
 * Utility: valida el objeto recibido desde localStorage para attempts
 * Mejorada validación para aceptar múltiples formatos de almacenamiento
 * Consider Zustand persist wrapper structure { state: {...}, version: 0 }
 */
function isValidCachedAttempts(parsed) {
  if (!parsed || typeof parsed !== "object") return false;

  const obj = parsed.state || parsed;

  // Caso 1: guardado con estructura { clubs: {...}, allAttemptsFetched: bool }
  if (obj.clubs && typeof obj.clubs === "object") {
    const clubsKeys = Object.keys(obj.clubs);
    return clubsKeys.length > 0;
  }

  // Caso 2: guardado directamente como { clubId: {...}, ... } sin wrapper
  if (typeof obj === "object" && !Array.isArray(obj)) {
    // Verificar que tenga al menos una key de club
    const keys = Object.keys(obj);
    if (keys.length > 0) {
      // Validar que al menos una key tenga estructura de intentos
      return keys.some((key) => {
        const club = obj[key];
        return (
          club &&
          typeof club === "object" &&
          (club.attempts || club.totalAttempts || club.lastAttempts)
        );
      });
    }
  }

  return false;
}

const InitGameState = React.memo(function InitGameState() {
  useInitialDailyGames();
  return null;
});

const DEBUG =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG === "true";

export default function ClientProviders({
  children,
  hasAccessToken,
  hasRefreshToken,
}) {
  const { setUser, clearUser } = useUserStore();
  const setAllAttempts = useGameAttemptsStore((s) => s.setAllAttempts);
  const clearAttempts = useGameAttemptsStore((s) => s.clearAttempts);
  const pathname = usePathname();

  // Evita que el effect se ejecute duplicado en montados/re-renders.
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    (async () => {
      if (DEBUG)
        console.log(
          "%c[AUTH] --- INICIO HIDRATACIÓN CLIENTE ---",
          "color:#3b82f6;font-weight:bold"
        );
      if (DEBUG)
        console.log("[AUTH] Tokens desde SSR →", {
          hasAccessToken,
          hasRefreshToken,
        });

      // 1) No tokens -> usuario invitado
      if (!hasAccessToken && !hasRefreshToken) {
        if (DEBUG)
          console.log(
            "%c[AUTH] → Modo invitado (sin tokens)",
            "color:#ef4444;font-weight:bold"
          );
        clearUser();
        // NO removemos game-attempts-storage del localStorage: preservamos attempts local.
        return;
      }

      // 2) Tenemos refresh pero no access -> intentar refresh (sin reload)
      if (!hasAccessToken && hasRefreshToken) {
        if (DEBUG)
          console.log(
            "%c[AUTH] → NO access, pero HAY refresh → intentamos refresh",
            "color:#fbbf24"
          );
        try {
          await refreshAccessToken();
          if (DEBUG)
            console.log(
              "%c[AUTH] Refresh OK → ahora hay access token",
              "color:#4ade80"
            );
          // ahora hay access token: seguimos hidración
        } catch (err) {
          if (DEBUG)
            console.log(
              "%c[AUTH] Refresh FAILED → usuario invitado",
              "color:#ef4444",
              err
            );
          clearUser();
          clearAttempts();
          return;
        }
      }

      // 3) Hay access token (o acabamos de obtenerlo). Intentamos hidratar desde cache primero
      try {
        if (DEBUG)
          console.log(
            "%c[AUTH] Acceso disponible → Hidratación desde cache si existe",
            "color:#60a5fa"
          );

        const cachedUserRaw = localStorage.getItem("user");
        if (DEBUG) console.log("[AUTH] ¿Hay user cache?", !!cachedUserRaw);

        const cachedAttemptsRaw = localStorage.getItem("game-attempts-storage");
        if (DEBUG)
          console.log("[AUTH] ¿Hay attempts cache?", !!cachedAttemptsRaw);

        // 3A) Si NO hay cachedUser (primera carga o logout), hacemos /auth/me
        // Este endpoint devuelve TANTO el usuario como los attempts
        if (!cachedUserRaw) {
          if (DEBUG)
            console.log(
              "%c[AUTH] No había USER cache → hacemos /auth/me (trae user + attempts)",
              "color:#38bdf8"
            );
          try {
            const session = await fetchUserSession();
            if (DEBUG) console.log("%c[AUTH] /auth/me OK", "color:#4ade80");
            const normalizedUser = {
              ...session.user,
              points: session.user.points ?? 0,
              clubMembers: Array.isArray(session.clubMemberships)
                ? session.clubMemberships
                : [],
            };
            setUser(normalizedUser);
            try {
              localStorage.setItem("user", JSON.stringify(normalizedUser));
              if (DEBUG)
                console.log(
                  "%c[AUTH] Cached USER guardado en localStorage",
                  "color:#34d399"
                );
            } catch (e) {
              console.warn(
                "%c[AUTH] No se pudo guardar user en localStorage",
                "color:#f59e0b",
                e
              );
            }

            // /auth/me ya trae los attempts, así que usamos esos directamente
            if (session.attemptsByClub) {
              if (DEBUG)
                console.log(
                  "%c[AUTH] session.attemptsByClub desde /auth/me → actualizando store",
                  "color:#4ade80",
                  Object.keys(session.attemptsByClub || {})
                );
              setAllAttempts(session.attemptsByClub);
              try {
                localStorage.setItem(
                  "game-attempts-storage",
                  JSON.stringify({
                    clubs: session.attemptsByClub,
                    allAttemptsFetched: true,
                  })
                );
                if (DEBUG)
                  console.log(
                    "%c[AUTH] Attempts guardados en localStorage desde /auth/me",
                    "color:#34d399"
                  );
              } catch (e) {
                console.warn(
                  "%c[AUTH] No se pudo guardar attempts en localStorage",
                  "color:#f59e0b",
                  e
                );
              }
            }
          } catch (err) {
            console.error(
              "%c[AUTH] /auth/me FAILED → modo invitado",
              "color:#ef4444",
              err
            );
            clearUser();
            clearAttempts();
          }
        } else {
          // 3B) Hay USER cache: usarlo directamente
          try {
            const parsedUser = JSON.parse(cachedUserRaw);
            if (DEBUG)
              console.log(
                "%c[AUTH] USER cache encontrado → usando directamente",
                "color:#22c55e"
              );
            setUser({
              ...parsedUser,
              points: parsedUser.points ?? 0,
              clubMembers: Array.isArray(parsedUser.clubMembers)
                ? parsedUser.clubMembers
                : [],
            });
          } catch (err) {
            console.warn(
              "%c[AUTH] Cached user corrupto, ignoro",
              "color:#f59e0b",
              err
            );
          }

          // 3C) Solo si HAY user cache pero NO attempts cache, hacer fetch
          if (!cachedAttemptsRaw) {
            if (DEBUG)
              console.log(
                "%c[AUTH] USER cache existe pero NO attempts cache → fetch /home/stats/all",
                "color:#60a5fa"
              );
            const data = await gameStatsApi.getAllUserAttempts();
            if (data?.attemptsByClub) {
              if (DEBUG)
                console.log(
                  "%c[AUTH] /home/stats/all → datos recibidos",
                  "color:#4ade80",
                  Object.keys(data.attemptsByClub || {})
                );
              setAllAttempts(data.attemptsByClub);
              try {
                localStorage.setItem(
                  "game-attempts-storage",
                  JSON.stringify({
                    clubs: data.attemptsByClub,
                    allAttemptsFetched: true,
                  })
                );
                if (DEBUG)
                  console.log(
                    "%c[AUTH] Attempts guardados en localStorage",
                    "color:#34d399"
                  );
              } catch (e) {
                console.warn(
                  "%c[AUTH] No se pudo guardar attempts en localStorage",
                  "color:#f59e0b",
                  e
                );
              }
            }
          } else {
            // This ensures allAttemptsFetched is set to true and prevents unnecessary fetches
            try {
              const parsedAttempts = JSON.parse(cachedAttemptsRaw);
              if (
                parsedAttempts?.clubs &&
                Object.keys(parsedAttempts.clubs).length > 0
              ) {
                if (DEBUG)
                  console.log(
                    "%c[AUTH] ATTEMPTS cache encontrado → hidratando store",
                    "color:#22c55e"
                  );
                // Set the store BEFORE Zustand hydrates from localStorage
                setAllAttempts(parsedAttempts.clubs);
              } else {
                if (DEBUG)
                  console.log(
                    "%c[AUTH] ATTEMPTS cache existe pero está vacío → permitiendo que Zustand valide",
                    "color:#f59e0b"
                  );
              }
            } catch (err) {
              if (DEBUG)
                console.warn(
                  "%c[AUTH] Error parsing cached attempts",
                  "color:#f59e0b",
                  err
                );
            }
          }
        }

        if (DEBUG)
          console.log(
            "%c[AUTH] Hidratación cliente finalizada",
            "color:#60a5fa"
          );
      } catch (err) {
        console.error(
          "%c[AUTH] Error durante la hidratación general",
          "color:#f87171",
          err
        );
        clearUser();
        clearAttempts();
      }
    })();
  }, [
    hasAccessToken,
    hasRefreshToken,
    setUser,
    setAllAttempts,
    clearUser,
    clearAttempts,
  ]);

  // NAVBAR + layout (SIN cambios funcionales)
  const isAdminRoute = pathname?.startsWith("/admin");
  const isAuthRoute = pathname?.startsWith("/auth");

  const dataClub = pathname?.startsWith("/futcuervo")
    ? "futcuervo"
    : pathname?.startsWith("/futmerengue")
    ? "futmerengue"
    : "";

  let navbarProps = null;
  if (pathname?.startsWith("/futcuervo")) {
    navbarProps = {
      title: "FutCuervo",
      logo: "/images/futcuervo-logo.png",
      homeUrl: "/futcuervo",
    };
  } else if (pathname?.startsWith("/futmerengue")) {
    navbarProps = {
      title: "FutMerengue",
      logo: "/images/futmerengue-logo.png",
      homeUrl: "/futmerengue",
    };
  } else if (pathname === "/" || pathname === "/guide") {
    navbarProps = { title: "Fut ?", logo: "/images/logo.png", homeUrl: "/" };
  }

  return (
    <div>
      <InitGameState />
      <div data-club={dataClub} className="bg-[var(--background)] min-h-screen">
        {!isAdminRoute && !isAuthRoute && navbarProps && (
          <Navbar {...navbarProps} />
        )}
        <main className="pt-[56px] md:pt-[64px] min-h-screen h-full">
          {children}
        </main>
      </div>
    </div>
  );
}
