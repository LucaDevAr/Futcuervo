"use client";

import { Trophy, Shield } from "lucide-react";
import { HomeStats } from "./home/HomeStats";
import Footer from "@/components/layout/Footer";
import { useClubModal } from "@/components/club/ClubModalContext";

export default function HomeClient() {
  const { openClubModal } = useClubModal();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-12">
        <h1 className="text-4xl font-bold text-center mt-12">
          Bienvenido a Fut ?
        </h1>

        <div className="flex gap-4 my-6 text-white">
          <button
            disabled
            className="btn-disabled flex items-center gap-2 px-5 py-3 bg-[var(--secondary)] rounded-lg"
          >
            <Trophy className="w-5 h-5" />
            Rankings
          </button>

          <button
            onClick={openClubModal}
            className="btn-primary flex items-center gap-2 px-5 py-3 bg-[var(--primary)] rounded-lg"
          >
            <Shield className="w-5 h-5" />
            Clubes
          </button>
        </div>

        <HomeStats clubId={null} clubSlug={null} imageMode="white" />
      </main>

      <Footer />
    </div>
  );
}
