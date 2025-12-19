"use client";
import { Flame, Star } from "lucide-react";
import { STREAK_GAMES } from "@/services/gameTypes";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { wasPlayedToday, getLocalDateString } from "@/utils/date";

export function GameCard({ item, stats, onClick, index, imageMode = "white" }) {
  const isDark = useDarkMode(); // ✅ usa tu hook personalizado

  // 🔹 Determinar el modo actual según el tema
  const currentMode =
    typeof imageMode === "object"
      ? isDark
        ? imageMode.dark || "white"
        : imageMode.light || "black"
      : imageMode;

  // 🔹 Lógica de alternancia de color
  const isAlternate = currentMode === "alternate";
  const isAlternateReverse = currentMode === "alternate-reverse";
  const useWhite =
    currentMode === "white" ||
    (isAlternate && index % 2 === 0) ||
    (isAlternateReverse && index % 2 !== 0);
  const useBlack =
    currentMode === "black" ||
    (isAlternate && index % 2 !== 0) ||
    (isAlternateReverse && index % 2 === 0);

  const imageFilter = useWhite
    ? "brightness(0) invert(1)" // blanco
    : useBlack
    ? "brightness(0)" // negro
    : "none"; // sin filtro

  // 🔹 Colores del card
  const bgColor =
    index % 2 === 0 ? "var(--home-card-bg)" : "var(--home-card-bg-2)";
  const contrastColor =
    index % 2 === 0 ? "var(--home-stat-bg)" : "var(--home-stat-bg-2)";

  // 🔹 Datos de intentos / progreso
  const lastAttempt = stats || {};
  const attemptDate = lastAttempt.date || lastAttempt.createdAt;
  const streak = lastAttempt.streak || 0;
  const recordScore = lastAttempt.recordScore || lastAttempt.score || 0;

  const playedToday = wasPlayedToday(attemptDate);

  // Jugado ayer
  let playedYesterday = false;
  if (attemptDate) {
    const attempt = getLocalDateString(new Date(attemptDate));
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    playedYesterday = attempt === yesterdayStr;
  }

  // Intento de días anteriores
  const isOlder = attemptDate && !playedToday && !playedYesterday;

  const showStreak =
    STREAK_GAMES.includes(item.gameType) && streak > 0 && !isOlder;
  const showRecord = !STREAK_GAMES.includes(item.gameType) && recordScore > 0;

  if (!item) return null;

  const Icon = item.icon;

  return (
    <div
      onClick={onClick}
      className={`
    aspect-square
    rounded-xl lg:rounded-2xl
    p-2 sm:p-3 lg:p-4
    flex flex-col items-center justify-center
    transition-all duration-300
    hover:scale-105 hover:shadow-xl
    cursor-pointer
    shadow-lg
    text-center
    relative
  `}
      style={{ backgroundColor: bgColor }}
    >
      {playedToday && (
        <>
          {/* Borde externo (color del card) */}
          <div
            className="absolute inset-0 rounded-xl lg:rounded-2xl pointer-events-none"
            style={{
              border: `2px solid ${bgColor}`,
            }}
          />

          {/* Borde interno (color background) */}
          <div
            className="absolute inset-[4px] rounded-lg lg:rounded-xl pointer-events-none"
            style={{
              border: "6px solid var(--background)",
            }}
          />
        </>
      )}

      {/* CONTENIDO REAL DEL CARD */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        {/* todo tu contenido existente */}
        {/* 🔹 Indicador de racha o récord */}
        {(showStreak || showRecord) && (
          <div
            className="absolute top-0.5 right-0.5 sm:top-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 rounded-full px-1.5 py-0.5 text-[10px] sm:text-sm font-bold text-[var(--home-stat-text)] z-20"
            style={{ backgroundColor: contrastColor }}
          >
            {showStreak && (
              <>
                <Flame
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  style={{
                    color: "white",
                    fill: playedToday ? "white" : "transparent",
                  }}
                />
                <span>{streak}</span>
              </>
            )}
            {showRecord && (
              <>
                <Star
                  className="w-3 h-3 sm:w-4 sm:h-4"
                  style={{
                    color: "white",
                    fill: playedToday ? "white" : "transparent",
                  }}
                />
                <span>{recordScore}</span>
              </>
            )}
          </div>
        )}

        {/* 🔹 Contenedor de imágenes */}
        <div className="flex-1 flex items-center justify-center mb-2 sm:mb-3 lg:mb-4">
          {item.images?.length === 2 ? (
            <div className="flex items-center justify-center gap-2 w-full max-w-full">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 object-contain max-w-[50%]"
              />
              <img
                src={item.images[1]}
                alt={item.title}
                className="w-14 h-14 xs:w-16 xs:h-16 sm:w-20 sm:h-20 object-contain max-w-[50%]"
                style={{ filter: imageFilter }}
              />
            </div>
          ) : item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-16 md:w-24 md:h-24 lg:w-24 lg:h-24 xl:w-28 xl:h-28 object-contain"
              style={{ filter: imageFilter }}
            />
          ) : item.icon ? (
            <Icon
              className={`w-14 h-14 md:w-16 md:h-16 lg:w-16 lg:h-16 xl:w-20 xl:h-20 ${
                useWhite ? "text-white" : "text-black"
              }`}
            />
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded-full" />
          )}
        </div>

        {/* 🔹 Título */}
        <p className="text-xs sm:text-sm md:text-base font-semibold text-[var(--home-card-text)]">
          {item.title}
        </p>
      </div>
    </div>
  );
}
