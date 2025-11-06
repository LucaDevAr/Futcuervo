"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Music, Search } from "lucide-react";
import Image from "next/image";

export default function SongsAdminPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/songs");
      const data = await res.json();
      setSongs(data);
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleDelete = async (id, title) => {
    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar la canción "${title}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/songs/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Canción eliminada exitosamente");
        fetchSongs();
      } else {
        alert("Error al eliminar la canción");
      }
    } catch (error) {
      console.error(error);
      alert("Error al eliminar la canción");
    }
  };

  const filteredSongs = songs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDuration = (duration) => {
    if (!duration) return "N/A";
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Gestión de Canciones
          </h1>
          <p className="text-lg" style={{ color: "var(--gris)" }}>
            Administra el repertorio musical de FutCuervo
          </p>
        </div>

        <Link
          href="/admin/songs/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{
            backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            color: "var(--blanco)",
          }}
        >
          <Plus size={20} />
          Nueva Canción
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
          style={{ color: "var(--gris)" }}
        />
        <input
          type="text"
          placeholder="Buscar canciones..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
          }}
        />
      </div>

      {/* Stats */}
      <div
        className="p-4 rounded-lg"
        style={{
          backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
          border: `2px solid ${isDarkMode ? "var(--azul)" : "var(--rojo)"}`,
        }}
      >
        <div className="flex items-center gap-2">
          <Music
            size={20}
            style={{ color: isDarkMode ? "var(--rojo)" : "var(--azul)" }}
          />
          <span
            className="font-medium"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Total: {filteredSongs.length} canciones
          </span>
        </div>
      </div>

      {/* Songs List */}
      {loading ? (
        <div className="text-center py-8" style={{ color: "var(--gris)" }}>
          Cargando canciones...
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-8" style={{ color: "var(--gris)" }}>
          {searchTerm
            ? "No se encontraron canciones con ese término."
            : "No hay canciones disponibles."}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSongs.map((song) => (
            <div
              key={song._id}
              className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            >
              <div className="flex items-center gap-4">
                {/* Cover Image */}
                <div className="flex-shrink-0">
                  <Image
                    src={song.coverUrl || "/placeholder.svg?height=60&width=60"}
                    alt={song.title}
                    width={60}
                    height={60}
                    className="rounded-lg object-cover"
                  />
                </div>

                {/* Song Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-lg truncate"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {song.title}
                  </h3>
                  {song.artist && (
                    <p
                      className="text-sm truncate"
                      style={{ color: "var(--gris)" }}
                    >
                      {song.artist}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <span
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        backgroundColor: `${
                          isDarkMode ? "var(--azul)" : "var(--rojo)"
                        }20`,
                        color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                      }}
                    >
                      {formatDuration(song.duration)}
                    </span>
                    {song.tags && song.tags.length > 0 && (
                      <div className="flex gap-1">
                        {song.tags.slice(0, 2).map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: `${
                                isDarkMode ? "var(--rojo)" : "var(--azul)"
                              }20`,
                              color: isDarkMode ? "var(--rojo)" : "var(--azul)",
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        {song.tags.length > 2 && (
                          <span
                            className="text-xs"
                            style={{ color: "var(--gris)" }}
                          >
                            +{song.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/songs/${song._id}`}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--azul)"
                        : "var(--rojo)",
                      color: "var(--blanco)",
                    }}
                    title="Editar canción"
                  >
                    <Edit size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(song._id, song.title)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)",
                      color: "var(--blanco)",
                    }}
                    title="Eliminar canción"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
