import PlayerGame from "@/components/games/PlayerGame";

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function PlayerGamePage() {
  return <PlayerGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
