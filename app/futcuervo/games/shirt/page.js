import ShirtGame from "@/components/games/ShirtGame";

export const dynamic = "force-dynamic";

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function FutCuervoShirtGamePage() {
  return <ShirtGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
