import { BASE_GAMES } from "./baseGames";
import { CLUB_GAMES } from "./clubs";

export function getClubGames(clubKey = null) {
  return CLUB_GAMES[clubKey] ?? BASE_GAMES;
}
