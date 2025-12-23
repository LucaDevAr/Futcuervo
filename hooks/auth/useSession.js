"use client";

import { useEffect, useRef, useState } from "react";
import { useUserStore } from "@/stores/userStore";
import { useGameAttemptsStore } from "@/stores/gameAttemptsStore";
import { fetchUserSession } from "@/services/api";
import { gameStatsApi } from "@/services/gameStatsApi";

const DEBUG =
  process.env.NODE_ENV === "development" &&
  process.env.NEXT_PUBLIC_DEBUG === "true";

export function useSession() {
  const { hasAuthHint, setHasAuthHint, setUser, clearUser } = useUserStore();
  const { setAllAttempts, clearAttempts } = useGameAttemptsStore();

  const initializedRef = useRef(false);
  const [ready, setReady] = useState(false);

  /* -----------------------------
     1️⃣ Leer auth_hint
  ----------------------------- */
  useEffect(() => {
    const hasHint = document.cookie.includes("auth_hint=1");
    if (DEBUG) console.log("[AUTH] auth_hint:", hasHint);
    setHasAuthHint(hasHint);
    setReady(true);
  }, [setHasAuthHint]);

  /* -----------------------------
     2️⃣ Hidratación
  ----------------------------- */
  useEffect(() => {
    if (!ready || initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      if (DEBUG) console.log("[AUTH] useSession init", { hasAuthHint });

      /* 👤 Invitado */
      if (!hasAuthHint) {
        clearUser();
        clearAttempts();
        return;
      }

      /* ============================
         USER desde localStorage
      ============================ */
      const cachedUserRaw = localStorage.getItem("user");
      const cachedAttemptsRaw = localStorage.getItem("game-attempts-storage");

      let hasUser = false;

      if (cachedUserRaw) {
        try {
          const parsedUser = JSON.parse(cachedUserRaw);
          setUser({
            ...parsedUser,
            points: parsedUser.points ?? 0,
            clubMembers: Array.isArray(parsedUser.clubMembers)
              ? parsedUser.clubMembers
              : [],
          });
          hasUser = true;
          if (DEBUG) console.log("[AUTH] User desde cache");
        } catch {
          localStorage.removeItem("user");
        }
      }

      /* ============================
         ATTEMPTS desde localStorage
      ============================ */
      if (cachedAttemptsRaw) {
        try {
          const parsed = JSON.parse(cachedAttemptsRaw);
          if (parsed?.clubs) {
            setAllAttempts(parsed.clubs);
            if (DEBUG) console.log("[AUTH] Attempts desde cache → OK");
          }
        } catch {
          localStorage.removeItem("game-attempts-storage");
        }
      }

      /* ✅ Cache suficiente */
      if (hasUser && cachedAttemptsRaw) {
        if (DEBUG) console.log("[AUTH] Cache completo → no fetch");
        return;
      }

      /* ============================
         SOLO falta ATTEMPTS
      ============================ */
      if (hasUser && !cachedAttemptsRaw) {
        if (DEBUG) console.log("[AUTH] Falta attempts → /home/stats/all");

        const data = await gameStatsApi.getAllUserAttempts();
        if (data?.attemptsByClub) {
          setAllAttempts(data.attemptsByClub);
        }
        return;
      }

      /* ============================
         NO hay USER → /auth/me
      ============================ */
      try {
        if (DEBUG) console.log("[AUTH] No user → fetch /auth/me");

        const session = await fetchUserSession();
        if (!session?.user) throw new Error("No session");

        const normalizedUser = {
          ...session.user,
          points: session.user.points ?? 0,
          clubMembers: Array.isArray(session.clubMemberships)
            ? session.clubMemberships
            : [],
        };

        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));

        if (session.attemptsByClub) {
          setAllAttempts(session.attemptsByClub);
        }
      } catch (err) {
        console.error("[AUTH] sesión inválida", err);
        clearUser();
        clearAttempts();
      }
    })();
  }, [ready, hasAuthHint, setUser, clearUser, setAllAttempts, clearAttempts]);

  return { hasAuthHint };
}
