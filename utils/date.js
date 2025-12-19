// utils/date.js

/**
 * Devuelve un string YYYY-MM-DD basado en la fecha local del usuario.
 * (Nunca uses toISOString para comparar días)
 */
export function getLocalDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Determina si un attempt se jugó hoy según la fecha local.
 */
export function wasPlayedToday(attemptDate) {
  if (!attemptDate) return false;

  const attempt = new Date(attemptDate);
  const attemptString = getLocalDateString(attempt);
  const todayString = getLocalDateString(new Date());

  return attemptString === todayString;
}

/**
 * Calcula el streak correctamente basado en intentos anteriores.
 * lastAttempts = { [gameId]: { lastPlayed: "...", streak: number } }
 */
export function calculateStreak(lastPlayedDate, previousStreak) {
  if (!lastPlayedDate) return 1;

  const lastPlayed = new Date(lastPlayedDate);
  const today = new Date();

  const lastString = getLocalDateString(lastPlayed);
  const todayString = getLocalDateString(today);

  // Si ya jugó hoy → se mantiene el streak
  if (lastString === todayString) return previousStreak;

  // Si jugó ayer → streak + 1
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const yesterdayString = getLocalDateString(yesterday);

  if (lastString === yesterdayString) return previousStreak + 1;

  // Si jugó hace más tiempo → streak vuelve a 1
  return 1;
}
