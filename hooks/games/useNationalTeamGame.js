"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { FORMATIONS } from "@/constants/formations";

function normalizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

const highProbabilityClubs = [
  "CA River Plate",
  "CA Boca Juniors",
  "CA Independiente",
  "Racing Club",
  "Club Estudiantes de La Plata",
  "CA Vélez Sarsfield",
  "CA Huracán",
  "CA Rosario Central",
  "CA Newell's Old Boys",
  "Club de Gimnasia y Esgrima La Plata",
];

const lowProbabilityClubs = [
  "Club Deportivo Riestra",
  "CA San Martín (San Juan)",
  "CA Aldosivi",
  "CS Independiente Rivadavia",
  "CA Central Córdoba (SdE)",
  "CA Barracas Central",
  "Instituto ACC",
  "CA Sarmiento (Junín)",
  "CA Platense",
  "CD Godoy Cruz Antonio Tomba",
];

const regularFactor = 1;
const highFactor = 3;
const lowFactor = 0.33;

function getClubWeight(clubName) {
  const nameLower = normalizeText(clubName);
  if (highProbabilityClubs.some((c) => normalizeText(c) === nameLower))
    return highFactor;
  if (lowProbabilityClubs.some((c) => normalizeText(c) === nameLower))
    return lowFactor;
  return regularFactor;
}

export function useNationalTeamGame({
  gameMode,
  clubId,
  preloadedPlayers = [],
  preloadedClubs = [],
  preloadedCoaches = [],
  gameLogic,
  onIncorrectAnswer,
}) {
  const [formation, setFormation] = useState("");
  const [positions, setPositions] = useState([]);
  const [coach, setCoach] = useState(null);
  const coachRef = useRef(null);
  const [currentClub, setCurrentClub] = useState(null);
  const [needsCoach, setNeedsCoach] = useState(false);
  const [usedClubs, setUsedClubs] = useState([]);
  const [usedPlayers, setUsedPlayers] = useState([]);
  const [playerInput, setPlayerInput] = useState("");
  const [coachInput, setCoachInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [availablePositions, setAvailablePositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState("");
  const [possiblePlayersOnFail, setPossiblePlayersOnFail] = useState([]);
  const [positionErrorMessage, setPositionErrorMessage] = useState(null);

  const [sanLorenzoPlayers, setSanLorenzoPlayers] = useState([]);
  const [argentineClubs, setArgentineClubs] = useState([]);

  useEffect(() => {
    console.log("[v0] useNationalTeamGame - preloaded data:", {
      players: preloadedPlayers.length,
      clubs: preloadedClubs.length,
    });

    const slPlayers = preloadedPlayers.filter((player) => {
      if (!player.career || !Array.isArray(player.career)) return false;
      return player.career.some((careerEntry) => {
        const clubName = careerEntry.club?.name || "";
        return normalizeText(clubName).includes("san lorenzo");
      });
    });

    console.log("[v0] Filtered San Lorenzo players:", slPlayers.length);
    setSanLorenzoPlayers(slPlayers);

    const ARGENTINE_LEAGUE_ID = "68429abb587b60bfbe493429";
    const argClubs = preloadedClubs.filter((club) => {
      const isSanLorenzo = normalizeText(club.name).includes("san lorenzo");
      const isArgentineLeague = club.league === ARGENTINE_LEAGUE_ID;
      return isArgentineLeague && !isSanLorenzo;
    });

    console.log(
      "[v0] Filtered Argentine Primera División clubs (excluding San Lorenzo):",
      argClubs.length
    );
    setArgentineClubs(argClubs);
  }, [preloadedPlayers, preloadedClubs]);

  const getVacantPositions = useCallback(() => {
    return positions.filter((pos) => !pos.player).map((pos) => pos.position);
  }, [positions]);

  const getNextValidClub = useCallback(
    (currentUsedClubs, currentUsedPlayers, currentVacantPositions) => {
      const clubsToUse = currentUsedClubs || usedClubs;
      const playersToUse = currentUsedPlayers || usedPlayers;
      const positionsToUse = currentVacantPositions || getVacantPositions();

      console.log("[v0] getNextValidClub called:", {
        clubsToUse: clubsToUse.length,
        playersToUse: playersToUse.length,
        positionsToUse,
        availableClubs: argentineClubs.length,
        sanLorenzoPlayers: sanLorenzoPlayers.length,
      });

      if (argentineClubs.length === 0 || sanLorenzoPlayers.length === 0) {
        console.log("[v0] No data available:", {
          argentineClubs: argentineClubs.length,
          sanLorenzoPlayers: sanLorenzoPlayers.length,
        });
        setErrorMessage("No hay datos suficientes para iniciar el juego");
        return null;
      }

      const availableClubs = argentineClubs.filter(
        (club) => !clubsToUse.includes(club._id)
      );

      if (availableClubs.length === 0) {
        setErrorMessage("No hay más clubes disponibles");
        return null;
      }

      const weightedClubs = [];
      availableClubs.forEach((club) => {
        const weight = getClubWeight(club.name);
        for (let i = 0; i < Math.round(weight * 10); i++) {
          weightedClubs.push(club);
        }
      });

      const shuffledClubs = weightedClubs.sort(() => Math.random() - 0.5);

      for (const club of shuffledClubs) {
        const validPlayers = sanLorenzoPlayers.filter((player) => {
          const playedInClub = player.career?.some(
            (careerEntry) => careerEntry.club?._id === club._id
          );
          if (!playedInClub) return false;

          if (playersToUse.includes(player._id)) return false;

          const hasAvailablePosition = player.positions?.some((pos) =>
            positionsToUse.includes(pos)
          );
          return hasAvailablePosition;
        });

        if (validPlayers.length > 0) {
          console.log(
            "[v0] Selected club:",
            club.name,
            "with",
            validPlayers.length,
            "valid players"
          );
          setCurrentClub(club);
          return club;
        }
      }

      setErrorMessage(
        "No hay clubes con jugadores válidos para las posiciones restantes"
      );
      return null;
    },
    [
      usedClubs,
      usedPlayers,
      getVacantPositions,
      argentineClubs,
      sanLorenzoPlayers,
    ]
  );

  const getPossiblePlayers = useCallback(
    (clubId, vacantPositions) => {
      const players = sanLorenzoPlayers.filter((player) => {
        const playedInClub = player.career?.some(
          (careerEntry) => careerEntry.club?._id === clubId
        );
        if (!playedInClub) return false;

        if (!player.fullName || !player.positions) return false;

        const availablePositions = vacantPositions.filter((pos) =>
          player.positions.includes(pos)
        );

        return availablePositions.length > 0;
      });

      return players
        .map((player) => ({
          ...player,
          availablePositions: [
            ...new Set(
              vacantPositions.filter((pos) => player.positions.includes(pos))
            ),
          ],
        }))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    },
    [sanLorenzoPlayers]
  );

  const getValidPlayersForCurrentClub = useCallback(() => {
    if (!currentClub) return [];

    const vacantPositions = getVacantPositions();

    return sanLorenzoPlayers.filter((player) => {
      const playedInClub = player.career?.some(
        (careerEntry) => careerEntry.club?._id === currentClub._id
      );
      if (!playedInClub) return false;

      if (usedPlayers.includes(player._id)) return false;

      const hasAvailablePosition = player.positions?.some((pos) =>
        vacantPositions.includes(pos)
      );
      return hasAvailablePosition;
    });
  }, [currentClub, sanLorenzoPlayers, usedPlayers, getVacantPositions]);

  const validatePlayer = useCallback(
    (playerName, clubId, usedPlayers, vacantPositions) => {
      const normalizedInput = normalizeText(playerName);

      const matches = sanLorenzoPlayers.filter((player) => {
        if (!player.displayName && !player.fullName) return false;
        const normalizedDisplayName = normalizeText(player.displayName || "");
        const normalizedFullName = normalizeText(player.fullName || "");

        return (
          normalizedDisplayName === normalizedInput ||
          normalizedFullName === normalizedInput
        );
      });

      if (matches.length === 0) {
        return {
          valid: false,
          message:
            "Jugador no encontrado. Verificá que el nombre sea correcto o completo.",
          errorType: "player_not_found",
        };
      }

      if (matches.length > 1) {
        return {
          valid: false,
          message: "Nombre ambiguo. Especificá más datos del jugador.",
          errorType: "ambiguous_name",
        };
      }

      const matchedPlayer = matches[0];

      if (usedPlayers.includes(matchedPlayer._id)) {
        return {
          valid: false,
          message: "Este jugador ya fue usado en el juego",
          errorType: "player_already_used",
        };
      }

      const clubPath = matchedPlayer.career?.find(
        (careerEntry) => careerEntry.club?._id === clubId
      );

      if (!clubPath) {
        return {
          valid: false,
          message: "Este jugador no jugó en este equipo",
          errorType: "incorrect_club",
        };
      }

      const availablePositions = matchedPlayer.positions.filter((pos) =>
        vacantPositions.includes(pos)
      );

      if (availablePositions.length === 0) {
        return {
          valid: false,
          message:
            "No hay posiciones disponibles en la formación para este jugador",
          errorType: "position_unavailable",
          player: matchedPlayer,
          club: clubPath.club,
        };
      }

      return {
        valid: true,
        message: `${matchedPlayer.fullName} es válido`,
        player: matchedPlayer,
        club: clubPath.club,
        availablePositions,
      };
    },
    [sanLorenzoPlayers]
  );

  const getNextValidClubForCoach = useCallback(() => {
    const coachesInSanLorenzo = preloadedCoaches.filter((coach) =>
      coach.careerPath?.some((entry) =>
        normalizeText(entry.club?.name || "").includes("san lorenzo")
      )
    );

    if (coachesInSanLorenzo.length === 0) {
      setErrorMessage("No hay entrenadores que hayan dirigido en San Lorenzo");
      return null;
    }

    const availableClubs = argentineClubs.filter(
      (club) => !usedClubs.includes(club._id)
    );

    if (availableClubs.length === 0) {
      setErrorMessage("No quedan clubes disponibles para el DT");
      return null;
    }

    const weightedClubs = [];
    availableClubs.forEach((club) => {
      const weight = getClubWeight(club.name);
      for (let i = 0; i < Math.round(weight * 10); i++) {
        weightedClubs.push(club);
      }
    });

    const shuffled = weightedClubs.sort(() => Math.random() - 0.5);

    for (const club of shuffled) {
      const coachesThatFit = coachesInSanLorenzo.filter((coach) =>
        coach.careerPath?.some((entry) => entry.club?._id === club._id)
      );

      if (coachesThatFit.length > 0) {
        console.log("[DT] Club seleccionado:", club.name);
        setCurrentClub(club);
        return club;
      }
    }

    setErrorMessage("No hay entrenadores válidos para los clubes restantes");
    return null;
  }, [preloadedCoaches, argentineClubs, usedClubs]);

  const validateCoach = useCallback(
    (coachName, clubId) => {
      const allCoaches = preloadedCoaches;
      const normalizedInput = normalizeText(coachName);

      const getFirstName = (fullName) => fullName.trim().split(" ")[0];

      const getFirstLastName = (fullName) => {
        const parts = fullName.trim().split(" ");
        if (parts.length === 4) return parts[2];
        if (parts.length === 3) return parts[2];
        if (parts.length === 2) return parts[1];
        return "";
      };

      const lastNameCounts = {};
      for (const coach of allCoaches) {
        const lastName = normalizeText(getFirstLastName(coach.fullName));
        if (lastName) {
          lastNameCounts[lastName] = (lastNameCounts[lastName] || 0) + 1;
        }
      }

      const matches = allCoaches.filter((coach) => {
        const fullName = coach.fullName;
        const firstName = getFirstName(fullName);
        const firstLastName = getFirstLastName(fullName);
        const normalizedFullName = normalizeText(fullName);
        const normalizedFirstName = normalizeText(firstName);
        const normalizedLastName = normalizeText(firstLastName);
        const nicknames = coach.nicknames || [];

        const variants = new Set();

        variants.add(normalizedFullName);

        variants.add(`${normalizedFirstName} ${normalizedLastName}`);

        for (const nick of nicknames) {
          variants.add(`${normalizeText(nick)} ${normalizedLastName}`);
        }

        if (lastNameCounts[normalizedLastName] === 1) {
          variants.add(normalizedLastName);
        }

        return variants.has(normalizedInput);
      });

      if (matches.length === 0) {
        return {
          valid: false,
          message: "Entrenador no encontrado. Verificá el nombre ingresado.",
        };
      }

      if (matches.length > 1) {
        return {
          valid: false,
          message: "Nombre ambiguo. Especificá más datos del entrenador.",
        };
      }

      const matchedCoach = matches[0];

      const sanLorenzoPath = matchedCoach.careerPath?.find((careerEntry) =>
        normalizeText(careerEntry.club?.name || "").includes("san lorenzo")
      );

      if (!sanLorenzoPath) {
        return {
          valid: false,
          message: "El entrenador nunca dirigió en San Lorenzo",
        };
      }

      const clubPath = matchedCoach.careerPath?.find(
        (careerEntry) => careerEntry.club?._id === clubId
      );

      if (!clubPath) {
        return {
          valid: false,
          message: "El entrenador nunca dirigió en este equipo",
        };
      }

      return {
        valid: true,
        message: "Entrenador válido",
        coach: matchedCoach,
        club: clubPath.club,
      };
    },
    [preloadedCoaches]
  );

  const initializeGame = useCallback(() => {
    const formationKeys = Object.keys(FORMATIONS);
    const randomFormation =
      formationKeys[Math.floor(Math.random() * formationKeys.length)];
    const formationPositions = FORMATIONS[randomFormation].map((pos) => ({
      position: pos.position,
      x: pos.x,
      y: pos.y,
      player: null,
      club: null,
    }));

    setFormation(randomFormation);
    setPositions(formationPositions);
    setCoach(null);
    coachRef.current = null;
    setNeedsCoach(false);
    setUsedClubs([]);
    setUsedPlayers([]);
    setErrorMessage(null);
    setPlayerInput("");
    setCoachInput("");

    console.log("[v0] Initializing game with:", {
      argentineClubs: argentineClubs.length,
      sanLorenzoPlayers: sanLorenzoPlayers.length,
    });

    const firstClub = getNextValidClub(
      [],
      [],
      formationPositions.map((p) => p.position)
    );

    if (firstClub) {
      console.log("[v0] First club selected:", firstClub.name);
      toast.success(
        `¡Nuevo juego iniciado con formación ${randomFormation}! Modo: ${
          gameMode === "time" ? "Tiempo" : "Vidas"
        }`
      );
    } else {
      console.log("[v0] No valid club found on initialization");
      setErrorMessage("No se pudo inicializar el juego. Intenta de nuevo.");
    }
  }, [gameMode, getNextValidClub, argentineClubs, sanLorenzoPlayers]);

  const handlePlayerSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!playerInput.trim() || !currentClub || isSubmitting) return;

      setIsSubmitting(true);
      setPositionErrorMessage(null);

      const vacantPositions = getVacantPositions();
      const validation = validatePlayer(
        playerInput.trim(),
        currentClub._id,
        usedPlayers,
        vacantPositions
      );

      if (!validation.valid) {
        if (onIncorrectAnswer) {
          onIncorrectAnswer(validation.message);
        }

        if (validation.errorType === "position_unavailable") {
          const playerName = validation.player?.fullName || playerInput;
          const playerPositions =
            validation.player?.positions?.join(", ") || "desconocidas";
          const message = `${playerName} no puede entrar en la formación. Sus posiciones (${playerPositions}) no están disponibles en el campo.`;

          setPositionErrorMessage(message);
          setTimeout(() => setPositionErrorMessage(null), 3000);
          setPlayerInput("");
          setIsSubmitting(false);
          return;
        } else {
          toast.error(validation.message);
          setPlayerInput("");
          setIsSubmitting(false);
          return;
        }
      }

      const playerPositions = validation.player.positions;
      const availableSpecificPositions = vacantPositions.filter((vacantPos) =>
        playerPositions.includes(vacantPos)
      );

      const uniquePositions = [...new Set(availableSpecificPositions)];

      if (uniquePositions.length > 1) {
        setCurrentPlayer(validation.player);
        setAvailablePositions(uniquePositions);
        setSelectedPosition(uniquePositions[0]);
      } else {
        assignPlayerToPosition(
          validation.player,
          availableSpecificPositions[0]
        );
      }

      setPlayerInput("");
      setIsSubmitting(false);
    },
    [
      playerInput,
      currentClub,
      isSubmitting,
      getVacantPositions,
      validatePlayer,
      usedPlayers,
      onIncorrectAnswer,
    ]
  );

  const assignPlayerToPosition = useCallback(
    (player, selectedPosition) => {
      const positionIndex = positions.findIndex(
        (p) => p.position === selectedPosition && !p.player
      );

      if (positionIndex === -1) {
        toast.error("Error: posición no encontrada");
        return;
      }

      const newPositions = [...positions];
      newPositions[positionIndex].player = player;
      newPositions[positionIndex].club = currentClub;
      setPositions(newPositions);

      const newUsedPlayers = [...usedPlayers, player._id];
      const newUsedClubs = [...usedClubs];
      if (!newUsedClubs.includes(currentClub._id)) {
        newUsedClubs.push(currentClub._id);
      }

      setUsedPlayers(newUsedPlayers);
      setUsedClubs(newUsedClubs);

      toast.success(`${player.fullName} asignado en ${selectedPosition}`);

      const remainingVacant = newPositions.filter((pos) => !pos.player);

      if (remainingVacant.length > 0) {
        getNextValidClub(
          newUsedClubs,
          newUsedPlayers,
          remainingVacant.map((p) => p.position)
        );
      } else {
        setNeedsCoach(true);
        const coachClub = getNextValidClubForCoach();
        if (coachClub) {
          toast.success(
            "¡Todas las posiciones completadas! Ahora elige un Director Técnico"
          );
        }
      }
    },
    [
      positions,
      currentClub,
      usedPlayers,
      usedClubs,
      getNextValidClub,
      getNextValidClubForCoach,
    ]
  );

  const confirmPositionSelection = useCallback(() => {
    if (currentPlayer && selectedPosition) {
      assignPlayerToPosition(currentPlayer, selectedPosition);
      setCurrentPlayer(null);
      setAvailablePositions([]);
      setSelectedPosition("");
    }
  }, [currentPlayer, selectedPosition, assignPlayerToPosition]);

  const handleCoachSubmit = useCallback(
    async (e) => {
      e?.preventDefault();
      if (!coachInput.trim() || !currentClub || isSubmitting) return;

      setIsSubmitting(true);

      const validation = validateCoach(coachInput.trim(), currentClub._id);

      if (!validation.valid) {
        if (onIncorrectAnswer) {
          onIncorrectAnswer(validation.message);
        }
        toast.error(validation.message);
        setCoachInput("");
        setIsSubmitting(false);
        return;
      }

      coachRef.current = validation.coach;
      setCoach(validation.coach);
      toast.success("¡Felicidades! Has completado el equipo con éxito.");
      setCoachInput("");
      setIsSubmitting(false);

      console.log(
        "[v0] Coach validated and stored:",
        validation.coach.fullName
      );

      if (gameLogic) {
        gameLogic.endGame(true, { coach: validation.coach });
      }
    },
    [
      coachInput,
      currentClub,
      isSubmitting,
      validateCoach,
      gameLogic,
      onIncorrectAnswer,
    ]
  );

  return {
    formation,
    positions,
    coach,
    coachRef,
    currentClub,
    needsCoach,
    usedClubs,
    usedPlayers,
    playerInput,
    coachInput,
    isSubmitting,
    errorMessage,
    positionErrorMessage,
    currentPlayer,
    availablePositions,
    selectedPosition,
    possiblePlayersOnFail,
    setPlayerInput,
    setCoachInput,
    setSelectedPosition,
    initializeGame,
    handlePlayerSubmit,
    handleCoachSubmit,
    confirmPositionSelection,
    getPossiblePlayers,
    getVacantPositions,
    getValidPlayersForCurrentClub,
  };
}
