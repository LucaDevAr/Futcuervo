"use client";

import { useState } from "react";
import { LeagueSelectorWithLogos } from "./league-selector-with-logos";
import { ClubSelectorWithLogos } from "./club-selector-with-logos";

export function EnhancedCareerClubSelector({
  clubs,
  leagues,
  selectedClub,
  selectedLeague: externalSelectedLeague,
  onClubChange,
  onLeagueChange,
  onCreateClub,
  isDarkMode,
}) {
  const [internalSelectedLeague, setInternalSelectedLeague] = useState("");

  // Usar la liga externa si se proporciona, sino usar la interna
  const selectedLeague = externalSelectedLeague ?? internalSelectedLeague;

  const handleLeagueChange = (leagueId) => {
    if (onLeagueChange) {
      onLeagueChange(leagueId);
    } else {
      setInternalSelectedLeague(leagueId);
    }

    // Limpiar selección de club cuando cambia la liga
    onClubChange("");
  };

  const handleClubChange = (clubId) => {
    onClubChange(clubId);

    // Si no hay liga externa, actualizar la liga interna basada en el club seleccionado
    if (!externalSelectedLeague && clubId) {
      const club = clubs.find((c) => c._id === clubId);
      if (club) {
        setInternalSelectedLeague(club.league._id);
      }
    }
  };

  const handleCreateClub = () => {
    onCreateClub();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <LeagueSelectorWithLogos
        leagues={leagues}
        value={selectedLeague}
        onChange={handleLeagueChange}
        isDarkMode={isDarkMode}
        label="Liga"
        placeholder="Selecciona la liga"
      />

      <ClubSelectorWithLogos
        clubs={clubs}
        selectedLeague={selectedLeague}
        value={selectedClub}
        onChange={handleClubChange}
        onCreateNew={handleCreateClub}
        isDarkMode={isDarkMode}
        label="Club"
      />
    </div>
  );
}
