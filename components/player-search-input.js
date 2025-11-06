"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search } from "lucide-react";

/**
 * Componente de búsqueda de jugadores con autocomplete
 * Busca por displayName y muestra sugerencias con imagen y posiciones
 *
 * IMPORTANTE: Este componente NO hace fetches, trabaja con data local
 * Los jugadores deben ser precargados usando useGameDataPreload
 */
export function PlayerSearchInput({
  players,
  onSelectPlayer,
  placeholder = "Buscar jugador...",
  disabled = false,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filtrar jugadores según el término de búsqueda
  const filteredPlayers = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const term = searchTerm.toLowerCase();
    return players
      .filter((player) => player.displayName?.toLowerCase().includes(term))
      .slice(0, 8); // Limitar a 8 resultados
  }, [searchTerm, players]);

  // Manejar selección de jugador
  const handleSelectPlayer = (player) => {
    setSearchTerm(player.displayName);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelectPlayer(player);
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e) => {
    if (!showSuggestions || filteredPlayers.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredPlayers.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && filteredPlayers[selectedIndex]) {
          handleSelectPlayer(filteredPlayers[selectedIndex]);
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10"
        />
      </div>

      {/* Sugerencias de autocomplete */}
      {showSuggestions && filteredPlayers.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredPlayers.map((player, index) => (
            <button
              key={player.id}
              onClick={() => handleSelectPlayer(player)}
              className={`w-full flex items-center gap-3 p-3 hover:bg-accent transition-colors ${
                index === selectedIndex ? "bg-accent" : ""
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    player.profileImage || "/placeholder.svg?height=40&width=40"
                  }
                  alt={player.displayName}
                />
                <AvatarFallback>
                  {player.displayName?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">
                  {player.displayName}
                </p>
                {player.positions.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {player.positions.join(", ")}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {showSuggestions && searchTerm && filteredPlayers.length === 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg p-4"
        >
          <p className="text-sm text-muted-foreground text-center">
            No se encontraron jugadores
          </p>
        </div>
      )}
    </div>
  );
}
