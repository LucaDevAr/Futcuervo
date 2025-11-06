"use client";

import { Eye, Edit, Trash2 } from "lucide-react";

export function ActionButtons({ onView, onEdit, onDelete, isDarkMode }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onView}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:opacity-80"
        style={{
          backgroundColor: isDarkMode ? "var(--fondo-oscuro)" : "var(--blanco)",
          color: isDarkMode ? "var(--blanco)" : "var(--negro)",
          borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
        }}
      >
        <Eye size={16} />
        <span className="text-sm">Ver</span>
      </button>
      <button
        onClick={onEdit}
        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-80 text-white"
        style={{
          backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
        }}
      >
        <Edit size={16} />
        <span className="text-sm">Editar</span>
      </button>
      <button
        onClick={onDelete}
        className="px-3 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
        style={{
          backgroundColor: isDarkMode
            ? "var(--rojo-oscuro)"
            : "var(--rojo-claro)",
          color: isDarkMode ? "var(--blanco)" : "var(--rojo)",
        }}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
