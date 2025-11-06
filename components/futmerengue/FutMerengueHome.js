"use client";

import { useUserSession } from "@/hooks/auth/useUserSession";
import { HomeStats } from "@/components/home/HomeStats";
import Footer from "@/components/layout/Footer";
import { useClubGames } from "@/hooks/games/useClubGames";
import { useGameStats } from "@/hooks/game-state/useGameStats";
import { ArrowLeft, Shield, Trophy, X } from "lucide-react";
import ClubSelector from "../ClubSelector";
import Rankings from "../Rankings";
import { useState } from "react";

export default function FutMerengueHome() {
  const { user, loading: userLoading } = useUserSession();
  // TODO: Replace with actual Real Madrid club ID from your database
  const clubId = "686a78a8607a6a666f53a675";
  const {
    stats,
    isLoading: statsLoading,
    error,
    totalGames,
  } = useGameStats(clubId);
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);

  const gameItems = useClubGames("futmerengue");

  const handleGameClick = (item) => {
    window.location.href = item.path;
  };

  return (
    <div className="bg-[var(--background)] text-[var(--text)] min-h-screen">
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-12 mx-auto">
          <h1 className="text-4xl font-bold text-center">
            Bienvenido a Futmerengue
          </h1>

          {/* Botones Superiores */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-6">
            {/* Volver al Home */}
            <button
              className="flex items-center gap-2 px-5 py-3 bg-[var(--home-button-bg)] text-[var(--home-button-text)] rounded-lg shadow hover:opacity-90 transition"
              onClick={() => (window.location.href = "/")}
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Home
            </button>

            {/* Rankings (Deshabilitado) */}
            <button
              disabled
              className="flex items-center gap-2 px-5 py-3 bg-gray-500/70 text-gray-200 rounded-lg shadow cursor-not-allowed"
            >
              <Trophy className="w-4 h-4 opacity-70" />
              Rankings (Próximamente)
            </button>

            {/* Cambiar Club */}
            <button
              className="flex items-center gap-2 px-5 py-3 bg-[var(--home-button-bg)] text-[var(--home-button-text)] rounded-lg shadow hover:opacity-90 transition"
              onClick={() => setClubModalOpen(true)}
            >
              <Shield className="w-5 h-5" />
              Cambiar Club
            </button>
          </div>

          <HomeStats
            stats={stats}
            loading={statsLoading}
            error={error}
            onGameClick={handleGameClick}
            gameItems={gameItems}
            imageMode={{ light: "white", dark: "black" }}
          />

          {/* CONTENIDO INFORMATIVO */}
          <div className="mt-10 max-w-3xl mx-auto text-center px-4 space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
            <p>
              Bienvenido a <strong>FutMerengue</strong>, la plataforma dedicada
              a los hinchas del <strong>Real Madrid</strong>. Aquí celebramos la
              historia, los ídolos y la pasión merengue a través de juegos y
              trivias diarias.
            </p>
            <p>
              ¿Cuánto sabés del <em>Madrid</em>? Participá en desafíos únicos
              sobre <strong>jugadores legendarios</strong>,{" "}
              <strong>camisetas históricas</strong>,{" "}
              <strong>goles memorables</strong> y{" "}
              <strong>momentos inolvidables</strong>.
            </p>
            <p>
              Todos los días nuevos retos para sumar{" "}
              <strong>rachas de victorias</strong> y romper tus{" "}
              <strong>récords personales</strong>. Compará tus resultados con
              otros madridistas y mantené viva la pasión merengue.
            </p>
            <p>
              FutMerengue es un homenaje al club más grande del mundo. ¡Jugá,
              compartí y disfrutá la pasión por el Real Madrid como nunca antes!
            </p>
          </div>
        </main>
        <Footer />
      </div>

      {/* Modal Club */}
      {clubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className="rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-lg"
            style={{
              backgroundColor: "var(--primary)",
              color: "var(--white)",
              border: "2px solid var(--secondary)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--secondary)" }}
            >
              <h2 className="text-xl sm:text-2xl font-bold">
                Selecciona tu Club
              </h2>
              <button
                onClick={() => setClubModalOpen(false)}
                style={{ color: "var(--white)" }}
                className="hover:opacity-80 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 flex-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
              <ClubSelector />
            </div>
          </div>
        </div>
      )}

      {/* Modal Rankings */}
      {rankingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-[var(--primary)] rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--secondary)]">
              <h2 className="text-xl sm:text-2xl font-bold">Rankings</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setRankingModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <Rankings />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
