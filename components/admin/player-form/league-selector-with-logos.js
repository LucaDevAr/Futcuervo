"use client";

import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { sortLeagues } from "@/lib/sorting-utils";

export function LeagueSelectorWithLogos({
  leagues,
  value,
  onChange,
  isDarkMode,
  label = "Liga",
  placeholder = "Seleccionar liga",
}) {
  // Ordenar ligas: Argentina primero, resto alfabético
  const sortedLeagues = sortLeagues(leagues);

  const options = sortedLeagues.map((league) => ({
    value: league._id,
    label: league.name,
    image: league.logoUrl,
    subtitle: league.country,
  }));

  return (
    <div className="space-y-2">
      <Label style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}>
        <div className="flex items-center gap-2">
          <Globe size={16} />
          {label}
        </div>
      </Label>

      <SearchableCustomSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        searchPlaceholder="Buscar liga..."
        enableSearch={true}
      />
    </div>
  );
}
