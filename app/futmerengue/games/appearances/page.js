import AppearancesGame from "@/components/games/AppearancesGame";

export const dynamic = "force-dynamic";

const FUTMERENGUE_CLUB_ID = "686a78a8607a6a666f53a675";

export default function FutmerengueAppearancesPage() {
  return (
    <AppearancesGame clubId={FUTMERENGUE_CLUB_ID} homeUrl="/futmerengue" />
  );
}
