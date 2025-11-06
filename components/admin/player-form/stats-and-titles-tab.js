import { EnhancedCareerClubSelector } from "./enhanced-career-club-selector";
import { Label } from "@/components/ui/label";
import { Plus, X, BarChart3, Trophy } from "lucide-react";
import { useState } from "react";

export function StatsAndTitlesTab({
  clubsStats = [],
  selectedClubId,
  onSelectClub,
  onUpdateClubStat,
  titles,
  isDarkMode,
  onAddTitle,
  onUpdateTitle,
  onRemoveTitle,
  clubs,
  leagues,
  onAddClubToStats,
  onRemoveClubFromStats,
  globalStats = {},
  onUpdateGlobalStat,
}) {
  const [selectedClubForAdd, setSelectedClubForAdd] = useState("");

  return (
    <div className="space-y-8">
      {/* Totales Globales Modificables */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: isDarkMode
            ? "var(--fondo-oscuro)"
            : "var(--gris-claro)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          className="text-xl font-semibold mb-4 flex items-center gap-2"
          style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
        >
          <BarChart3 size={20} /> Totales Globales
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {["appearances", "goals", "assists", "yellowCards", "redCards"].map(
            (stat) => (
              <div key={stat} className="space-y-1">
                <Label
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  {stat === "appearances"
                    ? "Partidos"
                    : stat === "goals"
                    ? "Goles"
                    : stat === "assists"
                    ? "Asistencias"
                    : stat === "yellowCards"
                    ? "Amarillas"
                    : "Rojas"}
                </Label>
                <input
                  type="number"
                  value={globalStats[stat] || 0}
                  onChange={(e) =>
                    onUpdateGlobalStat(stat, Number(e.target.value))
                  }
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--fondo-oscuro)"
                      : "var(--blanco)",
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* Estadísticas por Club */}
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: isDarkMode
            ? "var(--fondo-oscuro)"
            : "var(--gris-claro)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <h2
          className="text-xl font-semibold mb-4 flex items-center gap-2"
          style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
        >
          <BarChart3 size={20} /> Estadísticas por Club
        </h2>

        {/* Selector con EnhancedCareerClubSelector */}
        <EnhancedCareerClubSelector
          clubs={clubs.filter((c) => !clubsStats.find((s) => s.club === c._id))}
          leagues={leagues}
          selectedClub={selectedClubForAdd}
          onClubChange={(club) => setSelectedClubForAdd(club)}
          onLeagueChange={() => {}}
          onCreateClub={() => {}}
          isDarkMode={isDarkMode}
        />
        <button
          type="button"
          className="mt-2 px-4 py-2 rounded-lg text-white"
          style={{
            backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
          onClick={() => {
            if (!selectedClubForAdd) return;
            const club = clubs.find((c) => c._id === selectedClubForAdd);
            onAddClubToStats(club);
            setSelectedClubForAdd("");
          }}
        >
          Agregar Club a Stats
        </button>

        {/* Selector de club para editar stats */}
        <div className="mt-4 flex items-center gap-2">
          <Label
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Seleccionar Club
          </Label>
          <select
            value={selectedClubId || ""}
            onChange={(e) => onSelectClub(e.target.value)}
            className="px-3 py-2 rounded-lg border flex-1"
            style={{
              backgroundColor: isDarkMode
                ? "var(--fondo-oscuro)"
                : "var(--blanco)",
              color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            }}
          >
            <option value="">Selecciona un club</option>
            {clubsStats.map((s) => (
              <option key={s.club} value={s.club}>
                {s.clubName}
              </option>
            ))}
          </select>
          {selectedClubId && (
            <button
              onClick={() => onRemoveClubFromStats(selectedClubId)}
              className="px-3 py-2 rounded-lg text-white"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--rojo-oscuro)"
                  : "var(--rojo-claro)",
              }}
            >
              <X size={16} /> Eliminar
            </button>
          )}
        </div>

        {/* Inputs de stats por club */}
        {selectedClubId && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {["appearances", "goals", "assists", "yellowCards", "redCards"].map(
              (stat) => (
                <div key={stat}>
                  <Label
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {stat === "appearances"
                      ? "Partidos"
                      : stat === "goals"
                      ? "Goles"
                      : stat === "assists"
                      ? "Asistencias"
                      : stat === "yellowCards"
                      ? "Amarillas"
                      : "Rojas"}
                  </Label>
                  <input
                    type="number"
                    value={
                      clubsStats.find((s) => s.club === selectedClubId)?.[
                        stat
                      ] || 0
                    }
                    onChange={(e) =>
                      onUpdateClubStat(
                        selectedClubId,
                        stat,
                        Number(e.target.value)
                      )
                    }
                    className="w-full px-4 py-2 rounded-lg border"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--fondo-oscuro)"
                        : "var(--blanco)",
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    }}
                  />
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
