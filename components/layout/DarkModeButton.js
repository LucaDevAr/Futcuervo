"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function DarkModeButton({
  className,
  isDarkMode: isDarkModeProp,
  onToggle,
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof isDarkModeProp === "boolean") {
      setIsDarkMode(isDarkModeProp);
      return;
    }
    // Si no recibe prop, lee localStorage y sistema
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldBeDark = savedTheme === "dark" || (!savedTheme && prefersDark);

    setIsDarkMode(shouldBeDark);

    if (shouldBeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkModeProp]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    if (onToggle) onToggle();
  };

  // Si recibe className, renderiza botón con texto e ícono
  if (className) {
    return (
      <button
        onClick={toggleDarkMode}
        className={className}
        aria-label="Toggle dark mode"
        type="button"
      >
        {isDarkMode ? (
          <>
            <Sun size={16} />
            <span>Modo Claro</span>
          </>
        ) : (
          <>
            <Moon size={16} />
            <span>Modo Oscuro</span>
          </>
        )}
      </button>
    );
  }

  // Si no recibe className, botón icono simple con tooltip
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg outline-none focus:outline-none border-none bg-[var(--navbar-button-bg)] hover:bg-[var(--navbar-button-bg-hover)] text-[var(--navbar-button-text)] hover:text-[var(--navbar-button-text-hover)]"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-[var(--navbar-button-bg)] text-[var(--navbar-text-tooltip)] border-0">
          {isDarkMode ? "Modo Claro" : "Modo Oscuro"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
