"use client";

import { Label } from "@/components/ui/label";
import { Plus, X, Building2, Calendar } from "lucide-react";
import { EnhancedCareerClubSelector } from "./enhanced-career-club-selector";
import { DateSelector } from "./date-selector";

export function CareerTab({
  career,
  clubs,
  leagues,
  isDarkMode,
  onAddClub,
  onUpdateClub,
  onRemoveClub,
  onCreateClub,
}) {
  return (
    <div className="relative">
      <div
        className="p-6 rounded-xl"
        style={{
          backgroundColor: isDarkMode
            ? "var(--fondo-oscuro)"
            : "var(--gris-claro)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className="text-xl font-semibold"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Trayectoria Profesional
          </h2>
          <div
            className="text-sm"
            style={{ color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)" }}
          >
            {career.length} {career.length === 1 ? "club" : "clubes"} agregados
          </div>
        </div>

        <div className="space-y-6 pb-20">
          {career.map((clubEntry, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border relative"
              style={{
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
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
                  <span
                    className="font-medium"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    Club #{index + 1}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveClub(index)}
                  className="p-2 rounded-full hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--rojo-oscuro)"
                      : "var(--rojo-claro)",
                    color: isDarkMode ? "white" : "var(--rojo)",
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Liga y Club lado a lado */}
                <div>
                  <EnhancedCareerClubSelector
                    clubs={clubs}
                    leagues={leagues}
                    selectedClub={clubEntry.club}
                    selectedLeague={clubEntry.league}
                    onClubChange={(clubId) =>
                      onUpdateClub(index, "club", clubId)
                    }
                    onLeagueChange={(leagueId) =>
                      onUpdateClub(index, "league", leagueId)
                    }
                    onCreateClub={onCreateClub}
                    isDarkMode={isDarkMode}
                  />
                </div>

                {/* Fechas debajo */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar
                      size={16}
                      style={{
                        color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      }}
                    />
                    <Label
                      style={{
                        color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      }}
                    >
                      Período en el Club
                    </Label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        className="text-sm mb-2 block"
                        style={{
                          color: isDarkMode
                            ? "var(--gris)"
                            : "var(--gris-oscuro)",
                        }}
                      >
                        Fecha de Ingreso
                      </Label>
                      <DateSelector
                        value={clubEntry.joinedDate}
                        onChange={(date) =>
                          onUpdateClub(index, "joinedDate", date)
                        }
                        isDarkMode={isDarkMode}
                      />
                    </div>

                    <div>
                      <Label
                        className="text-sm mb-2 block"
                        style={{
                          color: isDarkMode
                            ? "var(--gris)"
                            : "var(--gris-oscuro)",
                        }}
                      >
                        Fecha de Salida
                      </Label>
                      <DateSelector
                        value={clubEntry.leftDate}
                        onChange={(date) =>
                          onUpdateClub(index, "leftDate", date)
                        }
                        isDarkMode={isDarkMode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {career.length === 0 && (
            <div
              className="text-center py-12 rounded-lg border-2 border-dashed"
              style={{
                color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            >
              <div className="space-y-2">
                <Building2 size={48} className="mx-auto opacity-50" />
                <p className="text-lg font-medium">
                  No hay clubes en la trayectoria
                </p>
                <p className="text-sm">Agrega el primer club para comenzar</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botón fijo para agregar club */}
      <div
        className="sticky bottom-4 left-0 right-0 flex justify-center z-10"
        style={{ marginTop: "-60px" }}
      >
        <button
          type="button"
          onClick={onAddClub}
          className="flex items-center gap-2 px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform font-medium"
          style={{
            backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            color: "white",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          }}
        >
          <Plus size={20} />
          <span>Agregar Club</span>
        </button>
      </div>
    </div>
  );
}
