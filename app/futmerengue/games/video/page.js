import VideoGame from "@/components/games/VideoGame";

const FUTMERENGUE_CLUB_ID = "686a78a8607a6a666f53a675";

export default function VideoGamePage() {
  return <VideoGame clubId={FUTMERENGUE_CLUB_ID} homeUrl="/futmerengue" />;
}
