/**
 * Define qué juegos necesitan precargar todos los jugadores y clubes
 * Estos juegos generan sus preguntas de forma aleatoria con toda la data disponible
 */

export const GAMES_REQUIRING_FULL_DATA = [
  "national-team",
  "league-team",
  "goals",
  "appearances",
];

/**
 * Verifica si un juego necesita precarga de data
 */
export function requiresDataPreload(gameSlug) {
  return GAMES_REQUIRING_FULL_DATA.includes(gameSlug);
}
