"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function EditSong({ params }) {
  const { id } = params;
  const [song, setSong] = useState < any > {};
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const coverRef = useRef < HTMLInputElement > null;
  const songRef = useRef < HTMLInputElement > null;
  const [originalYoutubeUrl, setOriginalYoutubeUrl] = useState("");

  useEffect(() => {
    const fetchSong = async () => {
      try {
        const res = await fetch(`/api/songs/${id}`);
        const data = await res.json();
        setSong(data);
        setOriginalYoutubeUrl(data.originalSong?.url || "");
      } catch (err) {
        setError("Error al cargar la canción");
      } finally {
        setLoading(false);
      }
    };
    fetchSong();
  }, [id]);

  if (loading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!song) return <div>Canción no encontrada</div>;

  const handleInputChange = (e) => {
    setSong({ ...song, [e.target.name]: e.target.value });
  };

  const handleOriginalChange = (e) => {
    setSong((prev) => ({
      ...prev,
      originalSong: { ...prev.originalSong, [e.target.name]: e.target.value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let newCover = null;
      let newSong = null;

      if (coverRef.current?.files?.[0]) {
        newCover = await handleUpload(
          coverRef.current.files[0],
          "image",
          "cover"
        );
        song.coverUrl = newCover.url;
        song.coverPublicId = newCover.public_id;
      }

      if (songRef.current?.files?.[0]) {
        newSong = await handleUpload(songRef.current.files[0], "video", "song");
        song.audioUrl = newSong.url;
        song.audioPublicId = newSong.public_id;
        song.duration = newSong.duration;
      }

      const res = await fetch(`/api/songs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
      });

      if (res.ok) {
        router.push("/admin/songs");
      } else {
        throw new Error("Error updating song");
      }
    } catch (err) {
      console.error(err);
      alert("Error actualizando la canción");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpload = async (file, resource_type, folder) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("resource_type", resource_type);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    return await res.json();
  };

  function getYoutubeVideoId(url) {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : "";
  }

  return (
    <div className="container mx-auto p-4">
      <h1
        className="text-2xl font-bold mb-4"
        style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
      >
        Editar Canción
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Información Básica
          </h2>
          <div className="space-y-4">
            <input
              type="text"
              name="title"
              value={song.title || ""}
              onChange={handleInputChange}
              placeholder="Título"
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            />
            <input
              type="text"
              name="artist"
              value={song.artist || ""}
              onChange={handleInputChange}
              placeholder="Artista"
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            />
          </div>
        </div>

        {/* Cover Image */}
        <div
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Imagen de Portada
          </h2>
          <div className="space-y-4">
            {song.coverUrl && (
              <img
                src={song.coverUrl || "/placeholder.svg"}
                alt="Cover"
                className="w-32 h-32 rounded-lg object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              ref={coverRef}
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            />
          </div>
        </div>

        {/* Audio Files */}
        <div
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Archivos de Audio
          </h2>
          <div className="space-y-4">
            {song.audioUrl && (
              <audio controls className="w-full">
                <source src={song.audioUrl} type="audio/mpeg" />
                Tu navegador no soporta el elemento de audio.
              </audio>
            )}
            <input
              type="file"
              accept="audio/*"
              ref={songRef}
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            />
          </div>
        </div>

        {/* Original Song Info */}
        <div
          className="p-6 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
          }}
        >
          <h2
            className="text-xl font-bold mb-4"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Canción Original
          </h2>

          <div className="space-y-4">
            <input
              name="title"
              value={song.originalSong?.title || ""}
              onChange={handleOriginalChange}
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
              placeholder="Título original"
            />

            <input
              name="author"
              value={song.originalSong?.author || ""}
              onChange={handleOriginalChange}
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
              placeholder="Autor original"
            />

            <input
              name="year"
              type="number"
              value={song.originalSong?.year || ""}
              onChange={handleOriginalChange}
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
              placeholder="Año"
              min={1900}
              max={2100}
            />

            <input
              type="url"
              placeholder="URL de YouTube"
              value={originalYoutubeUrl}
              onChange={(e) => {
                setOriginalYoutubeUrl(e.target.value);
                setSong((prev) => ({
                  ...prev,
                  originalSong: { ...prev.originalSong, url: e.target.value },
                }));
              }}
              className="w-full p-3 rounded-lg border-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--gris-claro)",
                borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
              }}
            />

            {originalYoutubeUrl && (
              <div className="mt-4">
                <iframe
                  width="100%"
                  height="200"
                  src={`https://www.youtube.com/embed/${getYoutubeVideoId(
                    originalYoutubeUrl
                  )}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full p-4 rounded-lg font-bold transition-colors"
          style={{
            backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
            color: "var(--blanco)",
            opacity: submitting ? 0.7 : 1,
            cursor: submitting ? "wait" : "pointer",
          }}
        >
          {submitting ? "Actualizando..." : "Actualizar Canción"}
        </button>
      </form>
    </div>
  );
}
