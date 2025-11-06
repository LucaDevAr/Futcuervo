"use client";

import { useRef, useEffect, useState } from "react";
import { AlertCircle, User, Heart, Clock } from "lucide-react";
import { useMediaQuery } from "react-responsive";
import PlayerAutocomplete from "@/components/player-autocomplete";

// Formaciones desktop
export const FORMATIONS_DESKTOP = {
  "4-4-2": [
    { position: "PO", x: 50, y: 92 },
    { position: "LD", x: 88, y: 65 },
    { position: "CT", x: 38, y: 70 },
    { position: "CT", x: 62, y: 70 },
    { position: "LI", x: 12, y: 65 },
    { position: "MD", x: 80, y: 45 },
    { position: "MC", x: 40, y: 50 },
    { position: "MC", x: 60, y: 50 },
    { position: "MI", x: 20, y: 45 },
    { position: "DC", x: 40, y: 22 },
    { position: "DC", x: 60, y: 22 },
  ],
  "4-3-3": [
    { position: "PO", x: 50, y: 92 },
    { position: "LD", x: 88, y: 65 },
    { position: "CT", x: 38, y: 70 },
    { position: "CT", x: 62, y: 70 },
    { position: "LI", x: 12, y: 65 },
    { position: "MCD", x: 50, y: 55 },
    { position: "MC", x: 35, y: 45 },
    { position: "MC", x: 65, y: 45 },
    { position: "ED", x: 80, y: 25 },
    { position: "DC", x: 50, y: 22 },
    { position: "EI", x: 20, y: 25 },
  ],
  "3-5-2": [
    { position: "PO", x: 50, y: 92 },
    { position: "CT", x: 30, y: 70 },
    { position: "CT", x: 50, y: 73 },
    { position: "CT", x: 70, y: 70 },
    { position: "MD", x: 80, y: 45 },
    { position: "MC", x: 40, y: 50 },
    { position: "MCD", x: 50, y: 58 },
    { position: "MC", x: 60, y: 50 },
    { position: "MI", x: 20, y: 45 },
    { position: "DC", x: 40, y: 22 },
    { position: "DC", x: 60, y: 22 },
  ],
  "5-3-2": [
    { position: "PO", x: 50, y: 92 },
    { position: "LD", x: 90, y: 65 },
    { position: "CT", x: 30, y: 70 },
    { position: "CT", x: 50, y: 73 },
    { position: "CT", x: 70, y: 70 },
    { position: "LI", x: 10, y: 65 },
    { position: "MC", x: 30, y: 50 },
    { position: "MCD", x: 50, y: 55 },
    { position: "MC", x: 70, y: 50 },
    { position: "DC", x: 40, y: 22 },
    { position: "DC", x: 60, y: 22 },
  ],
};

// Formaciones mobile
export const FORMATIONS_MOBILE = {
  "4-4-2": [
    { position: "PO", x: 8, y: 50 },
    { position: "LD", x: 35, y: 88 },
    { position: "CT", x: 30, y: 38 },
    { position: "CT", x: 30, y: 62 },
    { position: "LI", x: 35, y: 12 },
    { position: "MD", x: 55, y: 80 },
    { position: "MC", x: 50, y: 40 },
    { position: "MC", x: 50, y: 60 },
    { position: "MI", x: 55, y: 20 },
    { position: "DC", x: 78, y: 40 },
    { position: "DC", x: 78, y: 60 },
  ],
  "4-3-3": [
    { position: "PO", x: 8, y: 50 },
    { position: "LD", x: 35, y: 88 },
    { position: "CT", x: 30, y: 38 },
    { position: "CT", x: 30, y: 62 },
    { position: "LI", x: 35, y: 12 },
    { position: "MCD", x: 45, y: 50 },
    { position: "MC", x: 55, y: 75 },
    { position: "MC", x: 55, y: 25 },
    { position: "ED", x: 75, y: 80 },
    { position: "DC", x: 78, y: 50 },
    { position: "EI", x: 75, y: 20 },
  ],
  "3-5-2": [
    { position: "PO", x: 8, y: 50 },
    { position: "CT", x: 30, y: 70 },
    { position: "CT", x: 27, y: 50 },
    { position: "CT", x: 30, y: 30 },
    { position: "MD", x: 55, y: 80 },
    { position: "MC", x: 50, y: 60 },
    { position: "MCD", x: 42, y: 50 },
    { position: "MC", x: 50, y: 40 },
    { position: "MI", x: 55, y: 20 },
    { position: "DC", x: 78, y: 40 },
    { position: "DC", x: 78, y: 60 },
  ],
  "5-3-2": [
    { position: "PO", x: 8, y: 50 },
    { position: "LD", x: 35, y: 90 },
    { position: "CT", x: 30, y: 70 },
    { position: "CT", x: 27, y: 50 },
    { position: "CT", x: 30, y: 30 },
    { position: "LI", x: 35, y: 10 },
    { position: "MC", x: 50, y: 70 },
    { position: "MCD", x: 45, y: 50 },
    { position: "MC", x: 50, y: 30 },
    { position: "DC", x: 78, y: 40 },
    { position: "DC", x: 78, y: 60 },
  ],
};

export default function TeamGameScreen(props) {
  const {
    gameType,
    gameMode,
    timeLeft,
    lives,
    formation,
    positions,
    coach,
    currentTarget,
    needsCoach,
    usedTargets,
    usedPlayers,
    playerInput,
    coachInput,
    isSubmitting,
    gameOver,
    gameWon,
    errorMessage,
    currentPlayer,
    availablePositions,
    selectedPosition,
    gameStartTime,
    onPlayerInputChange,
    onCoachInputChange,
    onPlayerSubmit,
    onCoachSubmit,
    onPositionSelect,
    onConfirmPosition,
    formatTime,
    gameLogic,
    positionErrorMessage,
    cachedPlayers = [], // Add cachedPlayers prop
    validPlayersForCurrentClub = [], // Add validPlayersForCurrentClub prop
  } = props;

  const playerInputRef = useRef(null);
  const coachInputRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });
  const [isPlayerValid, setIsPlayerValid] = useState(false);

  const selectedFormationLayout = isMobile
    ? FORMATIONS_MOBILE[formation]
    : FORMATIONS_DESKTOP[formation];

  useEffect(() => {
    if (!needsCoach && !currentPlayer && playerInputRef.current) {
      playerInputRef.current.focus();
    }
  }, [currentTarget, needsCoach, currentPlayer]);

  useEffect(() => {
    if (needsCoach && coachInputRef.current) {
      coachInputRef.current.focus();
    }
  }, [needsCoach, currentTarget]);

  const getVacantPositions = () =>
    positions.filter((pos) => !pos.player).map((pos) => pos.position);

  const getTargetName = () => currentTarget?.name || "";

  const getTargetLogo = () =>
    gameType === "league" ? currentTarget?.logoUrl : currentTarget?.logo;

  const getTargetCountry = () =>
    gameType === "league"
      ? currentTarget?.country
      : currentTarget?.league?.country;

  const handleSubmitTrigger = () => {
    if (isPlayerValid && !isSubmitting) {
      const syntheticEvent = { preventDefault: () => {} };
      onPlayerSubmit(syntheticEvent);
    }
  };

  if ((!currentTarget && !gameOver) || errorMessage) {
    return (
      <>
        <div className="h-screen flex items-center justify-center dark:text-[var(--blanco)] py-[56px] md:py-[64px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-[var(--rojo)]" />
            <p className="mb-4">{errorMessage || "Error al cargar el juego"}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[var(--btn-bg)] dark:bg-[var(--btn-bg)] text-white rounded-md hover:opacity-90"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="h-[calc(100vh-64px)] max-h-screen flex flex-col md:flex-row">
        {/* Campo de fútbol */}
        <div className="w-full md:w-1/2 flex items-center justify-center relative h-[40%] md:h-full p-2 md:p-4">
          {/* Este div ahora controla la dirección flex para el campo y el DT */}
          <div className="flex flex-row items-center justify-center gap-2 h-[80%] w-full">
            {/* Campo de juego */}
            <div
              className="relative bg-green-100 dark:bg-green-900 rounded-xl p-1 md:p-2
              w-[90%] max-w-[250px] sm:max-w-[300px] md:max-w-[350px] aspect-[4/2.5] md:w-auto md:h-[80%] lg:h-full md:aspect-[3/4] flex-shrink-0 border-2 border-white border-opacity-80"
            >
              <div className="absolute inset-0 bg-green-500 rounded-xl">
                {/* Líneas del campo */}
                {/* <div className="absolute inset-0 border-2 border-white opacity-70"></div> */}
                {/* Center line */}
                <div
                  className={`absolute bg-white opacity-70 ${
                    !isMobile
                      ? "top-1/2 left-0 right-0 h-0.5 transform -translate-y-1/2"
                      : "top-0 bottom-0 left-1/2 w-0.5 transform -translate-x-1/2"
                  }`}
                ></div>
                {/* Center circle */}
                <div className="absolute left-1/2 top-1/2 w-16 h-16 md:w-24 md:h-24 border-2 border-white opacity-70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                {/* Penalty boxes */}
                <div
                  className={`absolute border-2 border-white opacity-70 ${
                    isMobile
                      ? "top-1/2 left-0 h-24 w-10 transform -translate-y-1/2"
                      : "bottom-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                  }`}
                ></div>
                <div
                  className={`absolute border-2 border-white opacity-70 ${
                    isMobile
                      ? "top-1/2 right-0 h-24 w-10 transform -translate-y-1/2"
                      : "top-0 left-1/2 w-32 h-12 transform -translate-x-1/2"
                  }`}
                ></div>
                {/* Jugadores */}
                {positions.map((posData, index) => {
                  // Find the corresponding layout position for the current player's position
                  // We need to find the Nth occurrence if there are multiple players with the same position string
                  const layoutPosition = selectedFormationLayout.filter(
                    (layout) => layout.position === posData.position
                  )[
                    positions
                      .slice(0, index)
                      .filter((p) => p.position === posData.position).length
                  ];

                  // If a layout position is found, use its x and y. Otherwise, default to posData's x and y
                  const displayX = layoutPosition
                    ? layoutPosition.x
                    : posData.x;
                  const displayY = layoutPosition
                    ? layoutPosition.y
                    : posData.y;

                  return (
                    <div
                      key={`${posData.position}-${index}`} // Use index in the key for uniqueness
                      className="absolute w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14 transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${displayX}%`, top: `${displayY}%` }}
                    >
                      <div className="relative w-full h-full">
                        <div className="absolute inset-0 rounded-full shadow-md overflow-hidden bg-gray-200 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                          {posData.player ? (
                            posData.player.profileImage ? (
                              <img
                                src={
                                  posData.player.profileImage ||
                                  "/placeholder.svg" ||
                                  "/placeholder.svg"
                                }
                                alt={posData.player.fullName}
                                className="w-full h-full object-cover rounded-full"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg";
                                  e.currentTarget.onerror = null;
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-white border-2 border-[var(--azul)] dark:border-[var(--rojo)] rounded-full">
                                <User className="h-4 w-4 md:h-5 md:w-5 text-gray-500 dark:text-gray-400" />
                              </div>
                            )
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-full">
                              <span className="text-[8px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400">
                                {posData.position}
                              </span>
                            </div>
                          )}
                        </div>
                        {(gameType === "league" && posData.league?.logoUrl) ||
                        (gameType === "national" && posData.club?.logo) ? (
                          <div className="absolute -top-1 -right-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full p-0.5 shadow-md">
                            <img
                              src={
                                gameType === "league"
                                  ? posData.league?.logoUrl ||
                                    "/placeholder.svg"
                                  : posData.club?.logo || "/placeholder.svg"
                              }
                              alt={
                                gameType === "league"
                                  ? posData.league?.name || ""
                                  : posData.club?.name || ""
                              }
                              className="w-full h-full object-contain rounded-full"
                              onError={(e) => {
                                e.currentTarget.src = "/placeholder.svg";
                                e.currentTarget.onerror = null;
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* DT */}
            <div className="flex flex-col items-center justify-center min-w-[40px] md:min-w-[120px] h-auto md:h-full ml-2 md:ml-0 lg:ml-4">
              <div className="w-10 h-10 md:w-14 md:h-14 mb-1 md:mb-2 flex-shrink-0">
                <div className="relative w-full h-full">
                  <div className="absolute inset-0 rounded-full shadow-md overflow-hidden bg-white border-2 border-[var(--dt-border)] dark:border-[var(--dt-border)]">
                    {coach?.profileImage ? (
                      <img
                        src={coach.profileImage || "/placeholder.svg"}
                        alt={coach.fullName}
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                          e.currentTarget.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded-full">
                        <User className="h-5 w-5 md:h-6 md:w-6 text-gray-500 dark:text-gray-400" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <span className="text-[9px] md:text-xs font-bold text-black dark:text-[var(--blanco)] text-center max-w-[60px] md:max-w-[100px] leading-tight">
                {coach ? `DT: ${coach.fullName}` : "DT: ?"}
              </span>
            </div>
          </div>
        </div>
        {/* Panel de control */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-1 px-3 md:p-3 bg-[var(--panel-screen-bg)] dark:bg-[var(--panel-screen-bg)] h-[60%] max-h-[60%] md:h-full md:max-h-full">
          <h3 className="hidden md:block text-xl md:text-2xl font-bold text-white mb-1 md:mb-2">
            {gameType === "league" ? "Liga Mundial" : "Equipo Nacional"}
          </h3>
          {/* Indicadores de modo de juego */}
          <div className="w-full max-w-md md:mb-2">
            <div className="flex justify-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-4">
                {gameMode === "lives" ? (
                  <div className="flex items-center gap-.5 md:gap-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Heart
                        key={index}
                        size={20}
                        className={`${
                          index < (lives || 0)
                            ? "text-red-500 fill-red-500 dark:text-blue-900 dark:fill-blue-900"
                            : "text-white opacity-30"
                        } h-4`}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 md:gap-2 text-[var(--blanco)]">
                    <Clock size={20} />
                    <span className="text-lg md:text-xl font-bold">
                      {gameLogic
                        ? gameLogic.formatTime(gameLogic.timeLeft)
                        : formatTime(timeLeft || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="w-full max-w-md">
            {/* Target actual */}
            <div className="p-2 md:p-3 rounded-xl bg-[var(--panel-screen-card-bg)] dark:bg-[var(--panel-screen-card-bg)] shadow-lg mb-2 md:mb-3">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-lg p-1 md:p-2 flex items-center justify-center mb-1 md:mb-2 bg-white">
                  {getTargetLogo() ? (
                    <img
                      src={getTargetLogo() || "/placeholder.svg"}
                      alt={getTargetName()}
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-8 h-8 md:w-14 md:h-14 bg-white rounded-full flex items-center justify-center">
                      <span className="text-sm md:text-base text-[var(--azul)] dark:text-[var(--rojo)] font-bold">
                        {getTargetName().substring(0, 2)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center gap-2 md:flex-col md:gap-0">
                  <h2 className="text-sm md:text-lg font-bold text-white">
                    {getTargetName()}
                  </h2>
                  <p className="text-xs md:text-sm text-white/80">
                    {getTargetCountry()}
                  </p>
                </div>
                <p className="text-xs md:text-sm text-white/80 mt-1">
                  {needsCoach
                    ? "Elige Director Técnico"
                    : `${getVacantPositions().length} posiciones restantes`}
                </p>
              </div>
            </div>

            {/* Conditional rendering for Player/Coach input vs. Position Selector */}
            {needsCoach ? (
              // Coach Input Form
              <div className="p-2 md:p-3 rounded-xl bg-[var(--rojo)] dark:bg-[var(--azul)] shadow-lg">
                <form onSubmit={onCoachSubmit}>
                  <div className="mb-1 md:mb-3">
                    <input
                      ref={coachInputRef}
                      type="text"
                      value={coachInput}
                      onChange={(e) => onCoachInputChange(e.target.value)}
                      placeholder={`Director Técnico que haya dirigido en ${getTargetName()}...`}
                      className="w-full p-1 md:p-2 border-2 border-white/20 rounded-lg bg-white text-black text-sm md:text-base focus:border-white focus:outline-none"
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting || !coachInput.trim()}
                    className="w-full py-1.5 md:py-2 bg-white text-[var(--azul)] dark:text-[var(--rojo)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors hover:opacity-90 text-xs md:text-base"
                  >
                    {isSubmitting ? "Validando..." : "Agregar Director Técnico"}
                  </button>
                </form>
              </div>
            ) : currentPlayer && availablePositions.length > 0 ? (
              // Position Selector UI
              <div className="w-full max-w-md mb-2 md:mb-3">
                <div className="p-2 md:p-3 rounded-xl bg-[var(--rojo)] dark:bg-[var(--azul)] shadow-lg">
                  <h4 className="text-white font-bold mb-1 md:mb-2 text-center text-xs md:text-sm">
                    {currentPlayer.fullName}:
                  </h4>
                  <div className="flex flex-wrap justify-center gap-1 md:gap-2 mb-1 md:mb-2">
                    {availablePositions.map((pos) => (
                      <label
                        key={pos}
                        className="flex items-center gap-1 px-2 py-0.5 md:px-3 md:py-1 rounded-lg bg-white cursor-pointer hover:opacity-90 transition-opacity"
                      >
                        <input
                          type="radio"
                          name="position"
                          value={pos}
                          checked={selectedPosition === pos}
                          onChange={() => onPositionSelect(pos)}
                          className="h-2.5 w-2.5 md:h-3 md:w-3 text-[var(--azul)] dark:text-[var(--rojo)]"
                        />
                        <span className="text-xs md:text-sm text-[var(--azul)] dark:text-[var(--rojo)] font-bold">
                          {pos}
                        </span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={onConfirmPosition}
                    className="w-full py-1 bg-white text-[var(--azul)] dark:text-[var(--rojo)] rounded-lg hover:opacity-90 font-medium text-xs md:text-sm"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            ) : (
              // Player Input Form (shown when not needing coach AND no player is currently being positioned)
              <div className="p-2 md:p-3 rounded-xl bg-[var(--rojo)] dark:bg-[var(--azul)] shadow-lg">
                <form onSubmit={onPlayerSubmit}>
                  <div className="mb-1 md:mb-3">
                    <PlayerAutocomplete
                      value={playerInput}
                      onChange={onPlayerInputChange}
                      onPlayerSelect={(p) => console.log("Seleccionado:", p)}
                      placeholder={`Jugador que haya jugado en ${getTargetName()}...`}
                      disabled={isSubmitting}
                      onValidSelectionChange={(v) => setIsPlayerValid(v)}
                      onSubmitTrigger={handleSubmitTrigger}
                      cachedPlayers={cachedPlayers} // Pass all cached players for suggestions, not just valid ones
                    />

                    <button
                      type="submit"
                      disabled={!isPlayerValid || isSubmitting}
                      className="w-full py-1.5 md:py-2 bg-white text-[var(--azul)] dark:text-[var(--rojo)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors hover:opacity-90 text-xs md:text-base mt-2"
                    >
                      {isSubmitting ? "Validando..." : "Agregar Jugador"}
                    </button>
                    {positionErrorMessage && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <p className="text-red-800 dark:text-white text-sm font-medium">
                          {positionErrorMessage}
                        </p>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
