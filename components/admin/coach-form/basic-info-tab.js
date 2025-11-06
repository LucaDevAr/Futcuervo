"use client";

import { Label } from "@/components/ui/label";
import { UserIcon, User, Camera } from "lucide-react";
import { DateSelector } from "@/components/admin/player-form/date-selector";
import { CountrySelectorWithFlags } from "@/components/admin/player-form/country-selector-with-flags";

export function BasicInfoTab({
  formData,
  countries,
  isDarkMode,
  onChange,
  onDateChange,
  onCountrySelect,
  onNumberChange,
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
      <h2
        className="text-xl font-semibold mb-6 flex items-center gap-2"
        style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
      >
        <UserIcon size={20} />
        Información Básica
      </h2>

      <div className="space-y-6">
        {/* Información Personal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="fullName"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Nombre Completo *
            </Label>
            <input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={onChange}
              required
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
              htmlFor="nicknames"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Apodos (separados por coma)
            </Label>
            <input
              id="nicknames"
              name="nicknames"
              value={formData.nicknames}
              onChange={onChange}
              placeholder="Cholo, El Profe, etc."
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

        {/* Fecha de Nacimiento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateSelector
            label="Fecha de Nacimiento"
            value={formData.birthdate}
            onChange={(date) => onDateChange("birthdate", date)}
            isDarkMode={isDarkMode}
          />

          <div className="space-y-2">
            <Label
              htmlFor="appearances"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Partidos Dirigidos en San Lorenzo
            </Label>
            <input
              id="appearances"
              name="appearances"
              type="number"
              value={formData.appearances}
              onChange={onNumberChange}
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

        {/* Nacionalidad */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <CountrySelectorWithFlags
            countries={countries}
            value={formData.nationality.name}
            onChange={onCountrySelect}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Imágenes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="profileImage"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              <div className="flex items-center gap-2">
                <User size={16} />
                Imagen de Perfil
              </div>
            </Label>
            <input
              id="profileImage"
              name="profileImage"
              value={formData.profileImage}
              onChange={onChange}
              placeholder="URL de la imagen de perfil"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
            {formData.profileImage && (
              <div className="mt-2">
                <img
                  src={formData.profileImage || "/placeholder.svg"}
                  alt="Vista previa perfil"
                  className="w-16 h-16 rounded-full object-cover border-2"
                  style={{
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="actionImage"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              <div className="flex items-center gap-2">
                <Camera size={16} />
                Imagen Dirigiendo
              </div>
            </Label>
            <input
              id="actionImage"
              name="actionImage"
              value={formData.actionImage}
              onChange={onChange}
              placeholder="URL de la imagen dirigiendo"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
            {formData.actionImage && (
              <div className="mt-2">
                <img
                  src={formData.actionImage || "/placeholder.svg"}
                  alt="Vista previa dirigiendo"
                  className="w-16 h-16 rounded object-cover border-2"
                  style={{
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
