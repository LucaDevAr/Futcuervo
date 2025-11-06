"use client";

import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function CreateLeagueModalEnhanced({
  isOpen,
  onClose,
  newLeague,
  isDarkMode,
  onLeagueChange,
  onCreateLeague,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        style={{
          backgroundColor: isDarkMode ? "var(--fondo-oscuro)" : "var(--blanco)",
          border: `1px solid ${isDarkMode ? "var(--azul)" : "var(--rojo)"}`,
        }}
      >
        <DialogHeader>
          <DialogTitle
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Crear Nueva Liga
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Nombre de la Liga
            </Label>
            <input
              value={newLeague?.name}
              onChange={(e) => onLeagueChange("name", e.target.value)}
              placeholder="Ej: Primera División"
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
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              País
            </Label>
            <input
              value={newLeague?.country}
              onChange={(e) => onLeagueChange("country", e.target.value)}
              placeholder="Ej: Argentina"
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
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Logo de la Liga (URL)
            </Label>
            <input
              value={newLeague?.logoUrl}
              onChange={(e) => onLeagueChange("logoUrl", e.target.value)}
              placeholder="https://ejemplo.com/logo-liga.png"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
            {newLeague?.logoUrl && (
              <div
                className="flex items-center gap-2 p-2 rounded-md"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--azul-oscuro)"
                    : "var(--gris-claro)",
                }}
              >
                <img
                  src={newLeague?.logoUrl || "/placeholder.svg"}
                  alt="Vista previa del logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  Vista previa del logo
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onCreateLeague}
            disabled={!newLeague?.name || !newLeague?.country}
            className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            }}
          >
            Crear Liga
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
