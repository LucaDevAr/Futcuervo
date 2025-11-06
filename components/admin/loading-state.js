"use client";

export function LoadingState({ title, isDarkMode }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold"
          style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
        >
          {title}
        </h1>
      </div>
      <div className="flex items-center justify-center py-12">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)" }}
        />
      </div>
    </div>
  );
}
