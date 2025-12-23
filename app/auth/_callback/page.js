"use client";

import { useEffect } from "react";
import { setAuthFlag } from "@/utils/authFlag";

const AUTH_FLAG_TTL = 6 * 24 * 60 * 60 * 1000; // 6 días

export default function AuthCallback() {
  useEffect(() => {
    console.log("[AUTH CALLBACK] Google OAuth OK → setting authFlag with TTL");
    setAuthFlag(AUTH_FLAG_TTL);

    setTimeout(() => {
      window.location.href = "/";
    }, 100);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)] mx-auto mb-4"></div>
        <p>Completando inicio de sesión…</p>
      </div>
    </div>
  );
}
