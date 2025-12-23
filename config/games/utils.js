// src/config/games/utils.ts
export function buildGamePath(clubSlug, gameSlug) {
  return `/${clubSlug ?? "general"}/${gameSlug}`;
}
