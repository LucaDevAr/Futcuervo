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

// ================================
// LEAGUE PROBABILITIES
// ================================
const highProbabilityLeagues = [
  "Primera División",
  "Primera División",
  "Liga MX",
  "Liga Portugal",
  "LaLiga",
  "Premier League",
  "Serie A",
  "Bundesliga",
  "Eredivisie",
  "Ligue 1",
  "Liga FUTVE",
  "Liga 1 Apertura",
  "Premier Liga",
  "Major League Soccer",
  "Liga Dimayor",
  "Liga AUF",
  "Campeonato Brasileiro Série A",
  "LigaPro Serie A",
  "Liga de Primera",
  "División Profesional",
  "Primera Nacional",
];

const lowProbabilityLeagues = [
  "Liga desconocida",
  "Super League 1",
  "Liga 1 Indonesia",
  "Süper Lig",
  "UAE Pro League",
  "Prva Liga",
  "efbet Liga",
  "Malaysia Super League",
  "Jupiler Pro League",
  "Nemzeti Bajnokság",
  "Premier de Ucrania",
  "Saudi Pro League",
  "Chinese Super League",
  "J1 League",
  "Indian Super League",
  "Liga Panameña de Fútbol Clausura",
  "Veikkausliiga",
  "Scottish Premiership",
  "Betclic 1 Liga",
  "Qatar Stars League",
  "Persian Gulf Pro League",
  "Hong Kong Premier League",
  "Primera División Apertura",
  "Eliteserien",
  "Cyprus League",
  "Premijer Liga Bosne i Hercegovine",
  "Liga Guate Apertura",
  "Premier League Opening Round",
  "Ligat ha'Al",
  "Regionalliga West",
  "Primera División Apertura",
  "Iraq Stars League",
  "Super League",
  "Premyer Liqa",
  "Super liga Srbije",
  "Erovnuli Liga",
  "Egyptian Premier League",
  "Liga Nacional Apertura",
  "SuperSport HNL",
  "SuperLiga",
  "SuperLiga",
];

const regularFactor = 1;
const highFactor = 3;
const lowFactor = 0.35;

function getLeagueWeight(leagueName) {
  const name = normalizeText(leagueName);

  if (highProbabilityLeagues.some((l) => normalizeText(l) === name)) {
    return highFactor;
  }

  if (lowProbabilityLeagues.some((l) => normalizeText(l) === name)) {
    return lowFactor;
  }

  return regularFactor;
}

function getLeagueIdFromClubId(clubId, preloadedClubs) {
  if (!clubId) return null;
  const club = preloadedClubs.find(
    (c) => c._id?.toString() === clubId?.toString()
  );
  if (!club) {
    // console.warn("getLeagueIdFromClubId: club no encontrado", clubId);
    return null;
  }

  if (club.league && typeof club.league === "object" && club.league._id) {
    return club.league._id?.toString();
  }

  if (club.league && typeof club.league === "string") {
    return club.league.toString();
  }

  if (club.league?._id) return club.league._id.toString();

  // console.warn("getLeagueIdFromClubId: club sin league válido", club);
  return null;
}

export function useLeagueTeamGame({
  gameMode,
  clubId,
  preloadedPlayers = [],
  preloadedClubs = [],
  preloadedLeagues = [],
  preloadedCoaches = [],
  gameLogic,
  onIncorrectAnswer,
}) {
  const [formation, setFormation] = useState("");
  const [positions, setPositions] = useState([]);
  const [currentLeague, setCurrentLeague] = useState(null);
  const [needsCoach, setNeedsCoach] = useState(false);
  const [usedLeagues, setUsedLeagues] = useState([]);
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
  const [coach, setCoach] = useState(null);

  const coachRef = useRef(null);

  const [clubPlayers, setClubPlayers] = useState([]);
  const [availableLeagues, setAvailableLeagues] = useState([]);

  useEffect(() => {
    // console.log("🔄 useLeagueTeamGame INIT -----------------");
    // console.log("📦 preloadedPlayers:", preloadedPlayers?.length);
    // console.log("📦 preloadedClubs:", preloadedClubs?.length);
    // console.log("📦 preloadedLeagues:", preloadedLeagues?.length);
    // console.log("🏟 clubId:", clubId);

    const playersInClub = preloadedPlayers.filter(
      (player) =>
        Array.isArray(player.career) &&
        player.career.some(
          (c) => c.club?._id?.toString() === clubId?.toString()
        )
    );

    // console.log("✅ Jugadores encontrados en el club:", playersInClub.length);
    // playersInClub
    //   .slice(0, 10)
    //   .forEach((p) =>
    //     console.log(
    //       `   - ${p.fullName} | positions: ${p.positions?.join?.(", ")}`
    //     )
    //   );
    setClubPlayers(playersInClub);

    const clubLeagueId = getLeagueIdFromClubId(clubId, preloadedClubs);
    // console.log(
    //   "🏆 Liga actual del club (resuelta desde clubs):",
    //   clubLeagueId
    // );

    const leagues = preloadedLeagues.filter(
      (l) => l._id?.toString() !== clubLeagueId
    );
    // console.log("🌍 Ligas alternativas disponibles:", leagues.length);
    setAvailableLeagues(leagues);
  }, [preloadedPlayers, preloadedLeagues, preloadedClubs, clubId]);

  const initializeFormationAndPositions = useCallback(() => {
    try {
      const formationKeys = Object.keys(FORMATIONS || {});
      const chosenFormation =
        formationKeys.length > 0
          ? formationKeys[Math.floor(Math.random() * formationKeys.length)]
          : "default";

      const formationLayout = FORMATIONS[chosenFormation] || [];

      const initialPositions = formationLayout.map((p, idx) => ({
        position: p.position || `P${idx}`,
        x: p.x ?? 50,
        y: p.y ?? 50,
        player: null,
        league: null,
        club: null,
      }));

      if (initialPositions.length === 0) {
        const fallback = Array.from({ length: 11 }).map((_, i) => ({
          position: `P${i + 1}`,
          x: 50,
          y: 50,
          player: null,
          league: null,
          club: null,
        }));
        setPositions(fallback);
      } else {
        setPositions(initialPositions);
      }
      setFormation(chosenFormation);
    } catch (err) {
      // console.error("Error initializing formation:", err);
      setFormation("");
      setPositions(
        Array.from({ length: 11 }).map((_, i) => ({
          position: `P${i + 1}`,
          x: 50,
          y: 50,
          player: null,
          league: null,
          club: null,
        }))
      );
    }
  }, []);

  const initializeGame = useCallback(() => {
    // console.log("🔥 initializeGame() called");
    // console.log("clubId:", clubId);
    // console.log("clubPlayers.length:", clubPlayers?.length);
    // console.log("availableLeagues.length:", availableLeagues?.length);

    setErrorMessage(null);

    if (!clubPlayers || clubPlayers.length === 0) {
      // console.warn("❌ No players in club");
      setErrorMessage("No hay jugadores disponibles en este club.");
      initializeFormationAndPositions();
      return;
    }

    if (!availableLeagues || availableLeagues.length === 0) {
      // console.warn("❌ No available leagues");
      setErrorMessage("No hay ligas alternativas disponibles.");
      initializeFormationAndPositions();
      return;
    }

    initializeFormationAndPositions();

    let selectedLeague = null;
    const shuffle = (arr) => arr.sort(() => Math.random() - 0.5);
    const weightedLeagues = [];

    availableLeagues.forEach((league) => {
      const weight = getLeagueWeight(league.name);
      const times = Math.max(1, Math.round(weight * 15));

      for (let i = 0; i < times; i++) {
        weightedLeagues.push(league);
      }
    });

    const leaguesShuffled = weightedLeagues.sort(() => Math.random() - 0.5);

    for (const candidateLeague of leaguesShuffled) {
      const validPlayers = clubPlayers.filter(
        (player) =>
          Array.isArray(player.career) &&
          player.career.some((entry) => {
            const careerClubId = entry.club?._id || entry.club;
            const leagueResolved = getLeagueIdFromClubId(
              careerClubId,
              preloadedClubs
            );
            return leagueResolved === candidateLeague._id?.toString();
          })
      );

      if (validPlayers.length > 0) {
        selectedLeague = candidateLeague;
        // console.log(
        //   "✅ selectedLeague:",
        //   selectedLeague.name,
        //   selectedLeague._id
        // );
        break;
      }
    }

    if (!selectedLeague) {
      // console.warn("❌ No league found with compatible players");
      // setErrorMessage(
      //   "No hay jugadores que hayan jugado en otras ligas para iniciar el juego."
      // );
      return;
    }

    const eligiblePlayers = clubPlayers.filter(
      (player) =>
        Array.isArray(player.career) &&
        player.career.some((entry) => {
          const careerClubId = entry.club?._id || entry.club;
          const leagueResolved = getLeagueIdFromClubId(
            careerClubId,
            preloadedClubs
          );
          return leagueResolved === selectedLeague._id?.toString();
        })
    );

    if (!eligiblePlayers || eligiblePlayers.length === 0) {
      // console.warn("❌ Selected league pero no eligiblePlayers");
      setErrorMessage("Ocurrió un error seleccionando jugadores válidos.");
      return;
    }

    const chosen =
      eligiblePlayers[Math.floor(Math.random() * eligiblePlayers.length)];

    setCurrentLeague(selectedLeague);
    setUsedLeagues([selectedLeague._id?.toString()]);
    setCurrentPlayer(chosen);
    setErrorMessage(null);

    // console.log(
    //   "🎯 Player chosen for initial target:",
    //   chosen.fullName,
    //   chosen._id
    // );
  }, [
    clubPlayers,
    availableLeagues,
    preloadedClubs,
    initializeFormationAndPositions,
    clubId,
  ]);

  const getVacantPositions = useCallback(() => {
    return positions.filter((pos) => !pos.player).map((pos) => pos.position);
  }, [positions]);

  function getValidPlayersForCurrentLeague(players, leagueId) {
    const list = Array.isArray(players) ? players : clubPlayers;
    const leagueIdStr = leagueId?.toString?.();

    if (!Array.isArray(list) || !leagueIdStr) return [];

    return list.filter(
      (player) =>
        Array.isArray(player.career) &&
        player.career.some((entry) => {
          const careerClubId = entry.club?._id || entry.club;
          const resolved = getLeagueIdFromClubId(careerClubId, preloadedClubs);
          return resolved === leagueIdStr;
        })
    );
  }

  function validatePlayer(
    inputOrPlayer,
    leagueId,
    usedPlayersList = [],
    vacantPositions = []
  ) {
    try {
      let playerObj = null;
      if (!inputOrPlayer) {
        return { valid: false, message: "Nombre vacío" };
      }

      if (typeof inputOrPlayer === "string") {
        const normalized = normalizeText(inputOrPlayer);
        playerObj = clubPlayers.find((p) => {
          if (!p) return false;
          const names = [p.fullName, p.displayName, ...(p.nicknames || [])]
            .filter(Boolean)
            .map(normalizeText);

          return names.some((n) => n === normalized || n.includes(normalized));
        });
      } else if (typeof inputOrPlayer === "object") {
        playerObj = inputOrPlayer;
      }

      if (!playerObj) {
        // console.warn(
        //   "validatePlayer: jugador no encontrado para:",
        //   inputOrPlayer
        // );
        return {
          valid: false,
          message: "Jugador no encontrado. Verificá el nombre.",
        };
      }

      if (usedPlayersList && usedPlayersList.includes(playerObj._id)) {
        return {
          valid: false,
          message: "Jugador ya fue usado.",
          errorType: "already_used",
          player: playerObj,
        };
      }

      if (!Array.isArray(playerObj.career) || playerObj.career.length === 0) {
        return {
          valid: false,
          message: "Datos de carrera incompletos para este jugador.",
          player: playerObj,
        };
      }

      const leagueIdStr = leagueId?.toString();

      const matchingCareerEntry = playerObj.career.find((entry) => {
        const careerClubId = entry.club?._id || entry.club;
        const resolvedLeague = getLeagueIdFromClubId(
          careerClubId,
          preloadedClubs
        );
        return resolvedLeague === leagueIdStr;
      });

      if (!matchingCareerEntry) {
        return {
          valid: false,
          message: "El jugador no jugó en la liga mostrada.",
          errorType: "wrong_league",
          player: playerObj,
        };
      }

      if (Array.isArray(vacantPositions) && vacantPositions.length > 0) {
        const playerPositions =
          playerObj.positions || playerObj.availablePositions || [];
        const availableSpecificPositions = vacantPositions.filter((pos) =>
          playerPositions.includes(pos)
        );

        if (availableSpecificPositions.length === 0) {
          return {
            valid: false,
            message: "El jugador no puede entrar en la formación actual.",
            errorType: "position_unavailable",
            player: playerObj,
          };
        }

        return {
          valid: true,
          message: "Jugador válido",
          player: playerObj,
          league: currentLeague,
          club: matchingCareerEntry.club,
          availablePositions: availableSpecificPositions,
        };
      }

      return {
        valid: true,
        message: "Jugador válido",
        player: playerObj,
        league: currentLeague,
        club: matchingCareerEntry.club,
      };
    } catch (err) {
      // console.error("validatePlayer error:", err);
      return { valid: false, message: "Error validando jugador." };
    }
  }

  const getPossiblePlayers = useCallback(
    (leagueId, vacantPositions) => {
      const leagueIdStr = leagueId?.toString();
      if (!leagueIdStr) return [];

      const players = clubPlayers.filter((player) => {
        if (!Array.isArray(player.career)) return false;
        const playedInLeague = player.career.some((entry) => {
          const careerClubId = entry.club?._id || entry.club;
          const resolved = getLeagueIdFromClubId(careerClubId, preloadedClubs);
          return resolved === leagueIdStr;
        });
        if (!playedInLeague) return false;

        if (!player.fullName || !player.positions) return false;

        const availablePositions = (vacantPositions || []).filter((pos) =>
          (player.positions || []).includes(pos)
        );

        return availablePositions.length > 0;
      });

      return players
        .map((player) => ({
          ...player,
          availablePositions: [
            ...new Set(
              (vacantPositions || []).filter((pos) =>
                (player.positions || []).includes(pos)
              )
            ),
          ],
        }))
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    },
    [clubPlayers, preloadedClubs]
  );

  function getNextValidLeague(
    player,
    availableLeaguesLocal,
    usedLeaguesLocal,
    vacantPositions
  ) {
    const normalizedUsed = (usedLeaguesLocal || []).map(String);

    const unusedLeagues = (availableLeaguesLocal || []).filter(
      (league) => !normalizedUsed.includes(league._id?.toString())
    );

    const weightedUnusedLeagues = [];

    unusedLeagues.forEach((league) => {
      const weight = getLeagueWeight(league.name);
      const times = Math.max(1, Math.round(weight * 10));

      for (let i = 0; i < times; i++) {
        weightedUnusedLeagues.push(league);
      }
    });

    const shuffledLeagues = weightedUnusedLeagues.sort(
      () => Math.random() - 0.5
    );

    for (const league of shuffledLeagues) {
      const validPlayers = clubPlayers.filter((p) =>
        (p.career || []).some((entry) => {
          const careerClubId = entry.club?._id || entry.club;
          const resolved = getLeagueIdFromClubId(careerClubId, preloadedClubs);
          return resolved === league._id?.toString();
        })
      );

      if (validPlayers.length === 0) continue;

      const playersForVacant = validPlayers.filter((p) =>
        (p.positions || []).some((pos) => vacantPositions.includes(pos))
      );

      if (playersForVacant.length === 0) {
        continue;
      }

      return {
        nextLeague: league,
        updatedUsedLeagues: [...normalizedUsed, league._id?.toString()],
      };
    }

    return null;
  }

  const getRandomLeagueForCoach = useCallback(() => {
    const coachesInClub = preloadedCoaches.filter((coach) =>
      coach.careerPath?.some(
        (careerEntry) =>
          careerEntry.club?._id?.toString() === clubId?.toString()
      )
    );

    if (coachesInClub.length === 0) {
      setErrorMessage(
        "No se encontraron entrenadores que hayan dirigido en este club"
      );
      return null;
    }

    const allPossibleLeagues = [];

    coachesInClub.forEach((coach) => {
      coach.careerPath?.forEach((careerEntry) => {
        const club = careerEntry.club;
        if (!club) return;

        const clubLeagueId = getLeagueIdFromClubId(
          club._id || club,
          preloadedClubs
        );
        if (!clubLeagueId) return;
        if (usedLeagues.includes(clubLeagueId)) return;

        const league = availableLeagues.find(
          (l) => l._id?.toString() === clubLeagueId
        );

        if (
          league &&
          !allPossibleLeagues.some(
            (l) => l._id?.toString() === league._id?.toString()
          )
        ) {
          allPossibleLeagues.push(league);
        }
      });
    });

    if (allPossibleLeagues.length === 0) {
      setErrorMessage("No se encontraron ligas válidas para entrenadores");
      return null;
    }

    // ===============================
    // 🔥 PONDERACIÓN POR LIGA
    // ===============================
    const weightedLeagues = [];

    allPossibleLeagues.forEach((league) => {
      const weight = getLeagueWeight(league.name);
      const times = Math.max(1, Math.round(weight * 10));

      for (let i = 0; i < times; i++) {
        weightedLeagues.push(league);
      }
    });

    const selectedLeague =
      weightedLeagues[Math.floor(Math.random() * weightedLeagues.length)];

    setCurrentLeague(selectedLeague);
    return selectedLeague;
  }, [preloadedCoaches, clubId, usedLeagues, availableLeagues, preloadedClubs]);

  const validateCoach = useCallback(
    (coachName, leagueId) => {
      const allCoaches = preloadedCoaches || [];
      const normalizedInput = normalizeText(coachName);

      const getFirstName = (fullName) => fullName?.trim().split(" ")[0] || "";
      const getFirstLastName = (fullName) => {
        const parts = fullName?.trim().split(" ") || [];
        if (parts.length === 4) return parts[2];
        if (parts.length === 3) return parts[2];
        if (parts.length === 2) return parts[1];
        return "";
      };

      const lastNameCounts = {};
      for (const coach of allCoaches) {
        const lastName = normalizeText(getFirstLastName(coach.fullName || ""));
        if (lastName)
          lastNameCounts[lastName] = (lastNameCounts[lastName] || 0) + 1;
      }

      const matches = allCoaches.filter((coach) => {
        const fullName = coach.fullName || "";
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

      const clubPath = matchedCoach.careerPath?.find(
        (careerEntry) =>
          careerEntry.club?._id?.toString() === clubId?.toString()
      );
      if (!clubPath)
        return {
          valid: false,
          message: "El entrenador nunca dirigió en este club",
        };

      const leaguePath = matchedCoach.careerPath?.find((careerEntry) => {
        const club = careerEntry.club;
        const clubLeagueId = getLeagueIdFromClubId(
          club?._id || club,
          preloadedClubs
        );
        return clubLeagueId === leagueId?.toString();
      });

      if (!leaguePath) {
        return {
          valid: false,
          message: "El entrenador nunca dirigió en esta liga",
        };
      }

      return {
        valid: true,
        message: "Entrenador válido",
        coach: matchedCoach,
        league: currentLeague,
      };
    },
    [preloadedCoaches, clubId, currentLeague, preloadedClubs]
  );

  const handlePlayerSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      const trimmed = playerInput?.trim();
      if (!trimmed || !currentLeague || isSubmitting) return;

      setIsSubmitting(true);
      setPositionErrorMessage(null);

      const vacantPositions = getVacantPositions();
      const validation = validatePlayer(
        trimmed,
        currentLeague._id,
        usedPlayers,
        vacantPositions
      );

      // --- Si no es válido ---
      if (!validation.valid) {
        const { errorType, message, player } = validation;

        // -----------------------------
        // Caso especial: posición no disponible -> NO restar vidas
        // -----------------------------
        if (errorType === "position_unavailable") {
          const playerName = player?.fullName || trimmed;
          const playerPositions =
            (player?.positions || player?.availablePositions || []).join(
              ", "
            ) || "desconocidas";

          const msg = `${playerName} no puede entrar en la formación. Sus posiciones (${playerPositions}) no están disponibles en el campo.`;

          // Mostrar mensaje en UI (positionErrorMessage) y no tocar vidas
          setPositionErrorMessage(msg);
          setTimeout(() => setPositionErrorMessage(null), 3000);

          // limpiar input / estado y salir SIN llamar onIncorrectAnswer
          setPlayerInput("");
          setIsSubmitting(false);
          return;
        }

        // -----------------------------
        // Otros errores -> comportamiento normal (sí cuentan como incorrectos)
        // -----------------------------
        if (onIncorrectAnswer) onIncorrectAnswer(message);
        toast.error(message);
        setPlayerInput("");
        setIsSubmitting(false);
        return;
      }

      // --- Si es válido ---
      const playerObj = validation.player;
      const playerPositions =
        validation.availablePositions || playerObj.positions || [];
      const availableSpecificPositions = vacantPositions.filter((vacantPos) =>
        playerPositions.includes(vacantPos)
      );
      const uniquePositions = [...new Set(availableSpecificPositions)];

      if (uniquePositions.length > 1) {
        setCurrentPlayer(playerObj);
        setAvailablePositions(uniquePositions);
        setSelectedPosition(uniquePositions[0]);
      } else {
        const matchedCareer = (playerObj.career || []).find((entry) => {
          const careerClubId = entry.club?._id || entry.club;
          const resolved = getLeagueIdFromClubId(careerClubId, preloadedClubs);
          return resolved === currentLeague?._id?.toString();
        });
        assignPlayerToPosition(
          playerObj,
          availableSpecificPositions[0],
          currentLeague,
          matchedCareer?.club || null
        );
      }

      setPlayerInput("");
      setIsSubmitting(false);
    },
    [
      playerInput,
      currentLeague,
      isSubmitting,
      getVacantPositions,
      usedPlayers,
      onIncorrectAnswer,
      preloadedClubs,
    ]
  );

  const assignPlayerToPosition = useCallback(
    (player, selectedPosition, league, club) => {
      if (!selectedPosition) {
        toast.error("Error: posición no seleccionada");
        return;
      }

      const positionIndex = positions.findIndex(
        (p) => p.position === selectedPosition && !p.player
      );

      if (positionIndex === -1) {
        toast.error("Error: posición no encontrada");
        return;
      }

      const newPositions = [...positions];
      newPositions[positionIndex] = {
        ...newPositions[positionIndex],
        player,
        league,
        club,
      };
      setPositions(newPositions);

      const newUsedPlayers = [...usedPlayers, player._id];
      setUsedPlayers(newUsedPlayers);

      const newUsedLeagues = [...usedLeagues];
      const leagueIdToPush = league?._id?.toString?.() || league?.toString?.();
      if (leagueIdToPush && !newUsedLeagues.includes(leagueIdToPush)) {
        newUsedLeagues.push(leagueIdToPush);
      }
      setUsedLeagues(newUsedLeagues);

      toast.success(`${player.fullName} asignado en ${selectedPosition}`);

      const remainingVacant = newPositions.filter((pos) => !pos.player);
      const vacantPositionsList = remainingVacant.map((p) => p.position);

      if (remainingVacant.length > 0) {
        const next = getNextValidLeague(
          player,
          availableLeagues,
          newUsedLeagues,
          vacantPositionsList
        );

        if (next && next.nextLeague) {
          setCurrentLeague(next.nextLeague);
          setUsedLeagues(next.updatedUsedLeagues);
          toast.info(`Nueva liga: ${next.nextLeague.name}`);
        }
      } else {
        setNeedsCoach(true);
        const coachLeague = getRandomLeagueForCoach();
        if (coachLeague) {
          toast.success(
            "¡Todas las posiciones completadas! Ahora elige un Director Técnico"
          );
        }
      }
    },
    [
      positions,
      currentLeague,
      usedPlayers,
      usedLeagues,
      availableLeagues,
      getRandomLeagueForCoach,
    ]
  );

  const confirmPositionSelection = useCallback(() => {
    if (currentPlayer && selectedPosition) {
      const league = currentLeague;
      const club = (currentPlayer.career || []).find((c) => {
        const resolved = getLeagueIdFromClubId(
          c.club?._id || c.club,
          preloadedClubs
        );
        return resolved === currentLeague?._id?.toString();
      })?.club;
      assignPlayerToPosition(currentPlayer, selectedPosition, league, club);
      setCurrentPlayer(null);
      setAvailablePositions([]);
      setSelectedPosition("");
    }
  }, [
    currentPlayer,
    selectedPosition,
    currentLeague,
    assignPlayerToPosition,
    preloadedClubs,
  ]);

  const handleCoachSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.();
      if (!coachInput.trim() || !currentLeague || isSubmitting) return;

      setIsSubmitting(true);

      const validation = validateCoach(coachInput.trim(), currentLeague._id);

      if (!validation.valid) {
        if (onIncorrectAnswer) onIncorrectAnswer(validation.message);
        toast.error(validation.message);
        setCoachInput("");
        setIsSubmitting(false);
        return;
      }

      // console.log("✅ Coach validado correctamente:", validation.coach);

      setCoach(validation.coach);
      coachRef.current = validation.coach;

      toast.success("¡Felicidades! Has completado el equipo con éxito.");
      setCoachInput("");
      setIsSubmitting(false);

      if (gameLogic && gameLogic.endGame) {
        // console.log("🎯 Terminando juego con coach:", validation.coach);
        gameLogic.endGame(true, { coach: validation.coach });
      }
    },
    [
      coachInput,
      currentLeague,
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
    currentLeague,
    needsCoach,
    usedLeagues,
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
    getValidPlayersForCurrentLeague,
  };
}
