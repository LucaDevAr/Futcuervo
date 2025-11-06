import AppearancesGame from "@/components/games/AppearancesGame";

export const dynamic = "force-dynamic";

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function FutcuervoAppearancesPage() {
  return <AppearancesGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
