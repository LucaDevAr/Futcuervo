"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";
import { normalizeText } from "@/lib/search-utils";

interface SelectOption {
  value: string;
  label: string;
  image?: string;
  subtitle?: string;
}

interface SearchableCustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  enableSearch?: boolean;
}

export function SearchableCustomSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  disabled = false,
  className = "",
  enableSearch = false,
}: SearchableCustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Filtrar opciones basado en búsqueda normalizada (sin acentos)
  const filteredOptions = enableSearch
    ? options.filter((option) => {
        const normalizedSearch = normalizeText(searchTerm);
        const normalizedLabel = normalizeText(option.label);
        const normalizedSubtitle = option.subtitle
          ? normalizeText(option.subtitle)
          : "";

        return (
          normalizedLabel.includes(normalizedSearch) ||
          normalizedSubtitle.includes(normalizedSearch)
        );
      })
    : options;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && enableSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, enableSearch]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm("");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (filteredOptions.length === 1) {
          handleSelect(filteredOptions[0].value);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (!enableSearch) {
          const currentIndex = filteredOptions.findIndex(
            (opt) => opt.value === value
          );
          const nextIndex =
            currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0;
          if (filteredOptions[nextIndex]) {
            onChange(filteredOptions[nextIndex].value);
          }
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen && !enableSearch) {
          const currentIndex = filteredOptions.findIndex(
            (opt) => opt.value === value
          );
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1;
          if (filteredOptions[prevIndex]) {
            onChange(filteredOptions[prevIndex].value);
          }
        }
        break;
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className} hover:text-[#fff]`}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 bg-white dark:bg-[var(--fondo-oscuro)] dark:text-white border-[var(--rojo)] dark:border-[var(--azul)] hover:bg-[var(--rojo)] hover:border-[var(--rojo)] dark:hover:bg-[var(--azul)]  dark:hover:text-white dark:hover:border-[var(--azul)] disabled:hover:bg-white disabled:hover:text-black dark:disabled:hover:bg-[var(--fondo-oscuro)] dark:disabled:hover:text-white`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0 hover:text-white">
          {selectedOption ? (
            <>
              {selectedOption.image && (
                <img
                  src={selectedOption.image || "/placeholder.svg"}
                  alt=""
                  className="w-6 h-6 object-contain flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div className="flex-1 min-w-0 text-left">
                <div className="truncate">{selectedOption.label}</div>
                {selectedOption.subtitle && (
                  <div className="text-xs truncate text-gray-500 dark:text-gray-400 group-hover:text-white hover:text-white">
                    {selectedOption.subtitle}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 group-hover:text-white">
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`transition-transform group-hover:text-white ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-80 overflow-hidden bg-white dark:bg-[var(--fondo-oscuro)] border-[var(--rojo)] dark:border-[var(--azul)] hover:text-white">
          {/* Search Input */}
          {enableSearch && (
            <div className="p-3 border-b border-[var(--rojo)] dark:border-[var(--azul)]">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-white"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={`
                    w-full pl-10 pr-8 py-2 rounded border focus:outline-none focus:ring-1 
                    transition-colors duration-200
                    bg-white dark:bg-[var(--fondo-oscuro)]
                    text-black dark:text-white
                    border-[var(--rojo)] dark:border-[var(--azul)]
                    hover:bg-[var(--rojo)] hover:text-white hover:border-[var(--rojo)]
                    dark:hover:bg-[var(--azul)] dark:hover:text-white dark:hover:border-[var(--azul)]
                    placeholder:text-gray-500 dark:placeholder:text-gray-400
                    hover:placeholder:text-white dark:hover:placeholder:text-white
                  `}
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className={`
                      absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded 
                      transition-colors duration-200
                      text-gray-500 dark:text-gray-400
                      hover:bg-[var(--rojo)] hover:text-white
                      dark:hover:bg-[var(--azul)] dark:hover:text-white
                    `}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                {enableSearch && searchTerm
                  ? "No se encontraron resultados"
                  : "No hay opciones disponibles"}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`
                    w-full px-4 py-3 flex items-center gap-3 transition-all duration-200 text-left
                    text-black dark:text-white
                    hover:bg-[var(--rojo)] hover:text-white
                    dark:hover:bg-[var(--azul)] dark:hover:text-white
                    ${
                      option.value === value
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "bg-transparent"
                    }
                  `}
                >
                  {option.image && (
                    <img
                      src={option.image || "/placeholder.svg"}
                      alt=""
                      className="w-6 h-6 object-contain flex-shrink-0"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{option.label}</div>
                    {option.subtitle && (
                      <div className="text-xs truncate text-gray-500 dark:text-gray-400 group-hover:text-white">
                        {option.subtitle}
                      </div>
                    )}
                  </div>
                  {option.value === value && (
                    <Check
                      size={16}
                      className="text-[var(--rojo)] dark:text-[var(--azul)] group-hover:text-white"
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
