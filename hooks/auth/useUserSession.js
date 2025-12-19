// hooks/useUserSession.js  (opcional)
import { useEffect } from "react";
import { useUserStore } from "@/stores/userStore";
import { fetchUserSession } from "@/services/api";

export const useUserSession = (opts = { force: false }) => {
  const checked = useUserStore((s) => s.checked);
  const setUser = useUserStore((s) => s.setUser);
  const clearUser = useUserStore((s) => s.clearUser);

  useEffect(() => {
    if (!opts.force && checked) return;

    (async () => {
      try {
        const user = await fetchUserSession();
        if (user?.id) setUser(user);
        else clearUser();
      } catch {
        clearUser();
      }
    })();
  }, [checked, opts.force]);
};
