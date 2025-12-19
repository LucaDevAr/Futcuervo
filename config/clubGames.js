// Define qué juegos están disponibles para cada club/home

import {
  Shield,
  Trophy,
  Users,
  Shirt,
  BookOpen,
  Film,
  Music,
  Calendar,
  Globe,
  Star,
} from "lucide-react";

// Configuración de juegos por club
export const CLUB_GAMES_CONFIG = {
  // Home principal (sin club específico)
  general: [
    {
      title: "Equipo nacional",
      gameType: "national",
      icon: Shield,
      path: "/games/national-team",
    },
    {
      title: "Equipo internacional",
      gameType: "league",
      icon: Trophy,
      path: "/games/league-team",
    },
    {
      title: "Camiseta",
      gameType: "shirt",
      icon: Shirt,
      path: "/games/shirt",
    },
    {
      title: "Jugador",
      gameType: "player",
      icon: Users,
      path: "/games/player",
    },
    {
      title: "Historia",
      gameType: "history",
      icon: BookOpen,
      path: "/games/history",
    },
    {
      title: "Video",
      gameType: "video",
      icon: Film,
      path: "/games/video",
    },
    {
      title: "Canción",
      gameType: "song",
      icon: Music,
      path: "/games/song",
    },
    {
      title: "Calendario",
      gameType: "calendar",
      icon: Calendar,
      path: "/games/calendar",
    },
    {
      title: "Mundial",
      gameType: "worldcup",
      icon: Globe,
      path: "/games/world-cup",
    },
    {
      title: "Leyenda",
      gameType: "legend",
      icon: Star,
      path: "/games/legend",
    },
  ],

  // FutCuervo (San Lorenzo)
  futcuervo: [
    {
      title: "Equipo nacional",
      gameType: "national",
      path: "/futcuervo/games/national-team",
      images: ["/images/san-lorenzo-escudo.png", "/images/afa-logo.svg"],
    },
    {
      title: "Equipo de ligas",
      gameType: "league",
      path: "/futcuervo/games/league-team",
      images: ["/images/san-lorenzo-escudo.png", "/images/fifa-logo.svg"],
    },
    {
      title: "Camiseta",
      gameType: "shirt",
      path: "/futcuervo/games/shirt",
      image: "/images/camiseta.png",
    },
    {
      title: "Jugador",
      gameType: "player",
      path: "/futcuervo/games/player",
      image: "/images/jugador-correcto.png",
    },
    // {
    //   title: "Historia",
    //   gameType: "history",
    //   path: "/futcuervo/games/history",
    //   icon: BookOpen,
    // },
    // {
    //   title: "Video",
    //   gameType: "video",
    //   path: "/futcuervo/games/video",
    //   image: "/images/video.webp",
    // },
    {
      title: "Trayectoria",
      gameType: "career",
      path: "/futcuervo/games/career",
      image: "/images/trayectoria.png",
    },
    {
      title: "Presencias",
      gameType: "appearances",
      path: "/futcuervo/games/appearances",
      image: "/images/cancha.png",
    },
    {
      title: "Goles",
      gameType: "goals",
      path: "/futcuervo/games/goals",
      image: "/images/gol.png",
    },
    // {
    //   title: "Canción",
    //   gameType: "song",
    //   path: "/futcuervo/games/song",
    //   icon: Music,
    // },
  ],
  futmerengue: [
    {
      title: "Equipo nacional",
      gameType: "national",
      path: "/futmerengue/games/national-team",
      images: [
        "https://tmssl.akamaized.net//images/wappen/head/418.png?lm=1729684474",
        "/images/afa-logo.svg",
      ],
    },
    {
      title: "Equipo ligas",
      gameType: "league",
      path: "/futmerengue/games/league-team",
      images: [
        "https://tmssl.akamaized.net//images/wappen/head/418.png?lm=1729684474",
        "/images/fifa-logo.svg",
      ],
    },
    {
      title: "Camiseta",
      gameType: "shirt",
      path: "/futmerengue/games/shirt",
      image: "/images/camiseta.png",
    },
    {
      title: "Jugador",
      gameType: "player",
      path: "/futmerengue/games/player",
      image: "/images/jugador-correcto.png",
    },
    // {
    //   title: "Historia",
    //   gameType: "history",
    //   path: "/futcuervo/games/history",
    //   icon: BookOpen,
    // },
    {
      title: "Video",
      gameType: "video",
      path: "/futmerengue/games/video",
      image: "/images/video.webp",
    },
    {
      title: "Trayectoria",
      gameType: "career",
      path: "/futmerengue/games/career",
      image: "/images/trayectoria.png",
    },
    {
      title: "Presencias",
      gameType: "appearances",
      path: "/futmerengue/games/appearances",
      image: "/images/cancha.png",
    },
    {
      title: "Goles",
      gameType: "goals",
      path: "/futmerengue/games/goals",
      image: "/images/gol.png",
    },
    // {
    //   title: "Canción",
    //   gameType: "song",
    //   path: "/futcuervo/games/song",
    //   icon: Music,
    // },
  ],
  // Ejemplo: Futcule (sin canción)
  futcule: [
    {
      title: "Equipo nacional",
      gameType: "national",
      path: "/games/national-team",
      images: ["/images/cule-escudo.png", "/images/afa-logo.svg"],
    },
    {
      title: "Equipo internacional",
      gameType: "league",
      path: "/games/league-team",
      images: ["/images/cule-escudo.png", "/images/fifa-logo.svg"],
    },
    {
      title: "Camiseta",
      gameType: "shirt",
      path: "/games/shirt",
      image: "/images/camiseta.png",
    },
    {
      title: "Jugador",
      gameType: "player",
      path: "/games/player",
      image: "/images/jugador-correcto.png",
    },
    {
      title: "Historia",
      gameType: "history",
      path: "/games/history",
      icon: BookOpen,
    },
    // NO tiene "song"
  ],
};

/**
 * Obtiene los juegos disponibles para un club específico
 * @param {string} clubKey - Identificador del club (ej: "futcuervo", "barcelona", "general")
 * @returns {Array} Lista de juegos disponibles para ese club
 */
export function getClubGames(clubKey = "general") {
  return CLUB_GAMES_CONFIG[clubKey] || CLUB_GAMES_CONFIG.general;
}

/**
 * Obtiene los gameTypes disponibles para un club (solo los tipos)
 * @param {string} clubKey - Identificador del club
 * @returns {Array<string>} Lista de gameTypes (ej: ["national", "league", "shirt"])
 */
export function getClubGameTypes(clubKey = "general") {
  const games = getClubGames(clubKey);
  return games.map((game) => game.gameType);
}

/**
 * Verifica si un gameType es válido para un club
 * @param {string} clubKey - Identificador del club
 * @param {string} gameType - Tipo de juego a verificar
 * @returns {boolean} true si el gameType es válido para ese club
 */
export function isValidGameType(clubKey, gameType) {
  const validTypes = getClubGameTypes(clubKey);
  return validTypes.includes(gameType);
}
