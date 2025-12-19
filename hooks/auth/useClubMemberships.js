"use client";

import { useUserStore } from "@/stores/userStore";

export function useClubMemberships() {
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const memberships = user?.clubMembers ?? [];

  const syncUserCache = (newUser) => {
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const join = async (clubId, role) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/club-members/join`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, role }),
        credentials: "include",
      }
    );

    const data = await res.json();
    if (!res.ok) return { error: data.error };

    const newUser = {
      ...user,
      clubMembers: [...memberships, data.membership], // 👈 SE AGREGA BIEN
    };

    syncUserCache(newUser);
  };

  const leave = async (clubId, role) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/club-members/leave`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubId, role }),
        credentials: "include",
      }
    );

    const data = await res.json();
    if (!res.ok) return { error: data.error };

    const newUser = {
      ...user,
      clubMembers: memberships.filter(
        (m) => !(m.club.id === clubId && m.role === role) // 👈 FILTRA CORRECTAMENTE
      ),
    };

    syncUserCache(newUser);
  };

  return { memberships, join, leave };
}
