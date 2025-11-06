"use client";

import React from "react";

export default function FormationDisplay({
  formation,
  positions,
  coach,
  gameType,
  className = "",
}) {
  return (
    <div
      className={`relative bg-green-500 rounded-xl overflow-hidden ${className}`}
    >
      {/* Campo de fútbol */}
      <div className="absolute inset-0 border-2 border-white opacity-70"></div>
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white opacity-70 transform -translate-y-1/2"></div>
      <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white opacity-70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute left-1/2 bottom-0 w-24 h-10 border-2 border-white opacity-70 transform -translate-x-1/2"></div>
      <div className="absolute left-1/2 top-0 w-24 h-10 border-2 border-white opacity-70 transform -translate-x-1/2"></div>

      {/* Título de formación */}
      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs font-bold">
        {formation}
      </div>

      {/* Posiciones */}
      {positions.map((pos, index) => (
        <div
          key={index}
          className="absolute w-12 h-12 transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
        >
          <div
            className={`w-full h-full border-2 rounded-full flex flex-col items-center justify-center text-xs font-bold ${
              pos.player
                ? "bg-blue-500 border-blue-600 text-white"
                : "bg-gray-200 border-gray-300 text-gray-500"
            }`}
            title={
              pos.player ? pos.player.fullName : `${pos.position} - Vacante`
            }
          >
            <span className="text-[8px] leading-none">{pos.position}</span>
            {pos.player && (
              <span className="text-[6px] leading-none truncate w-full text-center">
                {pos.player.fullName.split(" ")[0]}
              </span>
            )}
          </div>

          {/* Indicador del club/liga */}
          {pos.player && (gameType === "national" ? pos.club : pos.league) && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border border-gray-300 rounded-full flex items-center justify-center">
              <span className="text-[6px] font-bold text-gray-700">
                {gameType === "national"
                  ? pos.club?.name?.substring(0, 2) || "??"
                  : pos.league?.name?.substring(0, 2) || "??"}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Director Técnico */}
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
              {coach.fullName.split(" ")[0]}
            </span>
          )}
        </div>
      </div>

      {/* Estadísticas en la esquina */}
      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
        <div>{positions.filter((p) => p.player).length}/11</div>
        <div className="text-[10px]">{coach ? "DT ✓" : "DT ✗"}</div>
      </div>
    </div>
  );
}
