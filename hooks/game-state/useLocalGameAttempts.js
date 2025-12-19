"use client";

import { useMemo } from "react";
import { debugLog } from "@/utils/debugLogger";
import { useLocalGameAttemptsStore } from "@/stores/localGameAttemptsStore";
import { useUserStore } from "@/stores/userStore";

export const useLocalGameAttempts = (clubId) => {
  const user = useUserStore((s) => s.user);
  const store = useLocalGameAttemptsStore();

  return useMemo(() => {
    if (user) {
      // debugLog.hookLifecycle("useLocalGameAttempts", "mode_disabled", {
      //   reason: "user_logged_in",
      //   clubId: clubId || "global",
      // });
      return {
        getLastAttempt: () => null,
        wasPlayedToday: () => false,
        getCurrentStreak: () => 0,
        getBestScore: () => 0,
        updateAttempt: () => {},
        getClubData: () => null,
        isDisabled: true,
      };
    }

    // debugLog.hookLifecycle("useLocalGameAttempts", "mode_enabled", {
    //   reason: "no_user_session",
    //   clubId: clubId || "global",
    // });

    return {
      getLastAttempt: (gameType) => {
        const result = store.getLocalLastAttempt(clubId, gameType);
        // debugLog.cacheHit(
        //   "localGameAttempt",
        //   `${gameType}_${clubId || "global"}`
        // );
        return result;
      },

      wasPlayedToday: (gameType) => store.wasPlayedToday(clubId, gameType),

      getCurrentStreak: (gameType) => store.getCurrentStreak(clubId, gameType),

      getBestScore: (gameType) => store.getBestScore(clubId, gameType),

      updateAttempt: (gameType, attemptData) => {
        // debugLog.storeUpdate("localGameAttempts", {
        //   gameType,
        //   clubId: clubId || "global",
        //   action: "updateAttempt",
        // });
        return store.updateLocalAttempt(clubId, gameType, attemptData);
      },

      getClubData: () => store.getLocalClubData(clubId),

      isDisabled: false,
    };
  }, [user, store, clubId]);
};
