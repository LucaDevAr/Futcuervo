"use client";

import { useEffect, useMemo, useState } from "react";
import { format, addMonths, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import {
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Trash2,
  Pencil,
  User,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { toast } from "sonner";

export default function PlayerGameCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarClubFilter, setCalendarClubFilter] = useState("");

  const [games, setGames] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedName, setSelectedName] = useState("");

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
      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/player-games`;
      if (clubId) url += `?clubId=${clubId}`;
      else url += `?generalOnly=true`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setGames(data || []);
    } catch {
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
    } catch {
      toast.error("Error al cargar jugadores del club");
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
    } catch {
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
    setSelectedName(existingGame?.selectedName || "");
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

  const getSelectedPlayer = () =>
    players.find((p) => p._id === selectedPlayerId);

  const getAvailableNames = () => {
    const player = getSelectedPlayer();
    if (!player) return [];
    return player.fullName
      ? player.fullName.split(" ").filter((w) => w.trim() !== "")
      : [];
  };

  const handleCreateOrUpdateGame = async () => {
    if (!selectedDate || !selectedPlayerId || !selectedName) {
      toast.error("Debe seleccionar un jugador y un nombre");
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
      selectedName,
      clubId: clubIdToUse,
    };

    try {
      const url = existingGame
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/player-games/${existingGame._id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/player-games`;

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
        setSelectedName("");
        fetchGames(calendarClubFilter);
      } else {
        const error = await res.json();
        toast.error(error.error || "Error al guardar el juego");
      }
    } catch (err) {
      toast.error("Error al guardar el juego");
      console.error(err);
    }
  };

  const handleDeleteGame = async (id) => {
    if (!confirm("¿Estás seguro de eliminar este juego?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/player-games/${id}`,
        { method: "DELETE", credentials: "include" }
      );
      if (res.ok) {
        toast.success("Juego eliminado");
        setOpenModal(false);
        fetchGames(calendarClubFilter);
      } else toast.error("Error al eliminar");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

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
            <div className="absolute bottom-0 left-0 right-0 p-1 flex flex-col items-center">
              {game.player.profileImage ? (
                <img
                  src={game.player.profileImage}
                  alt={game.player.displayName}
                  className="w-10 h-10 rounded-full object-cover mb-1"
                />
              ) : (
                <User className="h-6 w-6 text-primary mb-1" />
              )}
              <span className="text-xs font-medium truncate">
                {game.selectedName}
              </span>
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
      <h1 className="text-3xl font-bold mb-4">👕 Juegos de Jugador por Día</h1>

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

      {/* Modal con selección de nombre */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <h2 className="text-lg font-semibold mb-4">
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
          {/* Selección de jugador */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Jugador</label>
            <SearchableCustomSelect
              options={players.map((p) => ({
                value: p._id,
                label: p.displayName,
                image: p.profileImage,
              }))}
              value={selectedPlayerId}
              onChange={(id) => {
                setSelectedPlayerId(id);
                setSelectedName("");
              }}
              placeholder="Seleccionar jugador..."
              enableSearch
            />
          </div>

          {/* Selección de nombre */}
          {selectedPlayerId && (
            <div className="mb-6">
              <h3 className="text-md font-semibold mb-3">
                2. Selecciona qué palabra usar para el juego
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Nombre completo:{" "}
                <strong>{getSelectedPlayer()?.fullName}</strong>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {getAvailableNames().map((word, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedName(word)}
                    className={`border rounded-lg p-4 cursor-pointer transition hover:border-primary text-center ${
                      selectedName === word ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <p className="font-medium text-lg">{word}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {word.length} letras
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedName && (
            <div className="p-4 bg-muted rounded-lg mb-6">
              <h4 className="font-semibold mb-2">Vista previa:</h4>
              <div className="flex gap-1 justify-center">
                {selectedName.split("").map((l, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 border-2 border-gray-300 flex items-center justify-center font-bold text-sm uppercase"
                  >
                    {l}
                  </div>
                ))}
              </div>
              <p className="text-center text-xs mt-2">
                Del nombre completo: {getSelectedPlayer()?.fullName}
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2">
            {selectedDate && getGameForDay(selectedDate.getDate()) && (
              <Button
                variant="destructive"
                onClick={() =>
                  handleDeleteGame(getGameForDay(selectedDate.getDate())._id)
                }
              >
                <Trash2 className="w-4 h-4 mr-1" /> Eliminar
              </Button>
            )}
            <Button
              onClick={handleCreateOrUpdateGame}
              disabled={!selectedPlayerId || !selectedName}
            >
              <Pencil className="w-4 h-4 mr-1" /> Guardar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
