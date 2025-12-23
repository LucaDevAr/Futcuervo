"use client";

import { useClubGames } from "@/hooks/games";
import { GameCard } from "./GameCard";
import { useRouter } from "next/navigation";

export function GameGrid({ imageMode, clubId, clubSlug, stats }) {
  const router = useRouter();
  const items = useClubGames(clubId);

  const handleGameClick = (item) => {
    if (!item?.gameType) return;

    const base = clubSlug ? `/${clubSlug}` : "";
    router.push(`${base}/games/${item.gameType}`);
  };

  return (
    <div
      className={`grid ${
        items.length >= 9
          ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
          : items.length >= 7
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          : items.length >= 5
          ? "grid-cols-2 lg:grid-cols-3"
          : "grid-cols-2"
      } gap-4 justify-center`}
    >
      {items.map((item, index) => (
        <GameCard
          key={item.gameType}
          item={item}
          stats={stats?.[item.gameType]}
          index={index}
          onClick={handleGameClick}
          imageMode={imageMode}
          clubId={clubId}
        />
      ))}
    </div>
  );
}
