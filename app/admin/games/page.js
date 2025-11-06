"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Music,
  User,
  Shirt,
  Video,
  Trophy,
  Calendar,
  Plus,
  Edit,
  Eye,
  Clock,
  Users,
  History,
} from "lucide-react";

export default function AdminGamesPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [gameStats, setGameStats] = useState({
    song: { total: 0, today: false },
    career: { total: 0, today: false },
    shirt: { total: 0, today: false },
    player: { total: 0, today: false },
    video: { total: 0, today: false },
    history: { total: 0, today: false },
  });

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Fetch game statistics
    const fetchGameStats = async () => {
      try {
        // Mock data - replace with actual API calls
        setGameStats({
          song: { total: 15, today: true },
          career: { total: 8, today: false },
          shirt: { total: 12, today: true },
          player: { total: 20, today: false },
          video: { total: 6, today: true },
          history: { total: 10, today: false },
        });
      } catch (error) {
        console.error("Error fetching game stats:", error);
      }
    };

    fetchGameStats();
  }, []);

  const gameTypes = [
    {
      id: "song",
      title: "Juego de Música",
      description: "Gestionar canciones diarias para el juego musical",
      icon: Music,
      color: isDarkMode ? "var(--primary)" : "var(--secondary)",
      href: "/admin/games/song",
      stats: gameStats.song,
    },
    {
      id: "career",
      title: "Juego de Carrera",
      description: "Administrar equipos y jugadores para el juego de carrera",
      icon: Trophy,
      color: isDarkMode ? "var(--secondary)" : "var(--primary)",
      href: "/admin/games/career",
      stats: gameStats.career,
    },
    {
      id: "shirt",
      title: "Juego de Camisetas",
      description: "Configurar camisetas diarias para adivinar",
      icon: Shirt,
      color: isDarkMode ? "var(--primary)" : "var(--secondary)",
      href: "/admin/games/shirt",
      stats: gameStats.shirt,
    },
    {
      id: "player",
      title: "Juego de Jugadores",
      description: "Gestionar jugadores para el juego diario",
      icon: User,
      color: isDarkMode ? "var(--secondary)" : "var(--primary)",
      href: "/admin/games/player",
      stats: gameStats.player,
    },
    {
      id: "video",
      title: "Juego de Videos",
      description: "Administrar videos para el juego diario",
      icon: Video,
      color: isDarkMode ? "var(--primary)" : "var(--secondary)",
      href: "/admin/games/video",
      stats: gameStats.video,
    },
    {
      id: "history",
      title: "Juego de Historia",
      description: "Configurar preguntas históricas del club",
      icon: History,
      color: isDarkMode ? "var(--secondary)" : "var(--primary)",
      href: "/admin/games/history",
      stats: gameStats.history,
    },
  ];

  const getTodayDate = () => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: isDarkMode ? "var(--white)" : "var(--black)" }}
        >
          Gestión de Juegos Diarios
        </h1>
        <p className="text-lg" style={{ color: "var(--gris)" }}>
          Administra todos los juegos diarios de FutCuervo - {getTodayDate()}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div
          className="p-6 rounded-xl shadow-lg"
          style={{
            backgroundColor: isDarkMode ? "var(--primary)" : "var(--white)",
            border: `2px solid ${
              isDarkMode ? "var(--primary-oscuro)" : "var(--primary)"
            }`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--primary)",
                }}
              >
                Juegos Configurados Hoy
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--primary)",
                }}
              >
                {Object.values(gameStats).filter((stat) => stat.today).length}/6
              </p>
            </div>
            <Calendar
              size={24}
              style={{
                color: isDarkMode ? "var(--secondary)" : "var(--primary)",
              }}
            />
          </div>
        </div>

        <div
          className="p-6 rounded-xl shadow-lg"
          style={{
            backgroundColor: isDarkMode ? "var(--secondary)" : "var(--white)",
            border: `2px solid ${
              isDarkMode ? "var(--secondary-oscuro)" : "var(--secondary)"
            }`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--secondary)",
                }}
              >
                Total de Juegos
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--secondary)",
                }}
              >
                {Object.values(gameStats).reduce(
                  (acc, stat) => acc + stat.total,
                  0
                )}
              </p>
            </div>
            <Users
              size={24}
              style={{
                color: isDarkMode ? "var(--primary)" : "var(--secondary)",
              }}
            />
          </div>
        </div>

        <div
          className="p-6 rounded-xl shadow-lg"
          style={{
            backgroundColor: isDarkMode ? "var(--primary)" : "var(--white)",
            border: `2px solid ${
              isDarkMode ? "var(--primary-oscuro)" : "var(--primary)"
            }`,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-sm font-medium"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--primary)",
                }}
              >
                Pendientes Hoy
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--primary)",
                }}
              >
                {Object.values(gameStats).filter((stat) => !stat.today).length}
              </p>
            </div>
            <Clock
              size={24}
              style={{
                color: isDarkMode ? "var(--secondary)" : "var(--primary)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Game Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameTypes.map((game) => {
          const Icon = game.icon;
          return (
            <div
              key={game.id}
              className="p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: isDarkMode ? "var(--black)" : "var(--white)",
                border: `2px solid ${game.color}`,
              }}
            >
              {/* Header with icon and status */}
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: game.color }}
                >
                  <Icon size={24} color="var(--white)" />
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      game.stats.today
                        ? "bg-green-500 text-white"
                        : "bg-yellow-500 text-black"
                    }`}
                  >
                    {game.stats.today ? "Configurado" : "Pendiente"}
                  </span>
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${game.color}20`,
                      color: game.color,
                    }}
                  >
                    {game.stats.total} total
                  </span>
                </div>
              </div>

              {/* Title and description */}
              <h3
                className="text-xl font-bold mb-2"
                style={{ color: isDarkMode ? "var(--white)" : "var(--black)" }}
              >
                {game.title}
              </h3>

              <p className="text-sm mb-4" style={{ color: "var(--gris)" }}>
                {game.description}
              </p>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Link
                  href={game.href}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 hover:opacity-90"
                  style={{
                    backgroundColor: game.color,
                    color: "var(--white)",
                  }}
                >
                  <Edit size={16} />
                  Gestionar
                </Link>

                <Link
                  href={`${game.href}/view`}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200 border-2 hover:opacity-90"
                  style={{
                    borderColor: game.color,
                    color: game.color,
                    backgroundColor: "transparent",
                  }}
                >
                  <Eye size={16} />
                  Ver
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div
        className="p-6 rounded-xl shadow-lg"
        style={{
          backgroundColor: isDarkMode ? "var(--black)" : "var(--white)",
          border: `2px solid ${
            isDarkMode ? "var(--primary)" : "var(--secondary)"
          }`,
        }}
      >
        <h2
          className="text-xl font-bold mb-4 flex items-center gap-2"
          style={{ color: isDarkMode ? "var(--white)" : "var(--black)" }}
        >
          <Plus size={20} />
          Acciones Rápidas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            className="flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: isDarkMode
                ? "var(--primary)"
                : "var(--secondary)",
              color: "var(--white)",
            }}
            onClick={() => {
              console.log("Configurar todos los juegos para hoy");
            }}
          >
            <Calendar size={20} />
            <div className="text-left">
              <div className="font-bold text-sm">Configurar Día Completo</div>
              <div className="text-xs opacity-90">
                Configurar todos los juegos para hoy
              </div>
            </div>
          </button>

          <button
            className="flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: isDarkMode
                ? "var(--secondary)"
                : "var(--primary)",
              color: "var(--white)",
            }}
            onClick={() => {
              console.log("Ver estadísticas");
            }}
          >
            <Users size={20} />
            <div className="text-left">
              <div className="font-bold text-sm">Ver Estadísticas</div>
              <div className="text-xs opacity-90">
                Estadísticas de todos los juegos
              </div>
            </div>
          </button>

          <button
            className="flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: isDarkMode
                ? "var(--primary)"
                : "var(--secondary)",
              color: "var(--white)",
            }}
            onClick={() => {
              console.log("Respaldar juegos");
            }}
          >
            <History size={20} />
            <div className="text-left">
              <div className="font-bold text-sm">Respaldar Juegos</div>
              <div className="text-xs opacity-90">
                Crear respaldo de configuraciones
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div
        className="p-6 rounded-xl shadow-lg"
        style={{
          backgroundColor: isDarkMode ? "var(--black)" : "var(--white)",
          border: `2px solid ${
            isDarkMode ? "var(--secondary)" : "var(--primary)"
          }`,
        }}
      >
        <h2
          className="text-xl font-bold mb-4 flex items-center gap-2"
          style={{ color: isDarkMode ? "var(--white)" : "var(--black)" }}
        >
          <Clock size={20} />
          Actividad Reciente
        </h2>

        <div className="space-y-3">
          {[
            {
              action: "Juego de música configurado para hoy",
              time: "Hace 2 horas",
              type: "song",
            },
            {
              action: "Juego de camisetas actualizado",
              time: "Hace 4 horas",
              type: "shirt",
            },
            {
              action: "Nuevo video agregado al juego",
              time: "Hace 6 horas",
              type: "video",
            },
            {
              action: "Juego de carrera configurado",
              time: "Ayer",
              type: "career",
            },
            {
              action: "Pregunta de historia añadida",
              time: "Ayer",
              type: "history",
            },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--secondary)"
                      : "var(--primary)",
                  }}
                />
                <span
                  className="text-sm"
                  style={{
                    color: isDarkMode ? "var(--white)" : "var(--black)",
                  }}
                >
                  {activity.action}
                </span>
              </div>
              <span className="text-xs" style={{ color: "var(--gris)" }}>
                {activity.time}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
