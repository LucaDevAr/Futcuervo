"use client";

import React from "react";

export default function FormationDisplay({
  formation,
  positions,
  coach,
  gameType,
  className = "",
}) {
  const isNational = gameType === "national";
  const playerCount = positions.reduce(
    (acc, p) => (p.player ? acc + 1 : acc),
    0
  );

  return (
    <div
      className={`relative bg-green-500 rounded-xl overflow-hidden ${className}`}
    >
      {/* Campo */}
      <div className="absolute inset-0 border-2 border-white opacity-70"></div>
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white opacity-70 -translate-y-1/2"></div>
      <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white opacity-70 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute left-1/2 bottom-0 w-24 h-10 border-2 border-white opacity-70 -translate-x-1/2"></div>
      <div className="absolute left-1/2 top-0 w-24 h-10 border-2 border-white opacity-70 -translate-x-1/2"></div>

      {/* Título */}
      <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold">
        {formation}
      </div>

      {/* Posiciones */}
      {positions.map((pos, index) => {
        const hasPlayer = !!pos.player;
        const playerName = hasPlayer
          ? pos.player.fullName.split(" ", 1)[0]
          : null;

        const teamName = hasPlayer
          ? isNational
            ? pos.club?.name
            : pos.league?.name
          : null;

        const badge =
          teamName?.length > 1 ? teamName.substring(0, 2).toUpperCase() : "??";

        return (
          <div
            key={index}
            className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {/* Círculo jugador */}
            <div
              className={`w-full h-full border-2 rounded-full flex flex-col items-center justify-center text-xs font-bold ${
                hasPlayer
                  ? "bg-blue-500 border-blue-600 text-white"
                  : "bg-gray-200 border-gray-300 text-gray-500"
              }`}
              title={
                hasPlayer ? pos.player.fullName : `${pos.position} - Vacante`
              }
            >
              <span className="text-[8px] leading-none">{pos.position}</span>

              {hasPlayer && (
                <span className="text-[6px] leading-none truncate w-full text-center">
                  {playerName}
                </span>
              )}
            </div>

            {/* Badge */}
            {hasPlayer && teamName && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center">
                <span className="text-[6px] font-bold text-gray-700">
                  {badge}
                </span>
              </div>
            )}
          </div>
        );
      })}

      {/* DT */}
      <div className="absolute bottom-2 right-2 w-12 h-12 rounded-full flex flex-col items-center justify-center text-xs font-bold">
        <div
          className={`w-full h-full border-2 rounded-full flex flex-col items-center justify-center ${
            coach
              ? "bg-yellow-400 border-yellow-500 text-yellow-800"
              : "bg-gray-200 border-gray-300 text-gray-500"
          }`}
          title={coach ? coach.fullName : "DT - Vacante"}
        >
          <span className="text-[8px] leading-none">DT</span>

          {coach && (
            <span className="text-[6px] leading-none truncate w-full text-center">
              {coach.fullName.split(" ", 1)[0]}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
        <div>{playerCount}/11</div>
        <div className="text-[10px]">{coach ? "DT ✓" : "DT ✗"}</div>
      </div>
    </div>
  );
}
