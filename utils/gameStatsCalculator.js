import { isYesterday } from "./dateHelpers";

export const calculateGameStats = ({
  currentResult,
  lastAttempt,
  gameType,
}) => {
  const gameConfig = getGameConfig(gameType);
  const useStreak = gameConfig?.useStreak ?? true;

  let streak = 0;
  let recordScore = currentResult.score || 0;

  if (useStreak) {
    // Calcular racha
    if (currentResult.won) {
      if (
        lastAttempt &&
        isYesterday(lastAttempt.date || lastAttempt.createdAt)
      ) {
        // Jugó ayer y ganó hoy, continuar racha
        streak = (lastAttempt.streak || 0) + 1;
      } else {
        // No jugó ayer o perdió, nueva racha
        streak = 1;
      }
    } else {
      // Perdió, racha se resetea
      streak = 0;
    }

    // Mantener el record score anterior si existe
    recordScore = Math.max(
      currentResult.score || 0,
      lastAttempt?.recordScore || 0
    );
  } else {
    // Usar record score
    streak = lastAttempt?.streak || 0; // Mantener racha anterior
    recordScore = Math.max(
      currentResult.score || 0,
      lastAttempt?.recordScore || 0
    );
  }

  return { streak, recordScore };
};

// Configuración de cada juego
const getGameConfig = (gameType) => {
  const configs = {
    shirt: { useStreak: true },
    player: { useStreak: true },
    league: { useStreak: true },
    national: { useStreak: true },
    history: { useStreak: true },
    career: { useStreak: true },
    video: { useStreak: true },
    song: { useStreak: true },
    goals: { useStreak: false }, // Usa record score
    appearances: { useStreak: false }, // Usa record score
  };

  return configs[gameType] || { useStreak: true };
};
