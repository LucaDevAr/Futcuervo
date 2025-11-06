"use client";
import { Label } from "@/components/ui/label";
import { Plus, X, Trophy } from "lucide-react";

export function TitlesTab({
  titles,
  isDarkMode,
  onAddTitle,
  onUpdateTitle,
  onRemoveTitle,
}) {
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
      <div className="flex items-center justify-between mb-6">
        <h2
          className="text-xl font-semibold flex items-center gap-2"
          style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
        >
          <Trophy size={20} />
          Títulos
        </h2>
        <button
          type="button"
          onClick={onAddTitle}
          className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg"
          style={{
            backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            color: "white",
          }}
        >
          <Plus size={16} />
          <span>Agregar Título</span>
        </button>
      </div>

      <div className="space-y-4">
        {titles.map((title, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border relative"
            style={{
              borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              backgroundColor: isDarkMode
                ? "var(--fondo-oscuro)"
                : "var(--gris-claro)",
            }}
          >
            <button
              type="button"
              onClick={() => onRemoveTitle(index)}
              className="absolute top-2 right-2 p-1 rounded-full"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--rojo-oscuro)"
                  : "var(--rojo-claro)",
                color: isDarkMode ? "white" : "var(--rojo)",
              }}
            >
              <X size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pr-8">
              <div className="space-y-2">
                <Label
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  Nombre del Título
                </Label>
                <input
                  value={title.name}
                  onChange={(e) => onUpdateTitle(index, "name", e.target.value)}
                  placeholder="Ej: Copa Libertadores"
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

              <div className="space-y-2">
                <Label
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  Año
                </Label>
                <input
                  type="number"
                  value={title.year}
                  onChange={(e) => onUpdateTitle(index, "year", e.target.value)}
                  placeholder="2023"
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

              <div className="space-y-2">
                <Label
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  URL de la Imagen
                </Label>
                <input
                  value={title.image}
                  onChange={(e) =>
                    onUpdateTitle(index, "image", e.target.value)
                  }
                  placeholder="https://ejemplo.com/titulo.png"
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
            </div>

            {/* Vista previa de la imagen del título */}
            {title.image && (
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={title.image || "/placeholder.svg"}
                  alt={`Título ${title.name}`}
                  className="w-12 h-12 object-contain rounded border"
                  style={{
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div
                  className="text-sm"
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  Vista previa del título
                </div>
              </div>
            )}
          </div>
        ))}

        {titles.length === 0 && (
          <div
            className="text-center py-8 rounded-lg border-2 border-dashed"
            style={{
              color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
              borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            }}
          >
            <div className="space-y-2">
              <Trophy size={48} className="mx-auto opacity-50" />
              <p className="text-lg font-medium">No hay títulos agregados</p>
              <p className="text-sm">Agrega el primer título para comenzar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
