"use client";

import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export function DateSelector({ label, value, onChange, isDarkMode }) {
  return (
    <div className="space-y-2">
      {label && (
        <Label
          style={{
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
          }}
        >
          {label}
        </Label>
      )}
      <div className="grid grid-cols-3 gap-2">
        {/* Día */}
        <select
          value={value ? value.getDate() : ""}
          onChange={(e) => {
            const day = Number.parseInt(e.target.value);
            if (day && value) {
              const newDate = new Date(value);
              newDate.setDate(day);
              onChange(newDate);
            } else if (day) {
              const newDate = new Date();
              newDate.setDate(day);
              onChange(newDate);
            }
          }}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: isDarkMode
              ? "var(--fondo-oscuro)"
              : "var(--blanco)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <option value="">Día</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        {/* Mes */}
        <select
          value={value ? value.getMonth() + 1 : ""}
          onChange={(e) => {
            const month = Number.parseInt(e.target.value) - 1;
            if (month >= 0 && value) {
              const newDate = new Date(value);
              newDate.setMonth(month);
              onChange(newDate);
            } else if (month >= 0) {
              const newDate = new Date();
              newDate.setMonth(month);
              onChange(newDate);
            }
          }}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: isDarkMode
              ? "var(--fondo-oscuro)"
              : "var(--blanco)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <option value="">Mes</option>
          {[
            "Enero",
            "Febrero",
            "Marzo",
            "Abril",
            "Mayo",
            "Junio",
            "Julio",
            "Agosto",
            "Septiembre",
            "Octubre",
            "Noviembre",
            "Diciembre",
          ].map((month, index) => (
            <option key={index + 1} value={index + 1}>
              {month}
            </option>
          ))}
        </select>

        {/* Año */}
        <select
          value={value ? value.getFullYear() : ""}
          onChange={(e) => {
            const year = Number.parseInt(e.target.value);
            if (year && value) {
              const newDate = new Date(value);
              newDate.setFullYear(year);
              onChange(newDate);
            } else if (year) {
              const newDate = new Date();
              newDate.setFullYear(year);
              onChange(newDate);
            }
          }}
          className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: isDarkMode
              ? "var(--fondo-oscuro)"
              : "var(--blanco)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <option value="">Año</option>
          {Array.from({ length: 85 }, (_, i) => 2025 - i).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      {value && (
        <p
          className="text-sm mt-1"
          style={{
            color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
          }}
        >
          Fecha seleccionada:{" "}
          {format(value, "dd 'de' MMMM 'de' yyyy", { locale: es })}
        </p>
      )}
    </div>
  );
}
