"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Shirt, Star, Calendar } from "lucide-react";
export function JerseysTab({
  shirts,
  selectedJerseys,
  isDarkMode,
  onShirtToggle,
}) {
  const handleShirtClick = (shirtId, event) => {
    event.preventDefault();
    event.stopPropagation();
    onShirtToggle(shirtId);
  };

  const handleCheckboxChange = (shirtId) => {
    onShirtToggle(shirtId);
  };

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
      <h2
        className="text-xl font-semibold mb-4 flex items-center gap-2"
        style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
      >
        <Shirt size={20} />
        Camisetas Utilizadas
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
        {shirts.map((shirt) => (
          <div
            key={shirt._id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              selectedJerseys.includes(shirt._id) ? "ring-2" : ""
            }`}
            style={{
              backgroundColor: isDarkMode
                ? "var(--fondo-oscuro)"
                : "var(--blanco)",
              borderColor: selectedJerseys.includes(shirt._id)
                ? isDarkMode
                  ? "var(--azul)"
                  : "var(--rojo)"
                : isDarkMode
                ? "var(--azul-oscuro)"
                : "var(--gris)",
              ringColor: selectedJerseys.includes(shirt._id)
                ? isDarkMode
                  ? "var(--azul)"
                  : "var(--rojo)"
                : "transparent",
            }}
          >
            {/* Imagen de la camiseta - Clickeable */}
            <div
              className="flex justify-center mb-3 cursor-pointer"
              onClick={(e) => handleShirtClick(shirt._id, e)}
            >
              {shirt.images?.base ? (
                <img
                  src={shirt.images.base || "/placeholder.svg"}
                  alt={`${shirt.type} - ${shirt.brand}`}
                  className="w-20 h-20 object-contain rounded-md hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback = e.currentTarget.nextElementSibling;
                    if (fallback) fallback.style.display = "flex";
                  }}
                />
              ) : null}

              {/* Fallback cuando no hay imagen */}
              <div
                className={`w-20 h-20 rounded-md flex items-center justify-center hover:scale-105 transition-transform ${
                  !shirt.images?.base ? "flex" : "hidden"
                }`}
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--azul-oscuro)"
                    : "var(--gris-claro)",
                  color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                }}
              >
                <Shirt size={32} />
              </div>
            </div>

            {/* Checkbox y información */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`shirt-${shirt._id}`}
                  checked={selectedJerseys.includes(shirt._id)}
                  onCheckedChange={() => handleCheckboxChange(shirt._id)}
                  className="data-[state=checked]:bg-[var(--azul)] dark:data-[state=checked]:bg-[var(--rojo)]"
                />
                <Label
                  htmlFor={`shirt-${shirt._id}`}
                  className="flex-1 cursor-pointer font-medium"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleShirtClick(shirt._id, e);
                  }}
                >
                  {shirt.type}
                </Label>
              </div>

              {/* Detalles de la camiseta */}
              <div className="space-y-1 text-xs">
                <div
                  className="flex justify-between"
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  <span>Marca:</span>
                  <span className="font-medium">{shirt.brand}</span>
                </div>

                <div
                  className="flex justify-between"
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  <span>Escudo:</span>
                  <span className="font-medium">{shirt.emblemType}</span>
                </div>

                {shirt.seasonsUsed && shirt.seasonsUsed.length > 0 && (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      Temporadas:
                    </span>
                    <span className="font-medium">
                      {shirt.seasonsUsed.join(", ")}
                    </span>
                  </div>
                )}

                {shirt.sponsors && shirt.sponsors.length > 0 && (
                  <div
                    className="flex justify-between items-center"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    <span className="flex items-center gap-1">
                      <Star size={10} />
                      Sponsors:
                    </span>
                    <span className="font-medium text-right">
                      {shirt.sponsors.join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Indicador de selección */}
              {selectedJerseys.includes(shirt._id) && (
                <div
                  className="text-xs font-medium text-center py-1 rounded"
                  style={{
                    backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    color: "var(--blanco)",
                  }}
                >
                  ✓ Seleccionada
                </div>
              )}
            </div>

            {/* Indicadores adicionales */}
            <div
              className="flex justify-between items-center mt-2 pt-2 border-t"
              style={{
                borderColor: isDarkMode ? "var(--azul-oscuro)" : "var(--gris)",
              }}
            >
              {/* Indicador de múltiples imágenes */}
              {shirt.images && Object.keys(shirt.images).length > 1 && (
                <div
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--azul-oscuro)"
                      : "var(--gris-claro)",
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  {Object.keys(shirt.images).length} variantes
                </div>
              )}

              {/* Indicador de temporada actual */}
              {shirt.seasonsUsed?.includes("2025") && (
                <div
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{
                    backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    color: "var(--blanco)",
                  }}
                >
                  Actual
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Estado vacío */}
      {shirts.length === 0 && (
        <div
          className="text-center py-12 rounded-lg border-2 border-dashed"
          style={{
            color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <div className="space-y-2">
            <Shirt size={48} className="mx-auto opacity-50" />
            <p className="text-lg font-medium">No hay camisetas disponibles</p>
            <p className="text-sm">
              Las camisetas se mostrarán aquí cuando estén disponibles
            </p>
          </div>
        </div>
      )}

      {/* Resumen de selección */}
      {shirts.length > 0 && (
        <div
          className="mt-4 p-3 rounded-lg border-t"
          style={{
            backgroundColor: isDarkMode
              ? "var(--azul-oscuro)"
              : "var(--gris-claro)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              className="text-sm font-medium"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Camisetas seleccionadas:
            </span>
            <span
              className="text-sm font-bold px-2 py-1 rounded"
              style={{
                backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                color: "var(--blanco)",
              }}
            >
              {selectedJerseys.length} de {shirts.length}
            </span>
          </div>

          {/* Lista de camisetas seleccionadas */}
          {selectedJerseys.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedJerseys.map((jerseyId) => {
                const shirt = shirts.find((s) => s._id === jerseyId);
                return shirt ? (
                  <span
                    key={jerseyId}
                    className="text-xs px-2 py-1 rounded"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--fondo-oscuro)"
                        : "var(--blanco)",
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      border: `1px solid ${
                        isDarkMode ? "var(--azul)" : "var(--rojo)"
                      }`,
                    }}
                  >
                    {shirt.type} ({shirt.seasonsUsed.join(", ")})
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
