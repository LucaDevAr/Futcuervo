"use client";

import { useEffect } from "react";
import { usePlayerStore } from "@/stores/usePlayerStore";

export default function AudioProvider({ children }) {
  const { initializeAudio, setPlaylist } = usePlayerStore();

  useEffect(() => {
    // Inicializa el sistema de audio
    initializeAudio();

    // Obtiene canciones y establece la playlist
    async function fetchSongs() {
      try {
        const res = await fetch("http://localhost:5000/api/songs");
        const data = await res.json();
        setPlaylist(data);

        if (data.length > 0) {
          console.log("Playlist loaded:", data.length, "songs");
          // No reproducir automáticamente, el usuario debe presionar play
        }
      } catch (error) {
        console.error("Error fetching songs", error);
      }
    }

    fetchSongs();
  }, [initializeAudio, setPlaylist]);

  return <>{children}</>;
}
