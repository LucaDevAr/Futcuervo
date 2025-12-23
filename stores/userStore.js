import { create } from "zustand";

const DEBUG =
  typeof window !== "undefined" && process.env.NEXT_PUBLIC_DEBUG === "true";

export const useUserStore = create((set) => ({
  user: null,
  checked: false,
  hasAuthHint: false, // ✅ nuevo estado

  setHasAuthHint: (value) => set({ hasAuthHint: value }), // ✅ nueva función

  setUser: (u) => {
    if (DEBUG) console.log("%c[USER][setUser]", "color:#4ade80", u);

    const normalized = {
      ...u,
      points: u.points ?? 0,
      clubMembers: Array.isArray(u.clubMembers)
        ? u.clubMembers
        : Array.isArray(u.clubMemberships)
        ? u.clubMemberships
        : [],
    };

    set({ user: normalized, checked: true });
  },

  clearUser: () => {
    if (DEBUG) console.log("%c[USER][clearUser]", "color:#f87171");
    set({ user: null, checked: true });
  },

  resetCheck: () => set({ checked: false }),
}));
