import PlayerGame from "@/components/games/PlayerGame";

export const revalidate = 86400; // cache 24hs

const FUTMERENGUE_CLUB_ID = "686a78a8607a6a666f53a675";

export default function FutmerenguePlayerPage() {
  return <PlayerGame clubId={FUTMERENGUE_CLUB_ID} homeUrl="/futmerengue" />;
}
