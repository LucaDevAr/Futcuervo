import PlayerGame from "@/components/games/PlayerGame";

const FUTMERENGUE_CLUB_ID = "686a78a8607a6a666f53a675";

export default function PlayerGamePage() {
  return <PlayerGame clubId={FUTMERENGUE_CLUB_ID} homeUrl="/futmerengue" />;
}
