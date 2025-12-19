"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Music, Brain, Users, TrendingUp, Calendar, Star } from "lucide-react";

export default function AdminDashboardPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [stats, setStats] = useState({
    totalSongs: 0,
    totalQuizzes: 0,
    totalUsers: 0,
    recentActivity: 5,
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

  // useEffect(() => {
  //   // Fetch stats
  //   const fetchStats = async () => {
  //     try {
  //       const songsRes = await fetch("/api/songs");
  //       const songs = await songsRes.json();
  //       setStats((prev) => ({ ...prev, totalSongs: songs.length }));
  //     } catch (error) {
  //       console.error("Error fetching stats:", error);
  //     }
  //   };

  //   fetchStats();
  // }, []);

  const dashboardCards = [
    {
      title: "Gestionar Canciones",
      description: "Agregar, editar y eliminar canciones del repertorio",
      icon: Music,
      href: "/admin/songs",
      color: isDarkMode ? "var(--primary)" : "var(--secondary)",
      stat: `${stats.totalSongs} canciones`,
    },
    {
      title: "Gestionar Quizzes",
      description: "Crear y administrar preguntas y trivias",
      icon: Brain,
      href: "/admin/quizzes",
      color: isDarkMode ? "var(--secondary)" : "var(--primary)",
      stat: `${stats.totalQuizzes} quizzes`,
    },
    {
      title: "Gestionar Usuarios",
      description: "Administrar usuarios y permisos",
      icon: Users,
      href: "/admin/users",
      color: isDarkMode ? "var(--primary)" : "var(--secondary)",
      stat: `${stats.totalUsers} usuarios`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: isDarkMode ? "var(--white)" : "var(--black)" }}
        >
          Dashboard de Administración
        </h1>
        <p className="text-lg" style={{ color: "var(--gris)" }}>
          Bienvenido al panel de control de FutCuervo
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div
          className="p-6 rounded-xl shadow-lg"
          style={{
            backgroundColor: isDarkMode ? "var(--primary)" : "var(--white)",
            border: `2px solid ${
              isDarkMode ? "var(--primary)" : "var(--primary)"
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
                Total Canciones
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--primary)",
                }}
              >
                {stats.totalSongs}
              </p>
            </div>
            <Music
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
              isDarkMode ? "var(--secondary)" : "var(--secondary)"
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
                Total Quizzes
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--secondary)",
                }}
              >
                {stats.totalQuizzes}
              </p>
            </div>
            <Brain
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
              isDarkMode ? "var(--primary)" : "var(--primary)"
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
                Total Usuarios
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--primary)",
                }}
              >
                {stats.totalUsers}
              </p>
            </div>
            <Users
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
              isDarkMode ? "var(--secondary)" : "var(--secondary)"
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
                Actividad Reciente
              </p>
              <p
                className="text-2xl font-bold"
                style={{
                  color: isDarkMode ? "var(--white)" : "var(--secondary)",
                }}
              >
                {stats.recentActivity}
              </p>
            </div>
            <TrendingUp
              size={24}
              style={{
                color: isDarkMode ? "var(--primary)" : "var(--secondary)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Link
              key={index}
              href={card.href}
              className="block p-6 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
              style={{
                backgroundColor: isDarkMode ? "var(--black)" : "var(--white)",
                border: `2px solid ${card.color}`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: card.color }}
                >
                  <Icon size={24} color="var(--white)" />
                </div>
                <span
                  className="text-sm font-medium px-2 py-1 rounded"
                  style={{
                    backgroundColor: `${card.color}20`,
                    color: card.color,
                  }}
                >
                  {card.stat}
                </span>
              </div>

              <h3
                className="text-xl font-bold mb-2"
                style={{ color: isDarkMode ? "var(--white)" : "var(--black)" }}
              >
                {card.title}
              </h3>

              <p className="text-sm" style={{ color: "var(--gris)" }}>
                {card.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
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
          <Calendar size={20} />
          Actividad Reciente
        </h2>

        <div className="space-y-3">
          {[
            "Nueva canción agregada: 'Himno de San Lorenzo'",
            "Quiz actualizado: 'Historia del Club'",
            "Usuario registrado: admin@futcuervo.com",
            "Canción editada: 'Canción del Cuervo'",
            "Sistema actualizado correctamente",
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)]"
            >
              <Star
                size={16}
                style={{
                  color: isDarkMode ? "var(--secondary)" : "var(--primary)",
                }}
              />
              <span
                className="text-sm"
                style={{ color: isDarkMode ? "var(--white)" : "var(--black)" }}
              >
                {activity}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
