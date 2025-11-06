"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const NewSongPage = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [tags, setTags] = useState("");
  const [cover, setCover] = useState(null);
  const [songFile, setSongFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [originalTitle, setOriginalTitle] = useState("");
  const [originalAuthor, setOriginalAuthor] = useState("");
  const [originalYear, setOriginalYear] = useState("");
  const [originalYoutubeUrl, setOriginalYoutubeUrl] = useState("");

  const uploadToCloudinary = async (file, resourceType, uploadCategory) => {
    const form = new FormData();
    form.append("file", file);
    form.append("resource_type", resourceType);
    form.append("upload_category", uploadCategory);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: form,
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      console.error("Cloudinary backend upload error:", result.error || result);
      throw new Error("Error subiendo a Cloudinary");
    }

    return result;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      if (!title || !lyrics || !songFile) {
        alert("Por favor completá los campos requeridos.");
        setLoading(false);
        return;
      }

      // Subir portada (opcional)
      const coverData = cover
        ? await uploadToCloudinary(cover, "image", "cover")
        : null;

      // Subir canción (requerido)
      const songData = songFile
        ? await uploadToCloudinary(songFile, "video", "song")
        : null;

      if (!songData?.url) {
        alert("Error al subir el archivo de audio.");
        setLoading(false);
        return;
      }

      // Procesar tags
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Construir objeto de canción
      const newSong = {
        title,
        lyrics,
        tags: tagArray,
        coverUrl: coverData?.url || null,
        coverPublicId: coverData?.public_id || null,
        audioUrl: songData.url,
        audioPublicId: songData.public_id || null,
        duration: songData.duration || null,
        originalSong:
          originalYoutubeUrl &&
          (originalTitle || originalAuthor || originalYear)
            ? {
                title: originalTitle || null,
                url: originalYoutubeUrl,
                author: originalAuthor || null,
                year: originalYear ? Number(originalYear) : null,
              }
            : null,
        createdAt: new Date(),
      };

      const response = await fetch("/api/songs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSong),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/admin/songs");
        }, 2000);
      } else {
        const resJson = await response.json();
        console.error("Error guardando la canción:", resJson.error);
        alert("Error al guardar la canción");
      }
    } catch (error) {
      console.error("Upload failed", error);
      alert("Error al subir la canción");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--background)]">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold">
            Agregar Nueva Canción
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="p-6 rounded-lg border-2 bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]">
            <h2 className="text-xl font-bold mb-4">Información Principal</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />
              <textarea
                placeholder="Letra"
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />
              <input
                type="text"
                placeholder="Tags (separados por coma)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border-2 bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]">
            <h2 className="text-xl font-bold mb-4">Archivos de Audio</h2>
            <div className="space-y-4">
              <label htmlFor="songFile" className="block text-sm font-medium">
                Subir Canción
              </label>
              <input
                type="file"
                id="songFile"
                accept="audio/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setSongFile(e.target.files[0]);
                  }
                }}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />
            </div>
          </div>

          <div className="p-6 rounded-lg border-2 bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]">
            <h2 className="text-xl font-bold mb-4">Imagen de Portada</h2>
            <div className="space-y-4">
              <label htmlFor="cover" className="block text-sm font-medium">
                Subir Portada
              </label>
              <input
                type="file"
                id="cover"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setCover(e.target.files[0]);
                  }
                }}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />
            </div>
          </div>

          {/* Original Song Info */}
          <div className="p-6 rounded-lg border-2 bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]">
            <h2 className="text-xl font-bold mb-4">
              Canción Original (Opcional)
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Título de la canción original"
                value={originalTitle}
                onChange={(e) => setOriginalTitle(e.target.value)}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />

              <input
                type="text"
                placeholder="Autor de la original"
                value={originalAuthor}
                onChange={(e) => setOriginalAuthor(e.target.value)}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />

              <input
                type="number"
                placeholder="Año"
                value={originalYear}
                onChange={(e) => setOriginalYear(e.target.value)}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
                min={1900}
                max={2100}
              />

              <input
                type="url"
                placeholder="URL de YouTube (ej: https://www.youtube.com/watch?v=...)"
                value={originalYoutubeUrl}
                onChange={(e) => setOriginalYoutubeUrl(e.target.value)}
                className="w-full p-3 rounded-lg border-2 transition-colors bg-[var(--primary)] dark:bg-[var(--secondary)] border-[var(--secondary)] dark:border-[var(--primary)]"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 bg-[var(--primary)] dark:bg-[var(--secondary)]"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <span>Guardar Canción</span>
              )}
            </button>
          </div>
          {success && (
            <div
              className="text-green-500 text-center"
              style={{ color: "var(--verde)" }}
            >
              Canción guardada exitosamente!
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewSongPage;
