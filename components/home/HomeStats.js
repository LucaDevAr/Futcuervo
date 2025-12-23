"use client";
import { GameGrid } from "../games/GameGrid";
import useUnifiedGameStats from "@/hooks/game-state/useUnifiedGameStats";

export function HomeStats({ imageMode, clubId, clubSlug }) {
  const { source, lastAttempts, totalGames } = useUnifiedGameStats(clubId);

  // decisión única y clara
  const stats = source === "server" && totalGames === 0 ? null : lastAttempts;

  return (
    <div className="flex-1 flex items-center justify-center min-h-0">
      <div className="w-full max-w-6xl px-4">
        <GameGrid
          imageMode={imageMode}
          clubId={clubId}
          clubSlug={clubSlug}
          stats={stats}
        />
      </div>
    </div>
  );
}
