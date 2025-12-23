import { notFound } from "next/navigation";
import ShirtGame from "@/components/games/ShirtGame";

export const dynamic = "force-static";
export const revalidate = 86400;

// 🔌 Mismos juegos que soporta el home global
const GAME_COMPONENTS = {
  shirt: ShirtGame,
  // luego:
  // national: NationalGame,
  // career: CareerGame,
};

export function generateStaticParams() {
  return Object.keys(GAME_COMPONENTS).map((gameSlug) => ({
    gameSlug,
  }));
}

export default function GamePage({ params }) {
  const GameComponent = GAME_COMPONENTS[params.gameSlug];

  if (!GameComponent) return notFound();

  return <GameComponent clubId={null} homeUrl="/" />;
}
