"use client";

import { useLocalGameAttemptsStore } from "@/stores/localGameAttemptsStore";
import { useUserStore } from "@/stores/userStore";

export const useLocalGameAttempts = (clubId) => {
  const user = useUserStore((state) => state.user);
  const store = useLocalGameAttemptsStore();

  // Si hay sesión, no usar el store local
  if (user) {
    return null;
  }

  return {
    getLastAttempt: (gameType) => store.getLocalLastAttempt(clubId, gameType),
    wasPlayedToday: (gameType) => store.wasPlayedToday(clubId, gameType),
    getCurrentStreak: (gameType) => store.getCurrentStreak(clubId, gameType),
    getBestScore: (gameType) => store.getBestScore(clubId, gameType),
    updateAttempt: (gameType, attemptData) =>
      store.updateLocalAttempt(clubId, gameType, attemptData),
    getClubData: () => store.getLocalClubData(clubId),
  };
};
