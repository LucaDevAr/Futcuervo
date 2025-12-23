import { notFound } from "next/navigation";
import { CLUBS, getClubBySlug } from "@/config/club";
import { ClubHome } from "@/components/home/ClubHome";

export const dynamic = "force-static";

export function generateStaticParams() {
  return Object.keys(CLUBS).map((slug) => ({ slug }));
}

export default function ClubPage({ params }) {
  const club = getClubBySlug(params.slug);

  if (!club) notFound();

  return <ClubHome club={club} />;
}
