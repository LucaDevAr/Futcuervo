"use client";

import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeagueSelectorWithLogos } from "./league-selector-with-logos";

export function CreateClubModalEnhanced({
  isOpen,
  onClose,
  newClub,
  leagues,
  isDarkMode,
  onClubChange,
  onCreateClub,
  onCreateLeague,
}) {
  const handleCreateClub = () => {
    console.log("Modal: Creating club with data:", newClub); // Debug
    onCreateClub();
  };

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
            Crear Nuevo Club
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Nombre del Club
            </Label>
            <input
              value={newClub?.name}
              onChange={(e) => onClubChange("name", e.target.value)}
              placeholder="Ej: FC Barcelona"
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
              Logo del Club (URL)
            </Label>
            <input
              value={newClub?.logo}
              onChange={(e) => onClubChange("logo", e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
            {newClub?.logo && (
              <div
                className="flex items-center gap-2 p-2 rounded-md"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--azul-oscuro)"
                    : "var(--gris-claro)",
                }}
              >
                <img
                  src={newClub?.logo || "/placeholder.svg"}
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

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Liga
              </Label>
              <button
                type="button"
                onClick={onCreateLeague}
                className="text-xs px-2 py-1 rounded flex items-center gap-1"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--azul-oscuro)"
                    : "var(--gris-claro)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                }}
              >
                <Plus size={12} />
                Nueva Liga
              </button>
            </div>
            <LeagueSelectorWithLogos
              leagues={leagues}
              value={newClub?.league}
              onChange={(value) => onClubChange("league", value)}
              isDarkMode={isDarkMode}
              label=""
              placeholder="Seleccionar liga para el club"
            />
          </div>

          <button
            type="button"
            onClick={handleCreateClub}
            disabled={!newClub?.name || !newClub?.league}
            className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            }}
          >
            Crear Club
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
