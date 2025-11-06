"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Globe } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { useAdminPage } from "@/hooks/admin/use-admin-page";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { ItemCard } from "@/components/admin/item-card";
import { ActionButtons } from "@/components/admin/action-buttons";

export default function LeaguesPage() {
  const router = useRouter();
  const isDarkMode = useDarkMode();

  // Estados de filtros
  const [countryFilter, setCountryFilter] = useState("");

  // Filtros personalizados
  const customFilters = [
    (league) => !countryFilter || league.country === countryFilter,
  ];

  // Hook personalizado para la lógica común
  const {
    items: leagues,
    filteredItems: filteredLeagues,
    loading,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    handleDelete,
  } = useAdminPage({
    apiEndpoint: "/api/admin/leagues",
    itemName: "Liga",
    itemNamePlural: "ligas",
    searchFields: ["name", "country"],
    customFilters,
  });

  // Obtener datos únicos para filtros
  const uniqueCountries = Array.from(
    new Set(leagues.map((league) => league.country))
  ).sort();

  // Opciones para selectores
  const countryOptions = uniqueCountries.map((country) => ({
    value: country,
    label: country,
  }));

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setCountryFilter("");
    setShowFilters(false);
  };

  // Contar filtros activos
  const activeFiltersCount = [countryFilter].filter(Boolean).length;

  return (
    <AdminPageLayout
      title="Ligas"
      icon={Globe}
      count={filteredLeagues.length}
      actionButton={{
        label: "Nueva Liga",
        onClick: () => router.push("/admin/leagues/create"),
        icon: Plus,
      }}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar ligas por nombre o país (sin acentos)..."
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
      loading={loading}
      isEmpty={filteredLeagues.length === 0}
      emptyStateProps={{
        title:
          leagues.length === 0
            ? "No hay ligas registradas"
            : "No se encontraron ligas",
        description:
          leagues.length === 0
            ? "Comienza agregando la primera liga al sistema"
            : "Intenta ajustar los filtros de búsqueda",
        actionButton:
          leagues.length === 0
            ? {
                label: "Crear Primera Liga",
                onClick: () => router.push("/admin/leagues/create"),
              }
            : undefined,
      }}
      isDarkMode={isDarkMode}
      filterChildren={
        <div className="space-y-2">
          <label
            className="block text-sm font-medium"
            style={{
              color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            }}
          >
            País
          </label>
          <SearchableCustomSelect
            options={[
              { value: "", label: "Todos los países" },
              ...countryOptions,
            ]}
            value={countryFilter}
            onChange={setCountryFilter}
            placeholder="Seleccionar país"
            searchPlaceholder="Buscar país..."
            enableSearch={true}
          />
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeagues.map((league) => (
          <ItemCard key={league._id} isDarkMode={isDarkMode}>
            {/* Header de la liga */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--azul-oscuro)"
                      : "var(--gris-claro)",
                  }}
                >
                  {league.logoUrl ? (
                    <img
                      src={league.logoUrl || "/placeholder.svg"}
                      alt={`${league.name} - Logo`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Globe
                      size={24}
                      style={{
                        color: isDarkMode
                          ? "var(--gris)"
                          : "var(--gris-oscuro)",
                      }}
                    />
                  )}
                </div>
                <div>
                  <h3
                    className="font-semibold text-lg"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {league.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    {league.country}
                  </p>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span
                  className="text-sm"
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  Creada:
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  {new Date(league.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>

            <ActionButtons
              onView={() => router.push(`/admin/leagues/${league._id}`)}
              onEdit={() => router.push(`/admin/leagues/${league._id}/edit`)}
              onDelete={() => handleDelete(league._id, league.name)}
              isDarkMode={isDarkMode}
            />
          </ItemCard>
        ))}
      </div>
    </AdminPageLayout>
  );
}
