export function sortLeagues(leagues) {
  if (!leagues || !Array.isArray(leagues)) {
    return [];
  }
  return [...leagues].sort((a, b) => {
    // Argentina siempre primero
    if (a.country.toLowerCase() === "argentina") return -1;
    if (b.country.toLowerCase() === "argentina") return 1;

    // Resto alfabético por nombre de liga
    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });
}

export function sortClubs(clubs) {
  if (!clubs || !Array.isArray(clubs)) {
    return [];
  }
  return [...clubs].sort((a, b) => {
    const isArgentinaA = a.league.country.toLowerCase() === "argentina";
    const isArgentinaB = b.league.country.toLowerCase() === "argentina";

    // Si ambos son de Argentina
    if (isArgentinaA && isArgentinaB) {
      // San Lorenzo siempre primero
      if (a.name.toLowerCase().includes("san lorenzo")) return -1;
      if (b.name.toLowerCase().includes("san lorenzo")) return 1;

      // Resto alfabético
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    }

    // Argentina primero, resto después
    if (isArgentinaA && !isArgentinaB) return -1;
    if (!isArgentinaA && isArgentinaB) return 1;

    // Si ninguno es de Argentina, orden alfabético
    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });
}

export function filterAndSortClubsByLeague(clubs, leagueId) {
  if (!clubs || !Array.isArray(clubs)) {
    return [];
  }
  const filtered = clubs.filter((club) => club.league?._id === leagueId);
  return sortClubs(filtered);
}
