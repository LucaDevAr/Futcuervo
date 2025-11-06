"use client";

import { Save, X, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";

export function FormButtons({ isLoading, submitText, loadingText }) {
  const router = useRouter();
  const isDarkMode = useDarkMode();

  return (
    <>
      <button
        type="button"
        onClick={() => router.back()}
        className="px-4 py-2 rounded-lg flex items-center gap-2 hover:scale-105 transition-all"
        style={{
          backgroundColor: isDarkMode
            ? "var(--fondo-oscuro)"
            : "var(--gris-claro)",
          color: isDarkMode ? "var(--blanco)" : "var(--negro)",
        }}
      >
        <X size={18} />
        <span>Cancelar</span>
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 rounded-lg flex items-center gap-2 text-white hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
        }}
      >
        {isLoading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Save size={18} />
        )}
        <span>{isLoading ? loadingText : submitText}</span>
      </button>
    </>
  );
}
