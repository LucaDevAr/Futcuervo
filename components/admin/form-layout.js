"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";

export function FormLayout({ title, onSubmit, submitButton, children }) {
  const router = useRouter();
  const isDarkMode = useDarkMode();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:scale-105 transition-transform"
            style={{
              backgroundColor: isDarkMode
                ? "var(--azul-oscuro)"
                : "var(--gris-claro)",
              color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-2xl font-bold"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-6">
        {children}

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">{submitButton}</div>
      </form>
    </div>
  );
}
