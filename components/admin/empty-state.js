"use client";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionButton,
  isDarkMode,
}) {
  return (
    <div
      className="p-12 rounded-xl text-center"
      style={{
        backgroundColor: isDarkMode
          ? "var(--fondo-oscuro)"
          : "var(--gris-claro)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Icon
        size={48}
        className="mx-auto mb-4"
        style={{ color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)" }}
      />
      <h3
        className="text-lg font-medium mb-2"
        style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
      >
        {title}
      </h3>
      <p
        className="mb-4"
        style={{ color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)" }}
      >
        {description}
      </p>
      {actionButton && (
        <button
          onClick={actionButton.onClick}
          className="px-6 py-2 rounded-lg font-medium text-white transition-all duration-200 hover:opacity-90"
          style={{
            backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          {actionButton.label}
        </button>
      )}
    </div>
  );
}
