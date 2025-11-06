"use client";

import { useDarkMode } from "@/hooks/ui/use-dark-mode";

export function FormCard({ children }) {
  const isDarkMode = useDarkMode();

  return (
    <div
      className="p-6 rounded-xl transition-all"
      style={{
        backgroundColor: isDarkMode
          ? "var(--fondo-oscuro)"
          : "var(--gris-claro)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </div>
  );
}
