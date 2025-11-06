"use client";

import { useState } from "react";

const clubs = [
  {
    name: "San Lorenzo",
    id: "68429af7587b60bfbe49342b",
    logo: "https://tmssl.akamaized.net//images/wappen/head/15110.png?lm=1412762842",
  },
  {
    name: "Real Madrid",
    id: "686a78a8607a6a666f53a675",
    logo: "https://tmssl.akamaized.net//images/wappen/head/418.png?lm=1729684474",
  },
  // ← acá seguís agregando clubes reales cuando habilites todos
];

export default function ClubMemberSelector({ onSelect, exclude = [] }) {
  const [selectedClub, setSelectedClub] = useState(null);

  const filteredClubs = clubs.filter((club) => !exclude.includes(club.id));

  return (
    <div className="grid grid-cols-2 gap-3">
      {filteredClubs.length === 0 && (
        <p className="text-sm text-gray-400 col-span-2">
          Ya pertenecés a todos los clubes disponibles.
        </p>
      )}

      {filteredClubs.map((club) => (
        <button
          key={club.id}
          onClick={() => {
            setSelectedClub(club.id);
            onSelect(club);
          }}
          className={`
            flex items-center gap-3 p-2 rounded-lg transition
            ${
              selectedClub === club.id
                ? "bg-[var(--hover)]"
                : "bg-[var(--background)] hover:bg-[var(--hover)]"
            }
          `}
        >
          <img src={club.logo} className="w-10 h-10 rounded object-contain" />
          <span>{club.name}</span>
        </button>
      ))}
    </div>
  );
}
