import LeagueTeamGame from "@/components/games/LeagueTeamGame";

export const dynamic = "force-dynamic";

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function FutcuervoLeagueTeamPage() {
  return <LeagueTeamGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
