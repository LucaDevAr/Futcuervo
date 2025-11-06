"use client";

import { Label } from "@/components/ui/label";
import { Plus, Building2 } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { filterAndSortClubsByLeague } from "@/lib/sorting-utils";

export function ClubSelectorWithLogos({
  clubs,
  selectedLeague,
  value,
  onChange,
  onCreateNew,
  isDarkMode,
  label = "Club",
  disabled = false,
}) {
  // Filtrar y ordenar clubes: San Lorenzo primero si es Argentina, resto alfabético
  const filteredClubs = selectedLeague
    ? filterAndSortClubsByLeague(clubs, selectedLeague)
    : [];

  const options = filteredClubs.map((club) => ({
    value: club._id,
    label: club.name,
    image: club.logo,
    subtitle: `${club.league.name} - ${club.league.country}`,
  }));

  return (
    <div className="space-y-2">
      <Label style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}>
        <div className="flex items-center gap-2">
          <Building2 size={16} />
          {label}
        </div>
      </Label>

      <div className="flex gap-2">
        <div className="flex-1">
          <SearchableCustomSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={
              !selectedLeague
                ? "Primero selecciona una liga"
                : "Seleccionar club"
            }
            searchPlaceholder="Buscar club..."
            enableSearch={true}
            disabled={disabled || !selectedLeague}
          />
        </div>

        <button
          type="button"
          onClick={onCreateNew}
          disabled={disabled}
          className="p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
          style={{
            backgroundColor: isDarkMode
              ? "var(--azul-oscuro)"
              : "var(--gris-claro)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
          }}
          title="Crear nuevo club"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Mensajes de estado */}
      {!selectedLeague && (
        <div
          className="text-sm p-2 rounded-md text-center"
          style={{
            backgroundColor: isDarkMode
              ? "var(--rojo-oscuro)"
              : "var(--rojo-claro)",
            color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
          }}
        >
          Selecciona una liga primero
        </div>
      )}

      {selectedLeague && filteredClubs.length === 0 && (
        <div
          className="text-sm p-2 rounded-md text-center"
          style={{
            backgroundColor: isDarkMode
              ? "var(--rojo-oscuro)"
              : "var(--rojo-claro)",
            color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
          }}
        >
          No hay clubes en esta liga. ¡Crea uno nuevo!
        </div>
      )}
    </div>
  );
}
