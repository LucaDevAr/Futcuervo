import NationalTeamGame from "@/components/games/NationalTeamGame";

export const dynamic = "force-dynamic";

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function FutcuervoNationalTeamPage() {
  return <NationalTeamGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
