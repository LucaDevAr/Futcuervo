"use client";

import { useState, useRef, useEffect } from "react";
import { User } from "lucide-react";

// --- Funciones utilitarias ---
function normalizeText(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function highlightMatches(fullName, query) {
  if (!query) return fullName;
  const normalizedQuery = normalizeText(query);
  const words = fullName.split(/(\s+)/);
  return words
    .map((word) => {
      if (word.trim() === "") return word;
      const normalizedWord = normalizeText(word);
      const matchIndex = normalizedWord.indexOf(normalizedQuery);
      if (matchIndex !== -1) {
        const beforeMatch = word.substring(0, matchIndex);
        const matchedPart = word.substring(
          matchIndex,
          matchIndex + query.length
        );
        const afterMatch = word.substring(matchIndex + query.length);
        return `${beforeMatch}<mark class="bg-[var(--primary)] dark:bg-[var(--secondary)] text-white dark:text-white">${matchedPart}</mark>${afterMatch}`;
      }
      return word;
    })
    .join("");
}

export default function CoachAutocomplete({
  value,
  onChange,
  onCoachSelect,
  placeholder,
  disabled = false,
  autoFocus = false,
  className = "",
  onValidSelectionChange,
  onSubmitTrigger,
  cachedCoaches = [],
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [hasEnteredOnce, setHasEnteredOnce] = useState(false);

  const inputRef = useRef(null);

  // --- Focus automático ---
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  // --- Avisar si hay selección válida ---
  useEffect(() => {
    onValidSelectionChange?.(!!selectedCoach);
  }, [selectedCoach, onValidSelectionChange]);

  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      // Reduced from 3 to 2 for better UX
      if (suggestions.length > 0 || showSuggestions || selectedCoach) {
        setSuggestions([]);
        setShowSuggestions(false);
        setSelectedCoach(null);
        setHasEnteredOnce(false);
      }
      return;
    }

    if (hasEnteredOnce) return;

    const normalizedQuery = normalizeText(query);
    const matches = cachedCoaches.filter((p) =>
      normalizeText(p.fullName || p.displayName || "").includes(normalizedQuery)
    );

    // Solo actualizar si los resultados son distintos
    const areEqual =
      matches.length === suggestions.length &&
      matches.every((m, i) => m._id === suggestions[i]?._id);

    if (!areEqual) {
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    }

    const exactMatch = matches.find(
      (p) =>
        normalizeText(p.fullName || p.displayName || "") === normalizedQuery
    );

    if (exactMatch && exactMatch._id !== selectedCoach?._id) {
      handleCoachSelect(exactMatch);
    } else if (!exactMatch && selectedCoach) {
      setSelectedCoach(null);
    }
  }, [value, cachedCoaches]);

  const handleInputChange = (e) => {
    onChange(e.target.value);
    setSelectedIndex(-1);
    setHasEnteredOnce(false);
  };

  const handleCoachSelect = (coach) => {
    onChange(coach.fullName || coach.displayName);
    onCoachSelect?.(coach);
    setSelectedCoach(coach);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    setHasEnteredOnce(true);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case "ArrowDown":
        if (suggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
        }
        break;
      case "ArrowUp":
        if (suggestions.length > 0) {
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
        }
        break;
      case "Enter":
        e.preventDefault();

        if (showSuggestions && suggestions.length > 0) {
          if (selectedIndex >= 0) {
            handleCoachSelect(suggestions[selectedIndex]);
          } else if (suggestions.length === 1) {
            handleCoachSelect(suggestions[0]);
          }
        } else if (value.trim().length > 0 && onSubmitTrigger) {
          if (selectedCoach) {
            onSubmitTrigger();
          } else {
            const freeCoach = {
              _id: "free-text",
              fullName: value,
              displayName: value,
              positions: [],
              nationality: { name: "" },
            };
            handleCoachSelect(freeCoach);
            setTimeout(() => onSubmitTrigger(), 0);
          }
        }
        break;
      case "Escape":
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 100);
  };

  const maxHeight = Math.min(suggestions.length, 3) * 56;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        onFocus={() => value.trim().length >= 2 && setShowSuggestions(true)}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full p-1 md:p-2 border-2 border-white/20 rounded-lg bg-[var(--secondary)] dark:bg-[var(--primary)] text-white dark:text-white text-sm md:text-base focus:border-white focus:outline-none ${className}`}
      />

      {showSuggestions &&
        suggestions.length > 0 &&
        !hasEnteredOnce &&
        inputRef.current && (
          <div
            className="fixed z-[20000] bg-[var(--secondary)] dark:bg-[var(--primary)] border-2 border-[var(--secondary)] dark:border-[var(--primary)] rounded-lg shadow-lg overflow-y-auto"
            style={{
              top: inputRef.current.getBoundingClientRect().bottom + 4,
              left: inputRef.current.getBoundingClientRect().left,
              width: inputRef.current.offsetWidth,
              maxHeight,
            }}
          >
            {suggestions.map((coach, index) => (
              <div
                key={coach._id}
                className={`flex items-center gap-3 p-2 cursor-pointer hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)]`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleCoachSelect(coach)}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex-shrink-0">
                  {coach.profileImage ? (
                    <img
                      src={coach.profileImage}
                      alt={coach.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) =>
                        (e.currentTarget.src = "/placeholder.svg")
                      }
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div
                    className="text-white font-medium text-sm"
                    dangerouslySetInnerHTML={{
                      __html: highlightMatches(coach.fullName, value),
                    }}
                  />
                  {coach.nationality?.name && (
                    <div className="text-xs text-gray-300">
                      {coach.nationality.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
