"use client";

export function PageHeader({
  title,
  icon: Icon,
  count,
  actionButton,
  isDarkMode,
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon
          size={24}
          style={{ color: isDarkMode ? "var(--azul)" : "var(--rojo)" }}
        />
        <h1
          className="text-2xl font-bold"
          style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
        >
          {title}
        </h1>
        <span
          className="px-2 py-1 rounded-full text-sm font-medium"
          style={{
            backgroundColor: isDarkMode
              ? "var(--azul-oscuro)"
              : "var(--gris-claro)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
          }}
        >
          {count}
        </span>
      </div>
      <button
        onClick={actionButton.onClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
        style={{
          backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
        }}
      >
        <actionButton.icon size={20} />
        <span>{actionButton.label}</span>
      </button>
    </div>
  );
}
