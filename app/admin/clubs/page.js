"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus, Building2, Globe } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { useAdminPage } from "@/hooks/admin/use-admin-page";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { ItemCard } from "@/components/admin/item-card";
import { ActionButtons } from "@/components/admin/action-buttons";

export default function ClubsPage() {
  const router = useRouter();
  const isDarkMode = useDarkMode();

  // Estados adicionales para datos relacionados
  const [leagues, setLeagues] = useState([]);

  // Estados de filtros
  const [leagueFilter, setLeagueFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  // Filtros personalizados memoizados
  const customFilters = useMemo(
    () => [
      (club) => !leagueFilter || club.league._id === leagueFilter,
      (club) => !countryFilter || club.league.country === countryFilter,
    ],
    [leagueFilter, countryFilter]
  );

  // Hook personalizado para la lógica común
  const {
    items: clubs,
    filteredItems: filteredClubs,
    loading,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    handleDelete,
  } = useAdminPage({
    apiEndpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs`,
    itemName: "Club",
    itemNamePlural: "clubes",
    searchFields: ["name"],
    customFilters,
  });

  // Cargar datos relacionados
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const leaguesRes = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/leagues`,
          {
            credentials: "include",
          }
        );
        if (leaguesRes.ok) {
          const leaguesData = await leaguesRes.json();
          setLeagues(leaguesData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchRelatedData();
  }, []);

  // Obtener datos únicos para filtros
  const uniqueCountries = useMemo(
    () => Array.from(new Set(clubs.map((club) => club.league?.country))).sort(),
    [clubs]
  );

  const uniqueLeagues = useMemo(
    () =>
      Array.from(new Set(clubs.map((club) => club.league?._id)))
        .map((leagueId) => {
          const club = clubs.find((c) => c.league?._id === leagueId);
          return club?.league;
        })
        .filter(Boolean),
    [clubs]
  );

  // Opciones para selectores
  const countryOptions = useMemo(
    () =>
      uniqueCountries.map((country) => ({
        value: country,
        label: country,
      })),
    [uniqueCountries]
  );

  const leagueOptions = useMemo(
    () =>
      uniqueLeagues
        .sort((a, b) => {
          if (a.country.toLowerCase() === "argentina") return -1;
          if (b.country.toLowerCase() === "argentina") return 1;
          return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
        })
        .map((league) => ({
          value: league._id,
          label: league.name,
          image: league.logoUrl,
          subtitle: league.country,
        })),
    [uniqueLeagues]
  );

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setLeagueFilter("");
    setCountryFilter("");
    setShowFilters(false);
  }, [setSearchTerm, setShowFilters]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(
    () => [leagueFilter, countryFilter].filter(Boolean).length,
    [leagueFilter, countryFilter]
  );

  return (
    <AdminPageLayout
      title="Clubes"
      icon={Building2}
      count={filteredClubs.length}
      actionButton={{
        label: "Nuevo Club",
        onClick: () => router.push("/admin/clubs/create"),
        icon: Plus,
      }}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar clubes (sin acentos)..."
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
      loading={loading}
      isEmpty={filteredClubs.length === 0}
      emptyStateProps={{
        title:
          clubs.length === 0
            ? "No hay clubes registrados"
            : "No se encontraron clubes",
        description:
          clubs.length === 0
            ? "Comienza agregando el primer club al sistema"
            : "Intenta ajustar los filtros de búsqueda",
        actionButton:
          clubs.length === 0
            ? {
                label: "Crear Primer Club",
                onClick: () => router.push("/admin/clubs/create"),
              }
            : undefined,
      }}
      isDarkMode={isDarkMode}
      filterChildren={
        <>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium flex items-center gap-1"
              style={{
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            >
              <Globe size={14} />
              Liga
            </label>
            <SearchableCustomSelect
              options={[
                { value: "", label: "Todas las ligas" },
                ...leagueOptions,
              ]}
              value={leagueFilter}
              onChange={setLeagueFilter}
              placeholder="Seleccionar liga"
              searchPlaceholder="Buscar liga..."
              enableSearch={true}
            />
          </div>

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
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClubs.map((club) => (
          <ItemCard key={club._id} isDarkMode={isDarkMode}>
            {/* Header del club */}
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
                  {club.logo ? (
                    <img
                      src={club.logo || "/placeholder.svg"}
                      alt={`${club.name} - Logo`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <Building2
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
                    {club.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    {club.league?.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la liga */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Globe
                  size={14}
                  style={{
                    color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  Liga:
                </span>
              </div>
              <div
                className="flex items-center gap-2 px-3 py-2 rounded"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--azul-oscuro)"
                    : "var(--gris-claro)",
                }}
              >
                {club.league?.logoUrl && (
                  <img
                    src={club.league?.logoUrl || "/placeholder.svg"}
                    alt={club.league?.name}
                    className="w-5 h-5 object-contain"
                  />
                )}
                <div>
                  <div
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {club.league?.name}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    {club.league?.country}
                  </div>
                </div>
              </div>
            </div>

            {/* Fecha de creación */}
            <div className="mb-4">
              <div className="flex justify-between items-center">
                <span
                  className="text-sm"
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  Creado:
                </span>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  {new Date(club.createdAt).toLocaleDateString("es-ES")}
                </span>
              </div>
            </div>

            <ActionButtons
              onView={() => router.push(`/admin/clubs/${club._id}`)}
              onEdit={() => router.push(`/admin/clubs/${club._id}/edit`)}
              onDelete={() => handleDelete(club._id, club.name)}
              isDarkMode={isDarkMode}
            />
          </ItemCard>
        ))}
      </div>
    </AdminPageLayout>
  );
}
