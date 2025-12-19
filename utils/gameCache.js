/**
 * Get a cached game from localStorage
 * @param {string} gameType - Type of game (shirt, player, career, video)
 * @param {string|null} clubId - Optional club ID to scope the game
 * @returns {object|null} Cached game or null if not found
 */
export function getGame(gameType, clubId = null) {
  try {
    const tried = [];
    const candidates = [
      // prefer the explicit per-game key
      `game-${clubId || "global"}-${gameType}`,
      // older/simpler keys your code has used
      `game-global-${gameType}`,
      // key that contains all games for a specific club (hecho por tu cache actual)
      `game-global-${clubId}`,
      // generic club key (fallback)
      `game-${clubId || "global"}`,
    ];

    for (const key of candidates) {
      tried.push(key);
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (err) {
        console.warn(`[v0] getGame: invalid JSON for key ${key}`, err);
        continue;
      }

      // 1) caso: el valor es directamente el game (tiene gameType o _id)
      if (
        parsed &&
        (parsed.gameType === gameType ||
          (parsed._id && (parsed.gameType || parsed.gameType === gameType)))
      ) {
        console.log(`[v0] getGame: matched direct game at key ${key}`);
        return parsed;
      }

      // 2) caso: el valor contiene lastGames: { shirt: {...}, player: {...} }
      if (parsed && parsed.lastGames && parsed.lastGames[gameType]) {
        console.log(
          `[v0] getGame: matched parsed.lastGames[${gameType}] at key ${key}`
        );
        return parsed.lastGames[gameType];
      }

      // 3) caso: el valor tiene la propiedad gameType como clave (parsed.shirt / parsed.player)
      if (parsed && parsed[gameType]) {
        console.log(`[v0] getGame: matched parsed.${gameType} at key ${key}`);
        return parsed[gameType];
      }

      // 4) buscar en los valores del objeto por si algún valor es el game
      if (parsed && typeof parsed === "object") {
        const found = Object.values(parsed).find(
          (v) => v && (v.gameType === gameType || v._id)
        );
        if (found) {
          console.log(
            `[v0] getGame: found game nested inside object at key ${key}`
          );
          return found;
        }
      }

      // nada en este key → seguir probando
    }

    console.log(`[v0] getGame: not found. Tried keys: ${tried.join(", ")}`);
    return null;
  } catch (error) {
    console.error("[v0] Error getting game from cache:", error);
    return null;
  }
}

/**
 * Save a game to localStorage
 * @param {string} gameType - Type of game (shirt, player, career, video)
 * @param {object} game - Game object to cache
 * @param {string|null} clubId - Optional club ID to scope the game
 */
export function saveGame(gameType, game, clubId = null) {
  try {
    const key = `game-${clubId || "global"}-${gameType}`;
    localStorage.setItem(key, JSON.stringify(game));
    console.log(`[v0] saveGame: Saved ${gameType} to localStorage ✅`);
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
    const prefix = `game-${clubId || "global"}-`;
    const games = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const gameType = key.replace(prefix, "");
        const cached = localStorage.getItem(key);
        if (cached) {
          games[gameType] = JSON.parse(cached);
        }
      }
    }

    return games;
  } catch (error) {
    console.error("[v0] Error getting club games:", error);
    return {};
  }
}

/**
 * Clear all games for a club (called on new day)
 * @param {string|null} clubId - Club ID
 */
export function clearClubGames(clubId = null) {
  try {
    const prefix = `game-${clubId || "global"}-`;
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => localStorage.removeItem(key));
    console.log(`[v0] clearClubGames: Cleared ${keysToRemove.length} games 🗑️`);
  } catch (error) {
    console.error("[v0] Error clearing club games:", error);
  }
}
