"use client";
import { useState, useEffect } from "react";

export function useClubMemberships() {
  const [memberships, setMemberships] = useState([]);

  const load = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/club-members/mine`,
      {
        credentials: "include",
      }
    );
    setMemberships(await res.json());
  };

  const join = async (clubId, role) => {
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/club-members/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clubId, role }),
      credentials: "include",
    });
    await load();
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

    if (!res.ok) {
      return { error: data.error };
    }

    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return { memberships, join, leave };
}
