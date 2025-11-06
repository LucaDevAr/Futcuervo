"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Building2, Globe } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { useAdminPage } from "@/hooks/admin/use-admin-page";
import { AdminPageLayout } from "@/components/admin/admin-page-layout";
import { ItemCard } from "@/components/admin/item-card";
import { ActionButtons } from "@/components/admin/action-buttons";

export default function PlayersPage() {
  const router = useRouter();
  const isDarkMode = useDarkMode();

  // Estados adicionales para datos relacionados
  const [countries, setCountries] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [leagues, setLeagues] = useState([]);

  // Estados de filtros
  const [positionFilter, setPositionFilter] = useState("");
  const [nationalityFilter, setNationalityFilter] = useState("");
  const [clubFilter, setClubFilter] = useState("");
  const [leagueFilter, setLeagueFilter] = useState("");
  const [birthdayFilter, setBirthdayFilter] = useState(""); // formato "MM-DD"

  // Campos de búsqueda estables
  const searchFields = useMemo(() => ["fullName", "nicknames"], []);

  // Filtros personalizados estables
  const customFilters = useMemo(
    () => [
      // Nacionalidad
      (player) =>
        !nationalityFilter ||
        player.nationality?.name?.toLowerCase() ===
          nationalityFilter.toLowerCase(),

      // Posición
      (player) =>
        !positionFilter ||
        player.positions?.some(
          (position) => position.toLowerCase() === positionFilter.toLowerCase()
        ),

      // Club
      (player) => {
        if (!clubFilter) return true;
        return player.career?.some(
          (career) => career.club?._id?.toString() === clubFilter.toString()
        );
      },

      // Liga
      (player) => {
        if (!leagueFilter) return true;
        return player.career?.some(
          (career) =>
            career.club?.league?._id?.toString() === leagueFilter.toString()
        );
      },

      // Cumpleaños (MM-DD)
      (player) => {
        if (!birthdayFilter || !player.birthdate) return true;
        const birth = new Date(player.birthdate);
        const month = String(birth.getMonth() + 1).padStart(2, "0");
        const day = String(birth.getDate()).padStart(2, "0");
        return `${month}-${day}` === birthdayFilter;
      },
    ],
    [
      nationalityFilter,
      positionFilter,
      clubFilter,
      leagueFilter,
      birthdayFilter,
    ]
  );

  // Estados para jugadores y carga
  const [playersData, setPlayersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook personalizado para la lógica común
  const {
    items: players,
    filteredItems: filteredPlayers,
    loading,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    handleDelete: handleDeleteHook,
  } = useAdminPage({
    apiEndpoint: `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/players`,
    itemName: "Jugador",
    itemNamePlural: "jugadores",
    searchFields,
    customFilters,
  });

  // Manejo de eliminación de jugadores
  const handleDelete = useCallback(async (id) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/players/${id}`,
      {
        method: "DELETE",
      },
      {
        credentials: "include",
      }
    );
    if (response.ok) {
      setPlayersData((prev) => prev.filter((player) => player._id !== id));
    }
  }, []);

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

  // Cargar jugadores
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/players`,
          { credentials: "include" }
        );

        if (response.ok) {
          const data = await response.json();

          // ✅ Normalización robusta
          let normalized = [];
          if (Array.isArray(data)) normalized = data;
          else if (Array.isArray(data.players)) normalized = data.players;
          else if (Array.isArray(data.items)) normalized = data.items;
          else if (Array.isArray(data.data)) normalized = data.data;
          else console.warn("⚠️ Formato desconocido recibido:", data);

          setPlayersData(normalized);
        } else {
          console.error("Error al cargar jugadores");
        }
      } catch (error) {
        console.error("Error fetching players:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Obtener datos únicos para filtros
  const uniquePositions = useMemo(
    () =>
      Array.from(
        new Set(playersData.flatMap((player) => player.positions))
      ).sort(),
    [playersData]
  );

  const uniqueNationalities = useMemo(
    () =>
      Array.from(
        new Set(playersData.map((player) => player.nationality.name))
      ).sort(),
    [playersData]
  );

  // Unique Clubs
  const uniqueClubs = useMemo(() => {
    // Obtener todos los IDs de club válidos
    const clubIds = Array.from(
      new Set(
        playersData.flatMap(
          (player) =>
            player.career
              ?.filter((career) => career.club) // filtramos careers sin club
              .map((career) => career.club._id) || []
        )
      )
    );

    // Mapear IDs a objetos completos de club
    return clubIds
      .map((clubId) => {
        const playerWithClub = playersData.find((player) =>
          player.career?.some((career) => career.club?._id === clubId)
        );
        return playerWithClub?.career?.find(
          (career) => career.club?._id === clubId
        )?.club;
      })
      .filter(Boolean);
  }, [playersData]);

  // Unique Leagues
  const uniqueLeagues = useMemo(() => {
    // Obtener todos los IDs de liga válidos
    const leagueIds = Array.from(
      new Set(
        playersData.flatMap(
          (player) =>
            player.career
              ?.filter((career) => career.club?.league) // filtramos careers sin league
              .map((career) => career.club.league._id) || []
        )
      )
    );

    // Mapear IDs a objetos completos de league
    return leagueIds
      .map((leagueId) => {
        const playerWithLeague = playersData.find((player) =>
          player.career?.some((career) => career.club?.league?._id === leagueId)
        );
        return playerWithLeague?.career?.find(
          (career) => career.club?.league?._id === leagueId
        )?.club?.league;
      })
      .filter(Boolean);
  }, [playersData]);

  // Opciones para selectores
  const nationalityOptions = useMemo(
    () =>
      uniqueNationalities.map((nationality) => {
        const country = countries.find((c) => c.name === nationality);
        return {
          value: nationality,
          label: nationality,
          image: country?.flag,
        };
      }),
    [uniqueNationalities, countries]
  );

  const positionOptions = useMemo(
    () =>
      uniquePositions.map((position) => ({
        value: position,
        label: position,
      })),
    [uniquePositions]
  );

  const clubOptions = useMemo(
    () =>
      uniqueClubs
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
        })),
    [uniqueClubs]
  );

  const leagueOptions = useMemo(
    () =>
      uniqueLeagues
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
        }),
    [uniqueLeagues, leagues]
  );

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setPositionFilter("");
    setNationalityFilter("");
    setClubFilter("");
    setLeagueFilter("");
    setShowFilters(false);
  }, [setSearchTerm, setShowFilters]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(
    () =>
      [positionFilter, nationalityFilter, clubFilter, leagueFilter].filter(
        Boolean
      ).length,
    [positionFilter, nationalityFilter, clubFilter, leagueFilter]
  );

  // Utilidades
  const calculateAge = useCallback((birthdate) => {
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
  }, []);

  const getCurrentClubs = useCallback((player) => {
    const currentCareerPeriods =
      player.career?.filter((career) => !career.leftDate) || [];
    const uniqueClubsMap = new Map();

    currentCareerPeriods.forEach((career) => {
      if (career.club && !uniqueClubsMap.has(career.club._id)) {
        uniqueClubsMap.set(career.club._id, career.club);
      }
    });

    return Array.from(uniqueClubsMap.values());
  }, []);

  return (
    <AdminPageLayout
      title="Jugadores"
      icon={Users}
      count={filteredPlayers.length}
      actionButton={{
        label: "Nuevo Jugador",
        onClick: () => router.push("/admin/players/create"),
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
      isEmpty={filteredPlayers.length === 0}
      emptyStateProps={{
        title:
          playersData.length === 0
            ? "No hay jugadores registrados"
            : "No se encontraron jugadores",
        description:
          playersData.length === 0
            ? "Comienza agregando el primer jugador al sistema"
            : "Intenta ajustar los filtros de búsqueda",
        actionButton:
          playersData.length === 0
            ? {
                label: "Crear Primer Jugador",
                onClick: () => router.push("/admin/players/create"),
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
              Posición
            </label>
            <SearchableCustomSelect
              options={[
                { value: "", label: "Todas las posiciones" },
                ...positionOptions,
              ]}
              value={positionFilter}
              onChange={setPositionFilter}
              placeholder="Seleccionar posición"
              searchPlaceholder="Buscar posición..."
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
              className="block text-sm font-medium flex items-center gap-1"
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
              Cumpleaños (día y mes)
            </label>
            <input
              type="date"
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={birthdayFilter ? `2000-${birthdayFilter}` : ""}
              onChange={(e) => {
                const value = e.target.value; // YYYY-MM-DD
                setBirthdayFilter(value ? value.slice(5) : ""); // guardamos MM-DD
              }}
            />
          </div>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => {
          const currentClubs = getCurrentClubs(player);

          return (
            <ItemCard key={player._id} isDarkMode={isDarkMode}>
              {/* Header del jugador con imágenes duales */}
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
                      {player.profileImage ? (
                        <img
                          src={player.profileImage || "/placeholder.svg"}
                          alt={`${player.fullName} - Perfil`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        player.fullName.charAt(0).toUpperCase()
                      )}
                    </div>
                    {player.actionImage && (
                      <div
                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white overflow-hidden"
                        style={{
                          backgroundColor: isDarkMode
                            ? "var(--rojo)"
                            : "var(--azul)",
                        }}
                      >
                        <img
                          src={player.actionImage || "/placeholder.svg"}
                          alt={`${player.fullName} - Jugando`}
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
                      {player.fullName}
                    </h3>
                    {player.nicknames.length > 0 && (
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? "var(--gris)"
                            : "var(--gris-oscuro)",
                        }}
                      >
                        {player.nicknames.join('", "')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {player.nationality.flagImage && (
                    <img
                      src={player.nationality.flagImage || "/placeholder.svg"}
                      alt={player.nationality.name}
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
                <div className="flex justify-between items-center">
                  <span
                    className="text-sm"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Posiciones:
                  </span>
                  <div className="flex gap-1">
                    {player.positions.slice(0, 3).map((position) => (
                      <span
                        key={position}
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: isDarkMode
                            ? "var(--azul-oscuro)"
                            : "var(--gris-claro)",
                          color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                        }}
                      >
                        {position}
                      </span>
                    ))}
                    {player.positions.length > 3 && (
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: isDarkMode
                            ? "var(--azul-oscuro)"
                            : "var(--gris-claro)",
                          color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                        }}
                      >
                        +{player.positions.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {player.birthdate && (
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
                      {calculateAge(player.birthdate)} años
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
                    {player.nationality.name}
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
                    {player.career?.length || 0}
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
                    {player.totalAppearances || player.appearances || 0}
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
                    {player.totalGoals || player.goals || 0}
                  </div>
                  <div
                    className="text-xs"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Goles
                  </div>
                </div>
                <div className="text-center">
                  <div
                    className="text-lg font-bold"
                    style={{
                      color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    }}
                  >
                    {player.titles?.length || 0}
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
              </div>

              {/* Acciones */}
              <ActionButtons
                onView={() => router.push(`/admin/players/${player._id}`)}
                onEdit={() => router.push(`/admin/players/${player._id}/edit`)}
                onDelete={() => handleDeleteHook(player._id, player.fullName)}
                isDarkMode={isDarkMode}
              />
            </ItemCard>
          );
        })}
      </div>
    </AdminPageLayout>
  );
}
