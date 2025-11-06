import ShirtGame from "@/components/games/ShirtGame";

export const dynamic = "force-dynamic";

const FUTMERENGUE_CLUB_ID = "686a78a8607a6a666f53a675";

export default function FutMerengueShirtGamePage() {
  return <ShirtGame clubId={FUTMERENGUE_CLUB_ID} homeUrl="/futmerengue" />;
}
