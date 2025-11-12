"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUserSession } from "@/hooks/auth/useUserSession";
import {
  useInitialDailyGames,
  useInitialGameAttempts,
} from "@/hooks/game-state";

const MiniPlayer = dynamic(() => import("@/components/audio/MiniPlayer"), {
  ssr: false,
});
const PlayerModal = dynamic(() => import("@/components/audio/PlayerModal"), {
  ssr: false,
});

function SessionInitializer() {
  useUserSession();
  return null;
}

function InitGameState() {
  useInitialGameAttempts();
  useInitialDailyGames();
  return null;
}

export default function ClientProviders({ children }) {
  const pathname = usePathname();
  const [queryClient] = useState(() => new QueryClient()); // ✅ QueryClient estable

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
    <QueryClientProvider client={queryClient}>
      <InitGameState />
      <SessionInitializer />

      <div data-club={dataClub} className="bg-[var(--background)] min-h-screen">
        {!isAdminRoute && !isAuthRoute && navbarProps && (
          <Navbar {...navbarProps} />
        )}

        <main className="pt-[56px] md:pt-[64px] min-h-screen h-full">
          {children}
        </main>

        {!isAdminRoute && !isAuthRoute && (
          <>
            <MiniPlayer />
            <PlayerModal />
          </>
        )}
      </div>
    </QueryClientProvider>
  );
}
