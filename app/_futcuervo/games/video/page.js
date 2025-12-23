import VideoGame from "@/components/games/VideoGame";

export const dynamic = "force-dynamic";

export default function FutcuervoVideoPage() {
  return <VideoGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
