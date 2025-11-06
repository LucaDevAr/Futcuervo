"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Building2, Globe } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { useAdminPage } from "@/hooks/admin/use-admin-page";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { ItemCard } from "@/components/admin/item-card";
import { ActionButtons } from "@/components/admin/action-buttons";

export default function CoachesPage() {
  const router = useRouter();
  const isDarkMode = useDarkMode();

  // Estados adicionales para datos relacionados
  const [countries, setCountries] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [leagues, setLeagues] = useState([]);

  // Estados de filtros
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [clubFilter, setClubFilter] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");

  // Filtros personalizados
  const customFilters = [
    (coach) =>
      !nationalityFilter || coach.nationality.name === nationalityFilter,
    (coach) => {
      if (!clubFilter) return true;
      return coach.careerPath.some((career) => {
        if (typeof career.club === "string") {
          return career.club === clubFilter;
        } else {
          return career.club._id === clubFilter;
        }
      });
    },
    (coach) => {
      if (!leagueFilter) return true;
      return coach.careerPath.some((career) => {
        if (typeof career.club === "string") {
          return false;
        } else {
          return career.club.league._id === leagueFilter;
        }
      });
    },
  ];

  // Hook personalizado para la lógica común
  const {
    items: coaches,
    filteredItems: filteredCoaches,
    loading,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    handleDelete,
  } = useAdminPage({
    apiEndpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/coaches`,
    itemName: "Entrenador",
    itemNamePlural: "entrenadores",
    searchFields: ["fullName", "nicknames"],
    customFilters,
  });

  // Cargar datos relacionados
  useEffect(() => {
    const fetchRelatedData = async () => {
      try {
        const [countriesRes, clubsRes, leaguesRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/countries`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs`, {
            credentials: "include",
          }),
          fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/leagues`, {
            credentials: "include",
          }),
        ]);

        if (countriesRes.ok) {
          const countriesData = await countriesRes.json();
          setCountries(countriesData);
        }

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json();
          setClubs(clubsData);
        }

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
  const uniqueNationalities = Array.from(
    new Set(coaches.map((coach) => coach.nationality.name))
  ).sort();

  const uniqueClubs = Array.from(
    new Set(
      coaches.flatMap((coach) =>
        coach.careerPath
          .filter((career) => typeof career.club !== "string")
          .map((career) => career.club._id)
      )
    )
  )
    .map((clubId) => {
      const coachWithClub = coaches.find((coach) =>
        coach.careerPath.some(
          (career) =>
            typeof career.club !== "string" && career.club._id === clubId
        )
      );
      return coachWithClub?.careerPath.find(
        (career) =>
          typeof career.club !== "string" && career.club._id === clubId
      )?.club;
    })
    .filter(Boolean);

  const uniqueLeagues = Array.from(
    new Set(
      coaches.flatMap((coach) =>
        coach.careerPath
          .filter((career) => typeof career.club !== "string")
          .map((career) => career.club.league._id)
      )
    )
  )
    .map((leagueId) => {
      const coachWithLeague = coaches.find((coach) =>
        coach.careerPath.some(
          (career) =>
            typeof career.club !== "string" &&
            career.club.league._id === leagueId
        )
      );
      return coachWithLeague?.careerPath.find(
        (career) =>
          typeof career.club !== "string" && career.club.league._id === leagueId
      )?.club.league;
    })
    .filter(Boolean);

  // Opciones para selectores
  const nationalityOptions = uniqueNationalities.map((nationality) => {
    const country = countries.find((c) => c.name === nationality);
    return {
      value: nationality,
      label: nationality,
      image: country?.flag,
    };
  });

  const clubOptions = uniqueClubs
    .sort((a, b) => {
      const isArgentinaA = a.league.country.toLowerCase() === "argentina";
      const isArgentinaB = b.league.country.toLowerCase() === "argentina";

      if (isArgentinaA && isArgentinaB) {
        if (a.name.toLowerCase().includes("san lorenzo")) return -1;
        if (b.name.toLowerCase().includes("san lorenzo")) return 1;
        return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
      }

      if (isArgentinaA && !isArgentinaB) return -1;
      if (!isArgentinaA && isArgentinaB) return 1;

      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    })
    .map((club) => ({
      value: club._id,
      label: club.name,
      image: club.logo,
      subtitle: `${club.league.name} - ${club.league.country}`,
    }));

  const leagueOptions = uniqueLeagues
    .sort((a, b) => {
      if (a.country.toLowerCase() === "argentina") return -1;
      if (b.country.toLowerCase() === "argentina") return 1;
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    })
    .map((league) => {
      const fullLeague = leagues.find((l) => l._id === league._id);
      return {
        value: league._id,
        label: league.name,
        image: fullLeague?.logoUrl,
        subtitle: league.country,
      };
    });

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setNationalityFilter("");
    setClubFilter("");
    setLeagueFilter("");
    setShowFilters(false);
  };

  // Contar filtros activos
  const activeFiltersCount = [
    nationalityFilter,
    clubFilter,
    leagueFilter,
  ].filter(Boolean).length;

  // Utilidades
  const calculateAge = (birthdate) => {
    if (!birthdate) return null;
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const getCurrentClubs = (coach) => {
    return coach.careerPath
      .filter((career) => !career.leftDate)
      .map((career) => career.club)
      .filter((club) => typeof club !== "string");
  };

  return (
    <AdminPageLayout
      title="Entrenadores"
      icon={Users}
      count={filteredCoaches.length}
      actionButton={{
        label: "Nuevo Entrenador",
        onClick: () => router.push("/admin/coaches/create"),
        icon: Plus,
      }}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      searchPlaceholder="Buscar por nombre o apodo (sin acentos)..."
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters(!showFilters)}
      activeFiltersCount={activeFiltersCount}
      onClearFilters={clearFilters}
      loading={loading}
      isEmpty={filteredCoaches.length === 0}
      emptyStateProps={{
        title:
          coaches.length === 0
            ? "No hay entrenadores registrados"
            : "No se encontraron entrenadores",
        description:
          coaches.length === 0
            ? "Comienza agregando el primer entrenador al sistema"
            : "Intenta ajustar los filtros de búsqueda",
        actionButton:
          coaches.length === 0
            ? {
                label: "Crear Primer Entrenador",
                onClick: () => router.push("/admin/coaches/create"),
              }
            : undefined,
      }}
      isDarkMode={isDarkMode}
      filterChildren={
        <>
          <div className="space-y-2">
            <label
              className="block text-sm font-medium"
              style={{
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            >
              Nacionalidad
            </label>
            <SearchableCustomSelect
              options={[
                { value: "", label: "Todas las nacionalidades" },
                ...nationalityOptions,
              ]}
              value={nationalityFilter}
              onChange={setNationalityFilter}
              placeholder="Seleccionar país"
              searchPlaceholder="Buscar país..."
              enableSearch={true}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium flex items-center gap-1"
              style={{
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            >
              <Building2 size={14} />
              Club
            </label>
            <SearchableCustomSelect
              options={[
                { value: "", label: "Todos los clubes" },
                ...clubOptions,
              ]}
              value={clubFilter}
              onChange={setClubFilter}
              placeholder="Seleccionar club"
              searchPlaceholder="Buscar club..."
              enableSearch={true}
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium flex items-center gap-1"
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
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoaches.map((coach) => {
          const currentClubs = getCurrentClubs(coach);

          return (
            <ItemCard key={coach._id} isDarkMode={isDarkMode}>
              {/* Header del entrenador */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden"
                      style={{
                        backgroundColor: isDarkMode
                          ? "var(--azul)"
                          : "var(--rojo)",
                        color: "var(--blanco)",
                      }}
                    >
                      {coach.profileImage ? (
                        <img
                          src={coach.profileImage || "/placeholder.svg"}
                          alt={`${coach.fullName} - Perfil`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        coach.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    {coach.actionImage && (
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white overflow-hidden"
                        style={{
                          backgroundColor: isDarkMode
                            ? "var(--rojo)"
                            : "var(--azul)",
                        }}
                      >
                        <img
                          src={coach.actionImage || "/placeholder.svg"}
                          alt={`${coach.fullName} - Dirigiendo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3
                      className="font-semibold text-lg"
                      style={{
                        color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      }}
                    >
                      {coach.fullName}
                    </h3>
                    {coach.nicknames.length > 0 && (
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? "var(--gris)"
                            : "var(--gris-oscuro)",
                        }}
                      >
                        {coach.nicknames.join('", "')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {coach.nationality.flagImage && (
                    <img
                      src={coach.nationality.flagImage || "/placeholder.svg"}
                      alt={coach.nationality.name}
                      className="w-6 h-4 object-cover rounded"
                    />
                  )}
                </div>
              </div>

              {/* Clubes actuales */}
              {currentClubs.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2
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
                      Club Actual:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentClubs.map((club) => (
                      <div
                        key={club._id}
                        className="flex items-center gap-2 px-2 py-1 rounded text-xs"
                        style={{
                          backgroundColor: isDarkMode
                            ? "var(--azul-oscuro)"
                            : "var(--gris-claro)",
                          color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                        }}
                      >
                        {club.logo && (
                          <img
                            src={club.logo || "/placeholder.svg"}
                            alt={club.name}
                            className="w-4 h-4 object-contain"
                          />
                        )}
                        <span className="font-medium">{club.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información básica */}
              <div className="space-y-3 mb-4">
                {coach.birthdate && (
                  <div className="flex justify-between items-center">
                    <span
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? "var(--gris)"
                          : "var(--gris-oscuro)",
                      }}
                    >
                      Edad:
                    </span>
                    <span
                      className="text-sm font-medium"
                      style={{
                        color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      }}
                    >
                      {calculateAge(coach.birthdate)} años
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span
                    className="text-sm"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Nacionalidad:
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {coach.nationality.name}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span
                    className="text-sm"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Clubes:
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {coach.careerPath.length}
                  </span>
                </div>
              </div>

              {/* Estadísticas */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{
                      color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    }}
                  >
                    {coach.appearances}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Partidos
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{
                      color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    }}
                  >
                    {coach.titles.length}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Títulos
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{
                      color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    }}
                  >
                    {coach.careerPath.length}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Clubes
                  </div>
                </div>
              </div>

              <ActionButtons
                onView={() => router.push(`/admin/coaches/${coach._id}`)}
                onEdit={() => router.push(`/admin/coaches/${coach._id}/edit`)}
                onDelete={() => handleDelete(coach._id, coach.fullName)}
                isDarkMode={isDarkMode}
              />
            </ItemCard>
          );
        })}
      </div>
    </AdminPageLayout>
  );
}
