"use client";

import { Shield, Trophy, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { HomeStats } from "./HomeStats";
import { useClubModal } from "@/components/club/ClubModalContext";

export function ClubHome({ club }) {
  const { openClubModal } = useClubModal();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-12">
        <h1 className="text-4xl font-bold text-center">
          Bienvenido a {club.name}
        </h1>

        <div className="flex gap-4 my-6 text-white">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-3 bg-[var(--primary)] rounded-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>

          <button
            disabled
            className="btn-disabled flex items-center gap-2 px-5 py-3 bg-[var(--secondary)] rounded-lg"
          >
            <Trophy className="w-4 h-4" />
            Rankings
          </button>

          <button
            onClick={openClubModal}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--primary)] rounded-lg"
          >
            <Shield className="w-4 h-4" />
            Cambiar Club
          </button>
        </div>

        <HomeStats clubId={club.id} clubSlug={club.slug} imageMode="white" />
      </main>

      <Footer title={club.name} logo={club.logo} fanBase={club.fanBase} />
    </div>
  );
}
