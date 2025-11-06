import GoalsGame from "@/components/games/GoalsGame";

export const dynamic = "force-dynamic";

const FUTMERENGUE_CLUB_ID = "686a78a8607a6a666f53a675";

export default function FutmerengueGoalsPage() {
  return <GoalsGame clubId={FUTMERENGUE_CLUB_ID} homeUrl="/futmerengue" />;
}
