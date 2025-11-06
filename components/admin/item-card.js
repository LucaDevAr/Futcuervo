"use client";

export function ItemCard({ children, isDarkMode }) {
  return (
    <div
      className="p-6 rounded-xl transition-all duration-200 hover:shadow-lg"
      style={{
        backgroundColor: isDarkMode
          ? "var(--fondo-oscuro)"
          : "var(--gris-claro)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: `1px solid ${
          isDarkMode ? "var(--azul-oscuro)" : "var(--gris)"
        }`,
      }}
    >
      {children}
    </div>
  );
}
