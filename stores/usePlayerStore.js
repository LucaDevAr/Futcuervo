import { create } from "zustand";

// Global audio element - singleton
let globalAudio = null;

const getGlobalAudio = () => {
  if (!globalAudio) {
    globalAudio = new Audio();
    globalAudio.preload = "auto";
    globalAudio.crossOrigin = "anonymous";
  }
  return globalAudio;
};

export const usePlayerStore = create((set, get) => ({
  // Estado inicial
  playlist: [],
  currentSongIndex: 0,
  isPlaying: false,
  volume: 1,
  progress: 0,
  duration: 0,
  isLoading: false,

  // Setters
  setPlaylist: (songs) => set({ playlist: songs }),
  setCurrentSongIndex: (index) => set({ currentSongIndex: index }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setVolume: (volume) => {
    const audio = getGlobalAudio();
    audio.volume = volume;
    set({ volume });
  },
  setProgress: (progress) => set({ progress }),
  setDuration: (duration) => set({ duration }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Inicializar audio con listeners
  initializeAudio: () => {
    const audio = getGlobalAudio();
    const { setIsPlaying, setDuration, updateProgress, handleSongEnd } = get();

    audio.removeEventListener("play", () => {});
    audio.removeEventListener("pause", () => {});
    audio.removeEventListener("loadedmetadata", () => {});
    audio.removeEventListener("timeupdate", () => {});
    audio.removeEventListener("ended", () => {});
    audio.removeEventListener("error", () => {});

    audio.addEventListener("play", () => setIsPlaying(true));
    audio.addEventListener("pause", () => setIsPlaying(false));
    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration) setDuration(audio.duration);
    });
    audio.addEventListener("timeupdate", () =>
      updateProgress(audio.currentTime, audio.duration)
    );
    audio.addEventListener("ended", () => handleSongEnd());
    audio.addEventListener("error", () => setIsPlaying(false));

    audio.volume = get().volume;
  },

  // Controles del player
  togglePlay: () => {
    const audio = getGlobalAudio();
    const { isPlaying, playlist, currentSongIndex } = get();
    if (!playlist.length) return;

    const currentSong = playlist[currentSongIndex];
    if (!currentSong) return;

    if (isPlaying) {
      audio.pause();
    } else {
      if (audio.src !== currentSong.audioUrl) {
        audio.src = currentSong.audioUrl;
        audio.load();
      }
      audio.play().catch(() => set({ isPlaying: false }));
    }
  },

  playSongAtIndex: (index, playlist) => {
    const audio = getGlobalAudio();
    const currentPlaylist = playlist || get().playlist;
    if (index < 0 || index >= currentPlaylist.length) return;

    const newSong = currentPlaylist[index];
    set({
      currentSongIndex: index,
      playlist: currentPlaylist,
      progress: 0,
      isPlaying: true,
    });

    audio.src = newSong.audioUrl;
    audio.load();
    audio.play().catch(() => set({ isPlaying: false }));
  },

  playNext: () => {
    const { currentSongIndex, playlist, playSongAtIndex } = get();
    const nextIndex = (currentSongIndex + 1) % playlist.length;
    playSongAtIndex(nextIndex);
  },

  playPrevious: () => {
    const { currentSongIndex, playlist, playSongAtIndex } = get();
    const prevIndex =
      currentSongIndex === 0 ? playlist.length - 1 : currentSongIndex - 1;
    playSongAtIndex(prevIndex);
  },

  playRandomSong: () => {
    const { playlist, currentSongIndex, playSongAtIndex } = get();
    if (playlist.length <= 1) return;

    let randomIndex;
    do {
      randomIndex = Math.floor(Math.random() * playlist.length);
    } while (randomIndex === currentSongIndex);

    playSongAtIndex(randomIndex);
  },

  seek: (percentage) => {
    const audio = getGlobalAudio();
    const { duration } = get();
    if (duration === 0) return;

    audio.currentTime = (percentage / 100) * duration;
    set({ progress: percentage });
  },

  handleVolumeChange: (newVolume) => {
    const { setVolume } = get();
    setVolume(Math.max(0, Math.min(newVolume, 1)));
  },

  toggleMute: () => {
    const { volume, setVolume } = get();
    setVolume(volume === 0 ? 1 : 0);
  },

  // Helpers
  updateProgress: (currentTime, duration) => {
    if (duration > 0) {
      set({ progress: (currentTime / duration) * 100, duration });
    }
  },

  handleSongEnd: () => {
    const { playNext } = get();
    set({ isPlaying: false });
    playNext();
  },
}));
