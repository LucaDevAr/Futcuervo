import VideoGame from "@/components/games/VideoGame";

const FUTCUERVO_CLUB_ID = "68429af7587b60bfbe49342b";

export default function VideoGamePage() {
  return <VideoGame clubId={FUTCUERVO_CLUB_ID} homeUrl="/futcuervo" />;
}
