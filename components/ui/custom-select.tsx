"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  image?: string;
  subtitle?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  isDarkMode: boolean;
  className?: string;
}

export function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  isDarkMode,
  className = "",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        setIsOpen(!isOpen);
        break;
      case "Escape":
        setIsOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Navigate to next option
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const nextIndex =
            currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          onChange(options[nextIndex].value);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (isOpen) {
          // Navigate to previous option
          const currentIndex = options.findIndex((opt) => opt.value === value);
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          onChange(options[prevIndex].value);
        }
        break;
    }
  };

  return (
    <div ref={selectRef} className={`relative ${className}`}>
      {/* Selected Value Display */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isDarkMode ? "var(--fondo-oscuro)" : "var(--blanco)",
          color: isDarkMode ? "var(--blanco)" : "var(--negro)",
          borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
        }}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
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
                  <div
                    className="text-xs truncate"
                    style={{
                      color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                    }}
                  >
                    {selectedOption.subtitle}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span
              style={{
                color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
              }}
            >
              {placeholder}
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          style={{ color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)" }}
        />
      </button>

      {/* Dropdown Options */}
      {isOpen && (
        <div
          className="absolute top-full left-0 right-0 mt-1 border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
          style={{
            backgroundColor: isDarkMode
              ? "var(--fondo-oscuro)"
              : "var(--blanco)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          {options.length === 0 ? (
            <div
              className="px-4 py-3 text-center"
              style={{
                color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
              }}
            >
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:opacity-80 transition-opacity text-left"
                style={{
                  backgroundColor:
                    option.value === value
                      ? isDarkMode
                        ? "var(--azul-oscuro)"
                        : "var(--gris-claro)"
                      : "transparent",
                }}
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
                  <div
                    className="truncate"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {option.label}
                  </div>
                  {option.subtitle && (
                    <div
                      className="text-xs truncate"
                      style={{
                        color: isDarkMode
                          ? "var(--gris)"
                          : "var(--gris-oscuro)",
                      }}
                    >
                      {option.subtitle}
                    </div>
                  )}
                </div>
                {option.value === value && (
                  <Check
                    size={16}
                    style={{
                      color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    }}
                  />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
