"use client";

import { useState } from "react";
import Footer from "@/components/layout/Footer";
import ClubSelector from "@/components/ClubSelector";
import Rankings from "@/components/Rankings";
import { Shield, Trophy, X } from "lucide-react";
import { HomeStats } from "./home/HomeStats";
import { useGameStats } from "@/hooks/game-state/useGameStats";
import { useClubGames } from "@/hooks/games/useClubGames";

export default function HomeClient() {
  const { stats, isLoading: statsLoading, error } = useGameStats();
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [rankingModalOpen, setRankingModalOpen] = useState(false);
  const gameItems = useClubGames("general");

  const handleGameClick = (item) => {
    window.location.href = item.path;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--text)]">
      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-12 mx-auto">
        <h1 className="text-4xl font-bold text-center mt-12">
          Bienvenido a Fut ?
        </h1>

        {/* Botones superiores */}
        {/* <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-6">
          <button
            className="flex items-center gap-2 px-5 py-3 bg-[var(--secondary)] dark:bg-[var(--primary)] text-[var(--white)] rounded-lg shadow hover:opacity-90 transition"
            onClick={() => setRankingModalOpen(true)}
          >
            <Trophy className="w-5 h-5" />
            Rankings
          </button>
          <button
            className="flex items-center gap-2 px-5 py-3 bg-[var(--primary)] dark:bg-[var(--secondary)] text-[var(--white)] rounded-lg shadow hover:opacity-90 transition"
            onClick={() => setClubModalOpen(true)}
          >
            <Shield className="w-5 h-5" />
            Clubes
          </button>
        </div> */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 my-10">
          {/* 🔴 Botón Rankings deshabilitado */}
          <button
            disabled
            className="flex flex-col items-center justify-center w-52 h-52 bg-gray-500/70 text-gray-200 rounded-2xl shadow-md cursor-not-allowed"
          >
            <Trophy className="w-10 h-10 mb-2 opacity-70" />
            <span className="text-lg font-semibold">Rankings</span>
            <span className="text-sm opacity-70 mt-1">(Próximamente)</span>
          </button>

          {/* 🟢 Botón Clubes activo */}
          <button
            className="flex flex-col items-center justify-center w-52 h-52 bg-[var(--primary)] dark:bg-[var(--secondary)] text-[var(--white)] rounded-2xl shadow-lg hover:opacity-90 hover:scale-105 transition-transform"
            onClick={() => setClubModalOpen(true)}
          >
            <Shield className="w-10 h-10 mb-2" />
            <span className="text-lg font-semibold">Clubes</span>
          </button>
        </div>

        {/* Juegos cuadrados */}
        {/* <HomeStats
          stats={stats}
          loading={statsLoading}
          error={error}
          onGameClick={handleGameClick}
          gameItems={gameItems}
        /> */}
        {/* {allAttemptsFetched && allGamesFetched && (
          <HomeStats
            stats={stats}
            loading={statsLoading}
            error={error}
            onGameClick={handleGameClick}
            gameItems={gameItems}
          />
        )} */}
      </main>

      <Footer />

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
            {/* Header fijo */}
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

            {/* Contenido con scroll */}
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
            {/* Header fijo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--secondary)]">
              <h2 className="text-xl sm:text-2xl font-bold">Rankings</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setRankingModalOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            {/* Contenido sin scroll interno */}
            <div className="p-6 flex-1 flex flex-col">
              <Rankings />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
