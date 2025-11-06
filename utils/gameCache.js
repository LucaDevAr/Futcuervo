import { useDailyGamesStore } from "@/stores/dailyGamesStore";

/**
 * Get a cached game from the daily games store
 * @param {string} gameType - Type of game (shirt, player, career, video)
 * @param {string|null} clubId - Optional club ID to scope the game
 * @returns {object|null} Cached game or null if not found
 */
export function getGame(gameType, clubId = null) {
  try {
    const store = useDailyGamesStore.getState();
    const key = clubId || "null";
    const game = store.clubs?.[key]?.lastGames?.[gameType];
    return game || null;
  } catch (error) {
    console.error("[v0] Error getting game from cache:", error);
    return null;
  }
}

/**
 * Save a game to the daily games store
 * @param {string} gameType - Type of game (shirt, player, career, video)
 * @param {object} game - Game object to cache
 * @param {string|null} clubId - Optional club ID to scope the game
 */
export function saveGame(gameType, game, clubId = null) {
  try {
    const store = useDailyGamesStore.getState();
    const key = clubId || "null";

    if (!store.clubs[key]) {
      store.clubs[key] = {
        lastGames: {},
        lastUpdated: new Date().toISOString(),
      };
    }

    store.clubs[key].lastGames[gameType] = game;
  } catch (error) {
    console.error("[v0] Error saving game to cache:", error);
  }
}

/**
 * Get all cached games for a club
 * @param {string|null} clubId - Club ID
 * @returns {object} All cached games for the club
 */
export function getClubGames(clubId = null) {
  try {
    const store = useDailyGamesStore.getState();
    const key = clubId || "null";
    return store.clubs?.[key]?.lastGames || {};
  } catch (error) {
    console.error("[v0] Error getting club games:", error);
    return {};
  }
}
