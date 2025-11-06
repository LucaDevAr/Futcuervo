"use client";

import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserIcon, User, Camera } from "lucide-react";
import { DateSelector } from "./date-selector";
import { CountrySelectorWithFlags } from "./country-selector-with-flags";
import { positions } from "@/constants/positions";

export function BasicInfoTab({
  formData,
  countries,
  isDarkMode,
  onChange,
  onDateChange,
  onCountrySelect,
  onPositionToggle,
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
              htmlFor="displayName"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Nombre de Display *
            </Label>
            <input
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={onChange}
              required
              placeholder="Ej: Lionel Messi"
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

        {/* Apodos */}
        <div className="grid grid-cols-1 gap-6">
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
              placeholder="Pipi, El Mago, etc."
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

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DateSelector
            label="Fecha de Nacimiento"
            value={formData.birthdate}
            onChange={(date) => onDateChange("birthdate", date)}
            isDarkMode={isDarkMode}
          />

          <DateSelector
            label="Fecha de Debut (Carrera)"
            value={formData.debutDate}
            onChange={(date) => onDateChange("debutDate", date)}
            isDarkMode={isDarkMode}
          />

          <DateSelector
            label="Fecha de Retiro"
            value={formData.retirementDate}
            onChange={(date) => onDateChange("retirementDate", date)}
            isDarkMode={isDarkMode}
          />
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
                Imagen de Perfil (Cara)
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
                Imagen Jugando
              </div>
            </Label>
            <input
              id="actionImage"
              name="actionImage"
              value={formData.actionImage}
              onChange={onChange}
              placeholder="URL de la imagen jugando"
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
                  alt="Vista previa jugando"
                  className="w-16 h-16 rounded object-cover border-2"
                  style={{
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Posiciones */}
        <div className="space-y-4">
          <Label
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Posiciones
          </Label>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {positions.map((position) => (
              <div key={position.code} className="flex items-center space-x-2">
                <Checkbox
                  id={`position-${position.code}`}
                  checked={formData.positions.includes(position.code)}
                  onCheckedChange={() => onPositionToggle(position.code)}
                  className="data-[state=checked]:bg-[var(--azul)] dark:data-[state=checked]:bg-[var(--rojo)]"
                />
                <Label
                  htmlFor={`position-${position.code}`}
                  className="text-sm cursor-pointer"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                  title={position.name}
                >
                  {position.code}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
