"use client";

import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";

export function CountrySelectorWithFlags({
  countries,
  value,
  onChange,
  isDarkMode,
  label = "Nacionalidad",
  placeholder = "Seleccionar país",
}) {
  // Ordenar países: Argentina primero, resto alfabético
  const sortedCountries = [...countries].sort((a, b) => {
    if (a.name.toLowerCase() === "argentina") return -1;
    if (b.name.toLowerCase() === "argentina") return 1;
    return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
  });

  const options = sortedCountries.map((country) => ({
    value: country.name,
    label: country.name,
    image: country.flag,
    subtitle: "", // No necesitamos subtítulo para países
  }));

  const handleChange = (countryName) => {
    onChange(countryName, countries);
  };

  return (
    <div className="space-y-2">
      <Label style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}>
        <div className="flex items-center gap-2">
          <Flag size={16} />
          {label}
        </div>
      </Label>

      <SearchableCustomSelect
        options={options}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        searchPlaceholder="Buscar país..."
        enableSearch={true}
      />
    </div>
  );
}
