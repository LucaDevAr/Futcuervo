"use client";

import Link from "next/link";
import { CLUB_LIST } from "@/config/club";
import { useClubModal } from "@/components/club/ClubModalContext";

export default function ClubSelector() {
  const { closeClubModal } = useClubModal();
  const isSingle = CLUB_LIST.length === 1;

  return (
    <div className="w-full max-w-5xl mx-auto h-full flex items-center justify-center">
      <div
        className="
          grid gap-4 sm:gap-3 lg:gap-4
          grid-cols-[repeat(auto-fit,minmax(150px,1fr))]
        "
      >
        {CLUB_LIST.map((club) => (
          <Link
            key={club.slug}
            href={`/${club.slug}`}
            onClick={closeClubModal}
            className="
              flex flex-col items-center justify-center
              aspect-square rounded-xl
              bg-[var(--background)]
              border border-[var(--secondary)]
              shadow-md transition
              hover:scale-105 hover:shadow-xl
            "
          >
            <img
              src={club.shield}
              alt={club.name}
              className="max-w-full max-h-full object-contain p-4"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
