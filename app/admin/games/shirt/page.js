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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { toast } from "sonner";

export default function ShirtGameCalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarClubFilter, setCalendarClubFilter] = useState(""); // "" = global
  const [games, setGames] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [shirts, setShirts] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedShirtId, setSelectedShirtId] = useState("");

  // 🔹 Cargar clubes
  useEffect(() => {
    fetchClubs();
  }, []);

  // 🔹 Cargar juegos según filtro
  useEffect(() => {
    fetchGames(calendarClubFilter);
  }, [calendarClubFilter]);

  // 🔹 Cargar camisetas según filtro y excluir las que ya tienen juego
  useEffect(() => {
    if (calendarClubFilter) {
      fetchShirtsByClub(calendarClubFilter);
    } else {
      fetchAllShirts();
    }
  }, [calendarClubFilter, games]);

  const fetchGames = async (clubId = "") => {
    try {
      let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirt-games`;
      if (clubId) url += `?clubId=${clubId}`;
      else url += `?generalOnly=true`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      setGames(data);
    } catch (err) {
      toast.error("Error al cargar los juegos");
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

  // 🔸 Obtener camisetas del club que no estén usadas
  const fetchShirtsByClub = async (clubId) => {
    try {
      let allShirts = [];
      let page = 1;
      const limit = 12;

      // Obtener ids de camisetas ya usadas (del club y globales)
      const usedShirtIds = new Set(
        games
          .filter(
            (g) =>
              !g.clubId || // juegos globales
              g.clubId._id === clubId // juegos del club actual
          )
          .map((g) => g.shirt._id)
      );

      while (true) {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirts?page=${page}&clubId=${clubId}`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        const availableShirts = data.shirts.filter(
          (s) => !usedShirtIds.has(s._id)
        );

        allShirts = allShirts.concat(availableShirts);

        if (data.shirts.length < limit) break;
        page++;
      }

      setShirts(allShirts);
    } catch (err) {
      toast.error("Error al cargar las camisetas");
    }
  };

  // 🔸 Obtener camisetas globales (de todos los clubes)
  const fetchAllShirts = async () => {
    try {
      let allShirts = [];
      let page = 1;
      const limit = 12;

      // Obtener ids de camisetas ya usadas en juegos globales
      const usedShirtIds = new Set(
        games.filter((g) => !g.clubId).map((g) => g.shirt._id)
      );

      while (true) {
        const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirts?page=${page}`;
        const res = await fetch(url, { credentials: "include" });
        const data = await res.json();

        const availableShirts = data.shirts.filter(
          (s) => !usedShirtIds.has(s._id)
        );

        allShirts = allShirts.concat(availableShirts);

        if (data.shirts.length < limit) break;
        page++;
      }

      setShirts(allShirts);
    } catch (err) {
      toast.error("Error al cargar las camisetas");
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
    setSelectedShirtId(existingGame?.shirt._id || "");
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
      if (gameDate.toDateString() !== date.toDateString()) return false;
      if (calendarClubFilter === "") return !game.clubId;
      return game.clubId?._id === calendarClubFilter;
    });
  };

  const handleCreateOrUpdateGame = async () => {
    if (!selectedDate || !selectedShirtId) {
      toast.error("Debe seleccionar una fecha y una camiseta");
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
      shirt: selectedShirtId,
      clubId: clubIdToUse,
    };

    try {
      const url = existingGame
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirt-games/${existingGame._id}`
        : `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirt-games`;

      const res = await fetch(url, {
        method: existingGame ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success("Juego guardado correctamente");
        setOpenModal(false);
        setSelectedShirtId("");
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
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirt-games/${id}`,
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
                src={game.shirt.images.noSponsors || "/placeholder.svg"}
                alt={game.shirt.type}
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
      <h1 className="text-3xl font-bold mb-4">
        👕 Juegos de Camisetas por Día
      </h1>

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
                ? "Editar juego de camiseta"
                : "Crear nuevo juego de camiseta"}
            </h2>
          </DialogHeader>

          <p className="text-sm mb-4">
            📅{" "}
            {selectedDate
              ? format(selectedDate, "dd 'de' MMMM yyyy", { locale: es })
              : ""}
          </p>

          {/* Camiseta */}
          <div className="mb-3">
            <label className="text-sm font-medium mb-1 block">Camiseta</label>
            <SearchableCustomSelect
              options={shirts.map((s) => ({
                value: s._id,
                label: s.type,
                image: s.images.noSponsors,
                subtitle: s.seasonsUsed?.join(", "),
              }))}
              value={selectedShirtId}
              onChange={setSelectedShirtId}
              placeholder="Seleccionar camiseta..."
              enableSearch
            />
          </div>

          {/* Botones */}
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
