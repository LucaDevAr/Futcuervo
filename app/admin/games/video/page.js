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
  Building2,
  Video,
  Scissors,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import VideoClipEditor from "@/components/tools/VideoClipEditor";

export default function VideoGameCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarClubFilter, setCalendarClubFilter] = useState(""); // "" = global
  const [games, setGames] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [videos, setVideos] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [activeTab, setActiveTab] = useState("select");
  const [selectedGame, setSelectedGame] = useState(null);

  const [options, setOptions] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  // 🔹 Cargar clubes al iniciar
  useEffect(() => {
    fetchClubs();
  }, []);

  // 🔹 Cargar juegos según el club seleccionado
  useEffect(() => {
    fetchGames(calendarClubFilter);
  }, [calendarClubFilter]);

  // 🔹 Cargar videos disponibles (según club o global)
  useEffect(() => {
    fetchAllVideos();
  }, [calendarClubFilter, games]);

  const fetchClubs = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs`,
        { credentials: "include" }
      );
      const data = await res.json();
      setClubs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGames = async (clubId = "") => {
    try {
      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/video-games`;
      if (clubId) url += `?clubId=${clubId}`;
      else url += `?generalOnly=true`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setGames(data);
    } catch {
      toast.error("Error al cargar los juegos");
    }
  };

  const fetchAllVideos = async () => {
    try {
      const usedVideoIds = new Set(
        games.filter((g) => !g.clubId).map((g) => g.video._id)
      );

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/videos`,
        {
          credentials: "include",
        }
      );
      const data = await res.json();

      const availableVideos = data.filter((v) => !usedVideoIds.has(v._id));
      setVideos(availableVideos);
    } catch {
      toast.error("Error al cargar los videos");
    }
  };

  const handleDayClick = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(date);
    const existingGame = getGameForDay(day);
    setSelectedGame(existingGame || null);
    setSelectedVideoId(existingGame?.video._id || "");
    setOpenModal(true);
    setActiveTab("select");
  };

  const getGameForDay = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return games.find((game) => {
      const gameDate = new Date(game.date);
      if (gameDate.toDateString() !== date.toDateString()) return false;
      if (calendarClubFilter === "") return !game.clubId;
      return game.clubId?._id === calendarClubFilter;
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({ ...opt, isCorrect: i === index }))
    );
  };

  const validateOptions = () => {
    if (options.some((o) => !o.text.trim())) {
      toast.error("Todas las opciones deben tener texto");
      return false;
    }
    if (options.filter((o) => o.isCorrect).length !== 1) {
      toast.error("Debe haber una única opción correcta");
      return false;
    }
    return true;
  };

  const handleCreateOrUpdateGame = async () => {
    if (!selectedDate || !selectedVideoId)
      return toast.error("Selecciona una fecha y un video");

    if (!validateOptions()) return;

    const clubIdToUse = calendarClubFilter || null;
    const existingGame = games.find(
      (g) =>
        new Date(g.date).toDateString() === selectedDate.toDateString() &&
        (g.clubId?._id || null) === clubIdToUse
    );

    const payload = {
      date: selectedDate.toISOString(),
      video: selectedVideoId,
      clubId: clubIdToUse,
      options,
    };

    try {
      const url = existingGame
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/video-games/${existingGame._id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/video-games`;

      const res = await fetch(url, {
        method: existingGame ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Error al guardar el juego");

      toast.success("Juego guardado correctamente");
      setOpenModal(false);
      fetchGames(calendarClubFilter);
    } catch {
      toast.error("Error al guardar el juego");
    }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm("¿Eliminar este juego?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/video-games/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (!res.ok) throw new Error();
      toast.success("Juego eliminado");
      setOpenModal(false);
      fetchGames(calendarClubFilter);
    } catch {
      toast.error("Error al eliminar el juego");
    }
  };

  const goToPreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  // Calendario
  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

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

  const generateCalendarCells = () => {
    const cells = [];

    for (let i = 0; i < firstDayOfWeek; i++)
      cells.push(<div key={`empty-${i}`} className="bg-muted" />);

    for (let day = 1; day <= daysInMonth; day++) {
      const game = getGameForDay(day);
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth.getMonth();

      cells.push(
        <div
          key={`day-${day}`}
          onClick={() => handleDayClick(day)}
          className={`border relative group cursor-pointer p-1 transition-all min-h-[100px]
          ${isToday ? "bg-primary/10" : "bg-white dark:bg-gray-800"}
          ${game ? "hover:border-primary" : "hover:border-gray-400"}`}
        >
          <span className="text-sm font-medium">{day}</span>
          {game ? (
            <div className="absolute bottom-0 left-0 right-0 p-1 flex justify-center items-end">
              {game.video.thumbnailUrl ? (
                <img
                  src={game.video.thumbnailUrl}
                  alt={game.video.title}
                  className="max-h-16 object-contain rounded-md"
                />
              ) : (
                <Video className="h-6 w-6 text-primary opacity-80" />
              )}
            </div>
          ) : (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  const clubOptions = clubs.map((c) => ({
    value: c._id,
    label: c.name,
    image: c.logo,
  }));

  return (
    <div className="h-screen flex flex-col p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">🎮 Juegos de Video por Día</h1>

      {/* Filtro de club */}
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Building2 className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Filtrar calendario por club
              </label>
              <SearchableCustomSelect
                options={[
                  { value: "", label: "Juegos Generales" },
                  ...clubOptions,
                ]}
                value={calendarClubFilter}
                onChange={setCalendarClubFilter}
                placeholder="Seleccionar club"
                enableSearch
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendario */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-primary" />
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
                className="text-center py-2 font-medium text-sm text-primary"
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
              <TabsTrigger value="select">Seleccionar Video</TabsTrigger>
              <TabsTrigger value="edit" disabled={!selectedGame}>
                Editar Clip
              </TabsTrigger>
            </TabsList>

            <TabsContent value="select" className="mt-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto">
                  {videos.map((video) => (
                    <div
                      key={video._id}
                      onClick={() => setSelectedVideoId(video._id)}
                      className={`border rounded p-2 cursor-pointer transition
                        ${
                          selectedVideoId === video._id
                            ? "border-primary"
                            : "hover:border-primary/50"
                        }`}
                    >
                      {video.thumbnailUrl ? (
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-32 object-contain"
                        />
                      ) : (
                        <Video className="h-12 w-12 mx-auto text-primary opacity-60" />
                      )}
                      <p className="text-center text-sm mt-2 font-medium line-clamp-1">
                        {video.title}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Opciones */}
                <div className="space-y-3 mt-4">
                  <h3 className="font-medium">Opciones de respuesta</h3>
                  {options.map((option, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={option.isCorrect ? "default" : "outline"}
                        onClick={() => handleCorrectOptionChange(i)}
                        className={`min-w-[40px] ${
                          option.isCorrect
                            ? "bg-green-600 hover:bg-green-700"
                            : ""
                        }`}
                      >
                        {option.isCorrect ? "✓" : i + 1}
                      </Button>
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Opción ${i + 1}${
                          option.isCorrect ? " (correcta)" : ""
                        }`}
                        className={option.isCorrect ? "border-green-500" : ""}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="edit">
              {selectedGame && (
                <VideoClipEditor
                  videoId={selectedGame.video._id}
                  gameId={selectedGame._id}
                  initialClipStart={selectedGame.clipStart || 0}
                  initialClipEnd={selectedGame.clipEnd || 10}
                  initialAnswerStart={selectedGame.answerStart || 0}
                  initialAnswerEnd={selectedGame.answerEnd || 20}
                  onSave={() => fetchGames(calendarClubFilter)}
                />
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            {selectedGame && (
              <Button
                variant="destructive"
                onClick={() => handleDeleteGame(selectedGame._id)}
              >
                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
              </Button>
            )}
            <Button
              onClick={handleCreateOrUpdateGame}
              disabled={!selectedVideoId}
              className="bg-primary text-white"
            >
              <Pencil className="w-4 h-4 mr-1" /> Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
