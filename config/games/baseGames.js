import { BookOpen, Film, Shield, Shirt, Trophy, Users } from "lucide-react";

export const BASE_GAMES = [
  {
    title: "Equipo nacional",
    gameType: "national",
    icon: Shield,
  },
  {
    title: "Equipo internacional",
    gameType: "league",
    icon: Trophy,
  },
  {
    title: "Camiseta",
    gameType: "shirt",
    icon: Shirt,
  },
  {
    title: "Jugador",
    gameType: "player",
    icon: Users,
  },
  {
    title: "Historia",
    gameType: "history",
    icon: BookOpen,
  },
  {
    title: "Video",
    gameType: "video",
    icon: Film,
  },
];
