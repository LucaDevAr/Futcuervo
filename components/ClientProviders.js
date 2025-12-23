"use client";

import { usePathname } from "next/navigation";
import { useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import { useInitialDailyGames } from "@/hooks/game-state/useInitialDailyGames";
import { getClubBySlug } from "@/config/club";
import { ClubModalProvider } from "./club/ClubModalContext";

function InitGameState() {
  useInitialDailyGames();
  return null;
}

export default function ClientProviders({ children }) {
  const pathname = usePathname();

  // Determinar club actual
  const segments = pathname.split("/");
  const clubSlug = segments[1]; // /futcuervo → futcuervo
  const club = getClubBySlug(clubSlug);

  // Props del Navbar, memorizados
  const navbarProps = useMemo(() => {
    if (club) {
      return { title: club.name, logo: club.logo, homeUrl: `/${clubSlug}` };
    }
    return { title: "Fut ?", logo: "/images/logo.png", homeUrl: "/" };
  }, [club, clubSlug]);

  // Ocultar navbar en rutas específicas
  const hideNavbar = pathname.startsWith("/admin");

  return (
    <>
      <InitGameState />
      <div
        data-club={clubSlug || "home"}
        className="bg-[var(--background)] min-h-screen text-[var(--text)]"
      >
        <ClubModalProvider>
          {/* Navbar solo si no está oculto */}
          {!hideNavbar && <Navbar {...navbarProps} />}

          {/* Main con padding dinámico si hay navbar */}
          <main className={`${!hideNavbar ? "pt-[56px] md:pt-[64px]" : ""}`}>
            {children}
          </main>
        </ClubModalProvider>
      </div>
    </>
  );
}
