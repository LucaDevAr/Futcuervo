/**
 * Calculates milliseconds until midnight (local time)
 * This ensures cache expires at day change, not 24h from cache time
 */
export const getMillisecondsUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0); // Next midnight

  return midnight.getTime() - now.getTime();
};

/**
 * Get current date in YYYY-MM-DD format
 */
export const getYYYYMMDD = (date = new Date()) => {
  return date.toISOString().slice(0, 10);
};

/**
 * Check if cached data is from today
 */
export const isCachedToday = (cachedDate) => {
  return cachedDate === getYYYYMMDD();
};
