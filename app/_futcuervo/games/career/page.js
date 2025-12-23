import CareerGame from "@/components/games/CareerGame";

export const revalidate = 86400; // cache 24hs

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function FutcuervoCareerPage() {
  return <CareerGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
