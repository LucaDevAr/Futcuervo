import CareerGame from "@/components/games/CareerGame";

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function CareerGamePage() {
  return <CareerGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
