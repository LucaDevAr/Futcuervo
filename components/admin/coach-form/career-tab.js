"use client";

import { Label } from "@/components/ui/label";
import { Plus, X, Building2, Calendar } from "lucide-react";
import { DateSelector } from "@/components/admin/player-form/date-selector";
import { LeagueSelectorWithLogos } from "@/components/admin/player-form/league-selector-with-logos";
import { ClubSelectorWithLogos } from "@/components/admin/player-form/club-selector-with-logos";

export function CareerTab({
  careerPath,
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
            {careerPath.length} {careerPath.length === 1 ? "club" : "clubes"}{" "}
            agregados
          </div>
        </div>

        <div className="space-y-6 pb-20">
          {careerPath.map((clubEntry, index) => {
            const selectedLeague = leagues.find(
              (league) => league._id === clubEntry.league
            );
            const availableClubs = selectedLeague
              ? clubs.filter((club) => club.league._id === selectedLeague._id)
              : [];
            const selectedClub = availableClubs.find(
              (club) => club._id === clubEntry.club
            );

            return (
              <div
                key={index}
                className="p-6 rounded-lg border relative transition-all hover:shadow-lg"
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
                    {selectedClub && (
                      <span
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? "var(--gris)"
                            : "var(--gris-oscuro)",
                        }}
                      >
                        - {selectedClub.name}
                      </span>
                    )}
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
                  {/* Liga y Club lado a lado - exactamente igual que players */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* League Selection */}
                    <div className="space-y-2">
                      <LeagueSelectorWithLogos
                        leagues={leagues}
                        value={clubEntry.league}
                        onChange={(leagueId) => {
                          onUpdateClub(index, "league", leagueId);
                          // Clear club selection when league changes
                          onUpdateClub(index, "club", "");
                        }}
                        isDarkMode={isDarkMode}
                        label="Liga"
                        placeholder="Seleccionar liga"
                      />

                      {/* Show selected league info */}
                      {selectedLeague && (
                        <div
                          className="flex items-center gap-3 p-3 rounded-lg border"
                          style={{
                            borderColor: isDarkMode
                              ? "var(--azul)"
                              : "var(--rojo)",
                            backgroundColor: isDarkMode
                              ? "rgba(59, 130, 246, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                          }}
                        >
                          {selectedLeague.logoUrl && (
                            <img
                              src={selectedLeague.logoUrl || "/placeholder.svg"}
                              alt={selectedLeague.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <div
                              className="font-medium text-sm"
                              style={{
                                color: isDarkMode
                                  ? "var(--blanco)"
                                  : "var(--negro)",
                              }}
                            >
                              {selectedLeague.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{
                                color: isDarkMode
                                  ? "var(--gris)"
                                  : "var(--gris-oscuro)",
                              }}
                            >
                              {selectedLeague.country}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Club Selection */}
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <ClubSelectorWithLogos
                            clubs={clubs}
                            selectedLeague={clubEntry.league}
                            value={clubEntry.club}
                            onChange={(clubId) =>
                              onUpdateClub(index, "club", clubId)
                            }
                            onCreateNew={onCreateClub}
                            isDarkMode={isDarkMode}
                            label="Club"
                            disabled={!selectedLeague}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={onCreateClub}
                          className="p-3 rounded-lg hover:scale-105 transition-transform mt-6"
                          style={{
                            backgroundColor: isDarkMode
                              ? "var(--azul-oscuro)"
                              : "var(--gris-claro)",
                            color: isDarkMode
                              ? "var(--blanco)"
                              : "var(--negro)",
                          }}
                          title="Crear nuevo club"
                        >
                          <Plus size={20} />
                        </button>
                      </div>

                      {/* Show selected club info */}
                      {selectedClub && (
                        <div
                          className="flex items-center gap-3 p-3 rounded-lg border"
                          style={{
                            borderColor: isDarkMode
                              ? "var(--azul)"
                              : "var(--rojo)",
                            backgroundColor: isDarkMode
                              ? "rgba(59, 130, 246, 0.1)"
                              : "rgba(239, 68, 68, 0.1)",
                          }}
                        >
                          {selectedClub.logo && (
                            <img
                              src={selectedClub.logo || "/placeholder.svg"}
                              alt={selectedClub.name}
                              className="w-6 h-6 object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                          <div>
                            <div
                              className="font-medium text-sm"
                              style={{
                                color: isDarkMode
                                  ? "var(--blanco)"
                                  : "var(--negro)",
                              }}
                            >
                              {selectedClub.name}
                            </div>
                            <div
                              className="text-xs"
                              style={{
                                color: isDarkMode
                                  ? "var(--gris)"
                                  : "var(--gris-oscuro)",
                              }}
                            >
                              {selectedClub.league.name} -{" "}
                              {selectedClub.league.country}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fechas */}
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
            );
          })}

          {careerPath.length === 0 && (
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
