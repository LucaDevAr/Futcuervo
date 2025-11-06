"use client";

import { useEffect, useState, useMemo } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { toast } from "sonner";

export default function CareerGameCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarClubFilter, setCalendarClubFilter] = useState("");

  const [games, setGames] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");

  // 🧠 Calcular jugadores ya usados
  const usedPlayerIds = useMemo(() => {
    return new Set(
      games
        .filter((g) =>
          calendarClubFilter ? g.clubId?._id === calendarClubFilter : !g.clubId
        )
        .map((g) => g.player._id.toString())
    );
  }, [games, calendarClubFilter]);

  // 🔹 Cargar datos iniciales
  useEffect(() => {
    fetchClubs();
  }, []);

  // 🔹 Cargar juegos según filtro
  useEffect(() => {
    fetchGames(calendarClubFilter);
  }, [calendarClubFilter]);

  // 🔹 Cargar jugadores cuando cambian juegos o filtro
  useEffect(() => {
    if (games.length > 0 || calendarClubFilter === "") {
      if (calendarClubFilter) fetchPlayersByClub(calendarClubFilter);
      else fetchAllPlayers();
    }
  }, [games, calendarClubFilter]);

  const fetchGames = async (clubId = "") => {
    try {
      setLoading(true);
      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/career-games`;
      if (clubId) url += `?clubId=${clubId}`;
      else url += `?generalOnly=true`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      setGames(data || []);
    } catch (err) {
      toast.error("Error al cargar los juegos");
    } finally {
      setLoading(false);
    }
  };

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

  const fetchPlayersByClub = async (clubId) => {
    try {
      setLoading(true);
      let allPlayers = [];
      let page = 1;
      const limit = 12;

      while (true) {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/players?page=${page}&limit=${limit}&clubId=${clubId}`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        const available = data.players.filter(
          (p) => !usedPlayerIds.has(p._id.toString())
        );

        allPlayers = allPlayers.concat(available);
        if (data.players.length < limit) break;
        page++;
      }

      setPlayers(allPlayers);
    } catch (err) {
      toast.error("Error al cargar los jugadores del club");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPlayers = async () => {
    try {
      setLoading(true);
      let allPlayers = [];
      let page = 1;
      const limit = 12;

      while (true) {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/players?page=${page}&limit=${limit}`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        const available = data.players.filter(
          (p) => !usedPlayerIds.has(p._id.toString())
        );

        allPlayers = allPlayers.concat(available);
        if (data.players.length < limit) break;
        page++;
      }

      setPlayers(allPlayers);
    } catch (err) {
      toast.error("Error al cargar los jugadores");
    } finally {
      setLoading(false);
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
    setSelectedPlayerId(existingGame?.player._id || "");
    setOpenModal(true);
  };

  const getGameForDay = (day) => {
    const date = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    return games.find((game) => {
      const gameDate = new Date(game.date);
      const sameDay = gameDate.toDateString() === date.toDateString();
      const sameClub =
        (!calendarClubFilter && !game.clubId) ||
        game.clubId?._id === calendarClubFilter;
      return sameDay && sameClub;
    });
  };

  const handleCreateOrUpdateGame = async () => {
    if (!selectedDate || !selectedPlayerId) {
      toast.error("Debe seleccionar una fecha y un jugador");
      return;
    }

    const clubIdToUse = calendarClubFilter || null;

    const existingGame = games.find(
      (g) =>
        new Date(g.date).toDateString() === selectedDate.toDateString() &&
        (g.clubId?._id || null) === clubIdToUse
    );

    const payload = {
      date: selectedDate.toISOString(),
      player: selectedPlayerId,
      clubId: clubIdToUse,
    };

    try {
      const url = existingGame
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/career-games/${existingGame._id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/career-games`;

      const res = await fetch(url, {
        method: existingGame ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Juego guardado correctamente");
        setOpenModal(false);
        setSelectedPlayerId("");
        fetchGames(calendarClubFilter);
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al guardar el juego");
      }
    } catch (err) {
      toast.error("Error al guardar el juego");
    }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este juego?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/career-games/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        toast.success("Juego eliminado");
        setOpenModal(false);
        fetchGames(calendarClubFilter);
      } else toast.error("Error al eliminar");
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const goToPreviousMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));

  const weekDays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const generateCalendarCells = () => {
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
    const cells = [];

    for (let i = 0; i < firstDayOfWeek; i++)
      cells.push(<div key={`empty-${i}`} className="bg-muted" />);

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
          className={`border relative group cursor-pointer p-1 transition-all min-h-[100px] ${
            isToday ? "bg-primary/10" : "bg-white dark:bg-gray-800"
          } ${game ? "hover:border-primary" : "hover:border-gray-400"}`}
        >
          <span className="text-sm font-medium">{day}</span>
          {game && (
            <div className="absolute bottom-0 left-0 right-0 p-1 flex justify-center items-end">
              <img
                src={game.player.profileImage || "/placeholder.svg"}
                alt={game.player.displayName}
                className="max-h-16 object-contain"
              />
            </div>
          )}
          {!game && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      );
    }
    return cells;
  };

  const calendarClubOptions = clubs.map((club) => ({
    value: club._id,
    label: club.name,
    image: club.logo,
  }));

  return (
    <div className="h-screen flex flex-col p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">👕 Juegos de Carrera por Día</h1>

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
                  { value: "", label: "Juegos Generales (sin club)" },
                  ...calendarClubOptions,
                ]}
                value={calendarClubFilter}
                onChange={setCalendarClubFilter}
                placeholder="Seleccionar club"
                searchPlaceholder="Buscar club..."
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
            {weekDays.map((d) => (
              <div
                key={d}
                className="text-center py-2 font-medium text-sm text-primary"
              >
                {d}
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
        <DialogContent className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 max-w-md">
          <DialogHeader>
            <h2 className="text-lg font-semibold mb-2">
              {getGameForDay(selectedDate?.getDate())
                ? "Editar juego de jugador"
                : "Crear nuevo juego de jugador"}
            </h2>
          </DialogHeader>

          <p className="text-sm mb-4">
            📅{" "}
            {selectedDate
              ? format(selectedDate, "dd 'de' MMMM yyyy", { locale: es })
              : ""}
          </p>

          <div className="mb-3">
            <label className="text-sm font-medium mb-1 block">Jugador</label>
            <SearchableCustomSelect
              options={players.map((s) => ({
                value: s._id,
                label: s.displayName,
                image: s.profileImage,
              }))}
              value={selectedPlayerId}
              onChange={setSelectedPlayerId}
              placeholder="Seleccionar jugador..."
              enableSearch
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            {getGameForDay(selectedDate?.getDate()) && (
              <Button
                variant="destructive"
                onClick={() =>
                  handleDeleteGame(getGameForDay(selectedDate.getDate())._id)
                }
              >
                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
              </Button>
            )}
            <Button onClick={handleCreateOrUpdateGame}>
              <Pencil className="w-4 h-4 mr-1" />{" "}
              {getGameForDay(selectedDate?.getDate()) ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
