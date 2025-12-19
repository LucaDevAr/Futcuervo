"use client";

import { Label } from "@/components/ui/label";
import { Plus, X, BarChart3, Trophy, Camera, Shield } from "lucide-react";

export function StatsAndTitlesTab({
  clubsStats = [],
  onUpdateClubStat,
  titles,
  isDarkMode,
  onAddTitle,
  onUpdateTitle,
  onRemoveTitle,
  clubs,
  globalStats = {},
  onUpdateGlobalStat,
}) {
  const getClubInfo = (clubId) => {
    return clubs.find((c) => c._id === clubId);
  };

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
          {[
            { key: "totalAppearances", label: "Partidos" },
            { key: "totalGoals", label: "Goles" },
            { key: "totalAssists", label: "Asistencias" },
            { key: "totalYellowCards", label: "Amarillas" },
            { key: "totalRedCards", label: "Rojas" },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <Label
                style={{
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                }}
              >
                {label}
              </Label>
              <input
                type="number"
                value={globalStats[key] || 0}
                onChange={(e) =>
                  onUpdateGlobalStat(key, Number(e.target.value))
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
          ))}
        </div>
      </div>

      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: isDarkMode
            ? "var(--fondo-oscuro)"
            : "var(--gris-claro)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold flex items-center gap-2"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            <Shield size={20} /> Estadísticas por Club
          </h2>
          <div
            className="text-sm"
            style={{ color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)" }}
          >
            {clubsStats.length} {clubsStats.length === 1 ? "club" : "clubes"}{" "}
            con estadísticas
          </div>
        </div>

        <div className="space-y-6">
          {clubsStats.map((clubStat, index) => {
            const clubInfo = getClubInfo(clubStat.club);

            return (
              <div
                key={clubStat.club || index}
                className="p-6 rounded-lg border"
                style={{
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--gris-claro)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                      style={{
                        backgroundColor: isDarkMode
                          ? "var(--azul)"
                          : "var(--rojo)",
                        color: "white",
                      }}
                    >
                      {index + 1}
                    </div>
                    {clubInfo?.logo && (
                      <img
                        src={clubInfo.logo || "/placeholder.svg"}
                        alt={clubStat.clubName}
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <span
                      className="font-semibold text-lg"
                      style={{
                        color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      }}
                    >
                      {clubStat.clubName}
                    </span>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[
                      { key: "appearances", label: "Partidos" },
                      { key: "goals", label: "Goles" },
                      { key: "assists", label: "Asistencias" },
                      { key: "yellowCards", label: "Amarillas" },
                      { key: "redCards", label: "Rojas" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <Label
                          className="text-sm mb-2 block"
                          style={{
                            color: isDarkMode
                              ? "var(--gris)"
                              : "var(--gris-oscuro)",
                          }}
                        >
                          {label}
                        </Label>
                        <input
                          type="number"
                          value={clubStat[key] || 0}
                          onChange={(e) =>
                            onUpdateClubStat(
                              clubStat.club,
                              key,
                              Number(e.target.value)
                            )
                          }
                          className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                          style={{
                            backgroundColor: isDarkMode
                              ? "var(--fondo-oscuro)"
                              : "var(--blanco)",
                            color: isDarkMode
                              ? "var(--blanco)"
                              : "var(--negro)",
                            borderColor: isDarkMode
                              ? "var(--azul)"
                              : "var(--rojo)",
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label
                      className="text-sm flex items-center gap-2"
                      style={{
                        color: isDarkMode
                          ? "var(--gris)"
                          : "var(--gris-oscuro)",
                      }}
                    >
                      <Camera size={16} />
                      Imagen Jugando en este Club
                    </Label>
                    <input
                      type="text"
                      value={clubStat.actionImage || ""}
                      onChange={(e) =>
                        onUpdateClubStat(
                          clubStat.club,
                          "actionImage",
                          e.target.value
                        )
                      }
                      placeholder="URL de la imagen jugando en este club"
                      className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                      style={{
                        backgroundColor: isDarkMode
                          ? "var(--fondo-oscuro)"
                          : "var(--blanco)",
                        color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                        borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                      }}
                    />
                    {clubStat.actionImage && (
                      <div className="mt-3">
                        <img
                          src={clubStat.actionImage || "/placeholder.svg"}
                          alt={`${clubStat.clubName} acción`}
                          className="w-full max-w-md h-48 rounded-lg object-cover border-2"
                          style={{
                            borderColor: isDarkMode
                              ? "var(--azul)"
                              : "var(--rojo)",
                          }}
                          onError={(e) => {
                            e.target.src =
                              "/placeholder.svg?height=200&width=400";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {clubsStats.length === 0 && (
            <div
              className="text-center py-12 rounded-lg border-2 border-dashed"
              style={{
                color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            >
              <div className="space-y-2">
                <Shield size={48} className="mx-auto opacity-50" />
                <p className="text-lg font-medium">
                  No hay estadísticas por club
                </p>
                <p className="text-sm">
                  Las estadísticas se generan automáticamente desde la
                  trayectoria del jugador
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Títulos */}
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
          <Trophy size={20} /> Títulos
        </h2>
        <div className="space-y-4">
          {titles.map((title, index) => (
            <div
              key={index}
              className="p-4 rounded-lg border"
              style={{
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-5">
                  <Label
                    className="text-sm mb-2 block"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Nombre del Título
                  </Label>
                  <input
                    type="text"
                    value={title.name}
                    onChange={(e) =>
                      onUpdateTitle(index, "name", e.target.value)
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
                <div className="md:col-span-5">
                  <Label
                    className="text-sm mb-2 block"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    URL Imagen
                  </Label>
                  <input
                    type="text"
                    value={title.image}
                    onChange={(e) =>
                      onUpdateTitle(index, "image", e.target.value)
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
                <div className="md:col-span-1">
                  <Label
                    className="text-sm mb-2 block"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    Año
                  </Label>
                  <input
                    type="number"
                    value={title.year}
                    onChange={(e) =>
                      onUpdateTitle(index, "year", e.target.value)
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
                <div className="md:col-span-1">
                  <button
                    type="button"
                    onClick={() => onRemoveTitle(index)}
                    className="w-full p-2 rounded-lg hover:scale-105 transition-transform"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--rojo-oscuro)"
                        : "var(--rojo-claro)",
                      color: isDarkMode ? "white" : "var(--rojo)",
                    }}
                  >
                    <X size={16} className="mx-auto" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddTitle}
          className="flex items-center gap-2 px-4 py-3 rounded-lg text-white mt-4 hover:scale-105 transition-transform"
          style={{
            backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <Plus size={16} /> Agregar Título
        </button>
      </div>
    </div>
  );
}
