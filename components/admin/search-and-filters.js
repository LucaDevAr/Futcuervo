"use client";

import { Search, Filter, X } from "lucide-react";

export function SearchAndFilters({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  onClearFilters,
  isDarkMode,
  filterChildren,
}) {
  return (
    <div
      className="p-6 rounded-xl"
      style={{
        backgroundColor: isDarkMode
          ? "var(--fondo-oscuro)"
          : "var(--gris-claro)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="space-y-4">
        {/* Barra de búsqueda */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2"
              style={{
                color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
              }}
            />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
            {searchTerm && (
              <button
                onClick={() => onSearchChange("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200"
              >
                <X
                  size={16}
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                />
              </button>
            )}
          </div>
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200"
            style={{
              backgroundColor: showFilters
                ? isDarkMode
                  ? "var(--azul)"
                  : "var(--rojo)"
                : isDarkMode
                ? "var(--fondo-oscuro)"
                : "var(--blanco)",
              color: showFilters
                ? "var(--blanco)"
                : isDarkMode
                ? "var(--blanco)"
                : "var(--negro)",
              borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            }}
          >
            <Filter size={20} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span
                className="ml-1 px-2 py-1 rounded-full text-xs"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Filtros expandibles */}
        {showFilters && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t"
            style={{
              borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            }}
          >
            {filterChildren}
            <div className="flex items-end">
              <button
                onClick={onClearFilters}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 hover:opacity-80"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
