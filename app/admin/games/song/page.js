"use client";

import { useEffect, useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Trash2,
  Pencil,
  Music,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import AudioClipEditor from "@/components/tools/AudioClipEditor";

export default function SongGameCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [games, setGames] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [songs, setSongs] = useState([]);
  const [selectedSongId, setSelectedSongId] = useState("");
  const [activeTab, setActiveTab] = useState("select");
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetchGames();
    fetchSongs();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const existingGame = getGameForDay(selectedDate.getDate());
      setSelectedGame(existingGame || null);
      setSelectedSongId(existingGame?.song._id || "");
    } else {
      setSelectedGame(null);
    }
  }, [selectedDate, games]);

  const fetchGames = async () => {
    const res = await fetch("/api/admin/song-games");
    const data = await res.json();
    setGames(data);
  };

  const fetchSongs = async () => {
    const res = await fetch("/api/songs");
    const data = await res.json();
    setSongs(data);
  };

  const handleDayClick = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(date);
    setActiveTab("select");
    setOpenModal(true);
  };

  const getGameForDay = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return games.find(
      (game) => new Date(game.date).toDateString() === date.toDateString()
    );
  };

  const handleCreateOrUpdateGame = async () => {
    if (!selectedDate || !selectedSongId) return;

    const existingGame = games.find(
      (game) =>
        new Date(game.date).toDateString() === selectedDate.toDateString()
    );

    // Determinar los valores de clipStart y clipEnd
    let clipStart = 0;
    let clipEnd = 10;

    // Si estamos actualizando un juego existente, mantener sus valores de clip
    if (existingGame) {
      clipStart =
        existingGame.clipStart !== undefined ? existingGame.clipStart : 0;
      clipEnd =
        existingGame.clipEnd !== undefined
          ? existingGame.clipEnd
          : clipStart + 10;
    }

    // Asegurar que la duración sea exactamente de 10 segundos
    if (clipEnd - clipStart !== 10) {
      clipEnd = clipStart + 10;
    }

    const payload = {
      date: selectedDate.toISOString(),
      song: selectedSongId,
      clipStart,
      clipEnd,
    };

    const res = await fetch(
      existingGame
        ? `/api/admin/song-games/${existingGame._id}`
        : "/api/admin/song-games",
      {
        method: existingGame ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (res.ok) {
      toast.success("Juego guardado correctamente");
      setOpenModal(false);
      setSelectedSongId("");
      fetchGames();
    } else {
      toast.error("Error al guardar el juego");
    }
  };

  const handleDeleteGame = async (id) => {
    const res = await fetch(`/api/admin/song-games/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Juego eliminado");
      setOpenModal(false);
      fetchGames();
    } else {
      toast.error("Error al eliminar");
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const lastDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const generateCalendarCells = () => {
    const cells = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      cells.push(<div key={`empty-${i}`} className="bg-muted" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const game = getGameForDay(day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth() &&
        new Date().getFullYear() === currentMonth.getFullYear();

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={`border relative group cursor-pointer p-1 transition-all
            ${isToday ? "bg-primary-light" : "bg-white dark:bg-gray-800"}
            ${
              game
                ? "hover:border-[var(--primary)] dark:hover:border-[var(--secondary)]"
                : "hover:border-gray-400"
            }`}
        >
          <span className="text-sm font-medium">{day}</span>

          {game ? (
            <div className="absolute bottom-0 left-0 right-0 p-1 flex justify-center items-end">
              {game.song.coverUrl ? (
                <img
                  src={game.song.coverUrl || "/placeholder.svg"}
                  alt={game.song.title}
                  className="max-h-12 object-contain rounded-md"
                />
              ) : (
                <div className="h-12 w-12 flex items-center justify-center bg-[var(--primary)] dark:bg-[var(--secondary)] rounded-md">
                  <Music className="h-6 w-6 text-white" />
                </div>
              )}

              {/* Indicador de clip configurado */}
              {(game.clipStart !== undefined || game.clipEnd !== undefined) && (
                <div className="absolute top-0 right-0 bg-[var(--primary)] dark:bg-[var(--secondary)] rounded-bl-lg p-0.5 text-white">
                  <Scissors className="h-3 w-3" />
                </div>
              )}
            </div>
          ) : (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <PlusCircle className="h-5 w-5 text-[var(--primary)] dark:text-[var(--secondary)]" />
            </div>
          )}
        </div>
      );
    }

    return cells;
  };

  const getAvailableSongs = () => {
    const assignedSongIds = games
      .filter((game) => {
        if (!selectedDate) return true;
        return (
          new Date(game.date).toDateString() !== selectedDate.toDateString()
        );
      })
      .map((g) => g.song._id);

    return songs.filter((song) => !assignedSongIds.includes(song._id));
  };

  const handleClipSaved = () => {
    // Actualizar la lista de juegos después de guardar el clip
    fetchGames();
  };

  return (
    <div className="h-screen flex flex-col p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">
        🎵 Modo Música - Juegos por Día
      </h1>
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-[var(--primary)] dark:text-[var(--secondary)]" />
              <span className="capitalize">
                {format(currentMonth, "MMMM yyyy", { locale: es })}
              </span>
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={goToPreviousMonth} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={goToNextMonth} variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center py-2 font-medium text-sm text-[var(--primary)] dark:text-[var(--secondary)]"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 flex-1">
            {generateCalendarCells()}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <h2 className="text-lg font-semibold mb-4">
              {selectedDate
                ? format(selectedDate, "PPP", { locale: es })
                : "Fecha"}
            </h2>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="select">Seleccionar Canción</TabsTrigger>
              <TabsTrigger value="edit" disabled={!selectedGame}>
                Editar Clip
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="mt-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto">
                {getAvailableSongs().map((song) => (
                  <div
                    key={song._id}
                    onClick={() => setSelectedSongId(song._id)}
                    className={`border rounded p-2 cursor-pointer transition hover:border-[var(--primary)] dark:hover:border-[var(--secondary)] ${
                      selectedSongId === song._id
                        ? "border-[var(--primary)] dark:border-[var(--secondary)]"
                        : ""
                    }`}
                  >
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl || "/placeholder.svg"}
                        alt={song.title}
                        className="w-full h-32 object-contain"
                      />
                    ) : (
                      <div className="w-full h-32 flex items-center justify-center bg-[var(--primary)] dark:bg-[var(--secondary)] bg-opacity-20 dark:bg-opacity-20 rounded-md">
                        <Music className="h-12 w-12 text-[var(--primary)] dark:text-[var(--secondary)]" />
                      </div>
                    )}
                    <p className="text-center text-sm mt-2 font-medium line-clamp-1">
                      {song.title}
                    </p>
                    {song.originalSong && (
                      <p className="text-center text-xs text-muted-foreground line-clamp-1">
                        {song.originalSong.title} - {song.originalSong.author}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="edit">
              {selectedGame && (
                <AudioClipEditor
                  audioUrl={selectedGame.song.audioUrl}
                  gameId={selectedGame._id}
                  initialClipStart={selectedGame.clipStart || 0}
                  initialClipEnd={selectedGame.clipEnd || 10}
                  duration={selectedGame.song.duration}
                  onSave={handleClipSaved}
                />
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            {selectedDate && selectedGame && (
              <Button
                variant="destructive"
                onClick={() => handleDeleteGame(selectedGame._id)}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Eliminar
              </Button>
            )}
            <Button
              onClick={handleCreateOrUpdateGame}
              disabled={!selectedSongId}
              className="bg-[var(--primary)] hover:bg-[var(--primary)] dark:bg-[var(--secondary)] dark:hover:bg-[var(--secondary)]"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
