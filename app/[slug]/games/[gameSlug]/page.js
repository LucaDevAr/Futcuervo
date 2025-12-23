import { notFound } from "next/navigation";
import { getClubBySlug, CLUBS } from "@/config/club";
import ShirtGame from "@/components/games/ShirtGame";
import CareerGame from "@/components/games/CareerGame";
import NationalTeamGame from "@/components/games/NationalTeamGame";
import LeagueTeamGame from "@/components/games/LeagueTeamGame";
import PlayerGame from "@/components/games/PlayerGame";
import AppearancesGame from "@/components/games/AppearancesGame";
import GoalsGame from "@/components/games/GoalsGame";

export const dynamic = "force-static";
export const revalidate = 86400;

const GAME_COMPONENTS = {
  national: NationalTeamGame,
  league: LeagueTeamGame,
  shirt: ShirtGame,
  player: PlayerGame,
  career: CareerGame,
  appearances: AppearancesGame,
  goals: GoalsGame,
};

export function generateStaticParams() {
  return Object.keys(CLUBS).flatMap((slug) =>
    Object.keys(GAME_COMPONENTS).map((gameSlug) => ({
      slug,
      gameSlug,
    }))
  );
}

export default function GamePage({ params }) {
  const club = getClubBySlug(params.slug);
  if (!club) return notFound();

  const GameComponent = GAME_COMPONENTS[params.gameSlug];
  if (!GameComponent) return notFound();

  return <GameComponent clubId={club.id} homeUrl={`/${club.slug}`} />;
}
