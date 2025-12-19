"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BarChart3, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Hooks
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { usePlayerData } from "@/hooks/data/use-player-data";

// Components
import { FormLayout } from "@/components/admin/form-layout";
import { FormButtons } from "@/components/admin/form-buttons";
import { FormCard } from "@/components/admin/form-card";
import { BasicInfoTab } from "@/components/admin/player-form/basic-info-tab";
import { StatsAndTitlesTab } from "@/components/admin/player-form/stats-and-titles-tab";
import { CareerTab } from "@/components/admin/player-form/career-tab";
import { CreateClubModalEnhanced } from "@/components/admin/player-form/create-club-modal-enhanced";
import { CreateLeagueModalEnhanced } from "@/components/admin/player-form/create-league-modal-enhanced";

// Utils
import { createLeague, createClub } from "@/lib/player-utils";

// Form defaults
const PlayerFormData = {
  fullName: "",
  displayName: "",
  nicknames: "",
  birthdate: null,
  debutDate: null,
  retirementDate: null,
  nationality: { name: "", flagImage: "" },
  goals: 0,
  appearances: 0,
  redCards: 0,
  positions: [],
  profileImage: "",
  actionImage: "",
};

const NewClub = { name: "", logo: "", league: "" };
const NewLeague = { name: "", country: "", logoUrl: "" };

// Normalización de ObjectId
function normalizeObjectId(value) {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    if (value.$oid) return value.$oid;
    if (value._id) return value._id;
  }
  return "";
}

export default function EditPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const playerId = params.id;

  const isDarkMode = useDarkMode();
  const {
    clubs,
    leagues,
    countries,
    isLoading: isLoadingData,
    addClub,
    addLeague,
  } = usePlayerData();

  // Form & Tabs
  const [formData, setFormData] = useState(PlayerFormData);
  const [titles, setTitles] = useState([]);
  const [career, setCareer] = useState([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPlayer, setIsLoadingPlayer] = useState(true);

  const [globalStats, setGlobalStats] = useState({
    totalGoals: 0,
    totalAppearances: 0,
    totalAssists: 0,
    totalYellowCards: 0,
    totalRedCards: 0,
  });

  // Stats por club
  const [clubsStats, setClubsStats] = useState([]);
  const [selectedClubId, setSelectedClubId] = useState(null);

  // Handlers generales
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: { ...prev[parent], [child]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? 0 : Number(value),
    }));
  };

  const handleUpdateGlobalStat = (statName, value) => {
    setGlobalStats((prev) => ({ ...prev, [statName]: value }));
  };

  const handleUpdateClubStat = (clubId, statName, value) => {
    setClubsStats((prev) =>
      prev.map((c) =>
        c.club === clubId
          ? {
              ...c,
              [statName]: statName === "actionImage" ? value : Number(value),
            }
          : c
      )
    );
  };

  const handleDateChange = (field, date) => {
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleCountrySelect = (country) => {
    const selectedCountry = countries.find((c) => c.name === country);
    setFormData((prev) => ({
      ...prev,
      nationality: { name: country, flagImage: selectedCountry?.flag || "" },
    }));
  };

  const handlePositionToggle = (position) => {
    setFormData((prev) => {
      const positions = [...prev.positions];
      return positions.includes(position)
        ? { ...prev, positions: positions.filter((p) => p !== position) }
        : { ...prev, positions: [...positions, position] };
    });
  };

  // Variables for modals
  const [newClub, setNewClub] = useState(NewClub);
  const [newLeague, setNewLeague] = useState(NewLeague);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showCreateLeague, setShowCreateLeague] = useState(false);

  // Cargar jugador
  useEffect(() => {
    const fetchPlayer = async () => {
      if (!playerId) return;
      try {
        setIsLoadingPlayer(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/players/${playerId}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Error cargando jugador");
        const data = await res.json();

        setGlobalStats({
          totalGoals: data.totalGoals || 0,
          totalAppearances: data.totalAppearances || 0,
          totalAssists: data.totalAssists || 0,
          totalYellowCards: data.totalYellowCards || 0,
          totalRedCards: data.totalRedCards || 0,
        });

        // FormData
        setFormData({
          fullName: data.fullName || "",
          displayName: data.displayName || "",
          nicknames: data.nicknames?.join(", ") || "",
          birthdate: data.birthdate ? new Date(data.birthdate) : null,
          debutDate: data.debutDate
            ? new Date(data.debutDate)
            : data.debutYear
            ? new Date(data.debutYear, 0, 1)
            : null,
          retirementDate: data.retirementDate
            ? new Date(data.retirementDate)
            : data.retirementYear
            ? new Date(data.retirementYear, 0, 1)
            : null,
          nationality: {
            name: data.nationality?.name || "",
            flagImage: data.nationality?.flagImage || "",
          },
          goals: data.goals || 0,
          appearances: data.appearances || 0,
          redCards: data.redCards || 0,
          positions: data.positions || [],
          profileImage: data.profileImage || "",
          actionImage: data.actionImage || "",
        });

        // Titles
        setTitles(
          data.titles?.map((t) => ({
            name: t.name || "",
            image: t.image || "",
            year: t.year?.toString() || "",
          })) || []
        );

        // Career
        setCareer(
          data.career?.map((c) => ({
            club: normalizeObjectId(c.club?._id || c.club),
            league: normalizeObjectId(c.club?.league || null),
            name: c.name || "",
            joinedDate: c.from ? new Date(c.from) : null,
            leftDate: c.to ? new Date(c.to) : null,
          })) || []
        );

        setClubsStats(
          data.clubsStats?.map((s) => ({
            club: normalizeObjectId(s.club),
            clubName: s.clubName || "",
            goals: s.goals || 0,
            appearances: s.appearances || 0,
            assists: s.assists || 0,
            yellowCards: s.yellowCards || 0,
            redCards: s.redCards || 0,
            actionImage: s.actionImage || "", // Cargando actionImage
          })) || []
        );
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar el jugador");
        router.push("/admin/players");
      } finally {
        setIsLoadingPlayer(false);
      }
    };

    fetchPlayer();
  }, [playerId, router]);

  useEffect(() => {
    if (career.length === 0) return;

    setClubsStats((prevStats) => {
      // Obtener todos los clubIds únicos del career
      const careerClubIds = [
        ...new Set(career.map((c) => c.club).filter(Boolean)),
      ];

      // Crear un mapa de stats existentes por clubId
      const statsMap = new Map(prevStats.map((stat) => [stat.club, stat]));

      // Crear nuevo array de stats sincronizado con career
      const newStats = careerClubIds.map((clubId) => {
        // Si ya existe el stat, mantenerlo
        if (statsMap.has(clubId)) {
          return statsMap.get(clubId);
        }

        // Si no existe, crear uno nuevo
        const club = clubs.find((c) => c._id === clubId);
        return {
          club: clubId,
          clubName: club?.name || "",
          goals: 0,
          appearances: 0,
          assists: 0,
          yellowCards: 0,
          redCards: 0,
          actionImage: "",
        };
      });

      return newStats;
    });
  }, [career, clubs]);

  // Títulos
  const addTitle = () =>
    setTitles((prev) => [...prev, { name: "", image: "", year: "" }]);
  const updateTitle = (index, field, value) =>
    setTitles((prev) => {
      const u = [...prev];
      u[index][field] = value;
      return u;
    });
  const removeTitle = (index) =>
    setTitles((prev) => prev.filter((_, i) => i !== index));

  // Career
  const addClubToCareer = () =>
    setCareer((prev) => [
      ...prev,
      { club: "", league: "", joinedDate: null, leftDate: null },
    ]);
  const updateClubInCareer = (index, field, value) =>
    setCareer((prev) => {
      const u = [...prev];
      u[index][field] = value;
      return u;
    });
  const removeClubFromCareer = (index) =>
    setCareer((prev) => prev.filter((_, i) => i !== index));

  // Stats
  const handleSelectClub = (clubId) => setSelectedClubId(clubId);

  // Create
  const handleCreateLeague = async () => {
    const leagueId = await createLeague(newLeague);
    if (leagueId) {
      addLeague({ ...newLeague, _id: leagueId });
      setNewLeague(NewLeague);
      setShowCreateLeague(false);
      return leagueId;
    }
    return null;
  };

  const handleCreateClub = async () => {
    let leagueId = newClub.league;
    if (!leagueId && newLeague.name) leagueId = await handleCreateLeague();
    if (!leagueId) return;
    const clubId = await createClub(newClub, leagueId);
    if (clubId) {
      const league = leagues.find((l) => l._id === leagueId);
      addClub({
        ...newClub,
        _id: clubId,
        league: league || { _id: leagueId, name: "", country: "" },
      });
      setNewClub(NewClub);
      setShowCreateClub(false);
    }
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (!formData.fullName) {
        toast.error("El nombre del jugador es obligatorio");
        setIsLoading(false);
        return;
      }
      const nicknames = formData.nicknames
        .split(",")
        .map((n) => n.trim())
        .filter(Boolean);
      const formattedCareer = career.map((c) => ({
        club: c.club || null,
        name: clubs.find((club) => club._id === c.club)?.name || c.name || "",
        from: c.joinedDate ? c.joinedDate.toISOString() : null,
        to: c.leftDate ? c.leftDate.toISOString() : null,
      }));

      const payload = {
        ...formData,
        nicknames,
        titles,
        career: formattedCareer,
        clubsStats,
        ...globalStats, // Incluir stats globales
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/players/${playerId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include", // 👈 CLAVE
        }
      );
      if (res.ok) {
        toast.success("Jugador actualizado correctamente");
        router.push("/admin/players");
      } else {
        const err = await res.json();
        toast.error(err.message || "Error al actualizar el jugador");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el jugador");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingPlayer || isLoadingData)
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--azul-oscuro)"
                  : "var(--gris-claro)",
              }}
            >
              <Loader2 size={20} className="animate-spin" />
            </div>
            <h1
              className="text-2xl font-bold"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Editar Jugador
            </h1>
          </div>
        </div>
        <FormCard>
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2
                className="animate-spin"
                size={24}
                style={{ color: isDarkMode ? "var(--azul)" : "var(--rojo)" }}
              />
              <span
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Cargando datos del jugador...
              </span>
            </div>
          </div>
        </FormCard>
      </div>
    );

  return (
    <FormLayout
      title={`Editar Jugador: ${formData.fullName}`}
      onSubmit={handleSubmit}
      submitButton={
        <FormButtons
          isLoading={isLoading}
          submitText="Guardar Cambios"
          loadingText="Guardando..."
        />
      }
    >
      <FormCard>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className="grid grid-cols-3 mb-6"
            style={{
              backgroundColor: isDarkMode
                ? "var(--fondo-oscuro)"
                : "var(--gris-claro)",
            }}
          >
            <TabsTrigger
              value="basic"
              style={{
                backgroundColor:
                  activeTab === "basic"
                    ? isDarkMode
                      ? "var(--azul)"
                      : "var(--rojo)"
                    : "transparent",
                color:
                  activeTab === "basic"
                    ? "var(--blanco)"
                    : isDarkMode
                    ? "var(--blanco)"
                    : "var(--negro)",
              }}
            >
              <User size={16} className="mr-2" /> Datos Básicos
            </TabsTrigger>
            <TabsTrigger
              value="career"
              style={{
                backgroundColor:
                  activeTab === "career"
                    ? isDarkMode
                      ? "var(--azul)"
                      : "var(--rojo)"
                    : "transparent",
                color:
                  activeTab === "career"
                    ? "var(--blanco)"
                    : isDarkMode
                    ? "var(--blanco)"
                    : "var(--negro)",
              }}
            >
              <Briefcase size={16} className="mr-2" /> Trayectoria
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              style={{
                backgroundColor:
                  activeTab === "stats"
                    ? isDarkMode
                      ? "var(--azul)"
                      : "var(--rojo)"
                    : "transparent",
                color:
                  activeTab === "stats"
                    ? "var(--blanco)"
                    : isDarkMode
                    ? "var(--blanco)"
                    : "var(--negro)",
              }}
            >
              <BarChart3 size={16} className="mr-2" /> Stats y Títulos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <BasicInfoTab
              formData={formData}
              countries={countries}
              isDarkMode={isDarkMode}
              onChange={handleChange}
              onDateChange={handleDateChange}
              onCountrySelect={handleCountrySelect}
              onPositionToggle={handlePositionToggle}
            />
          </TabsContent>

          <TabsContent value="stats">
            <StatsAndTitlesTab
              clubsStats={clubsStats}
              onUpdateClubStat={handleUpdateClubStat}
              globalStats={globalStats}
              onUpdateGlobalStat={handleUpdateGlobalStat}
              titles={titles}
              isDarkMode={isDarkMode}
              onAddTitle={addTitle}
              onUpdateTitle={updateTitle}
              onRemoveTitle={removeTitle}
              clubs={clubs}
            />
          </TabsContent>

          <TabsContent value="career">
            <CareerTab
              career={career}
              clubs={clubs}
              leagues={leagues}
              isDarkMode={isDarkMode}
              onAddClub={addClubToCareer}
              onUpdateClub={updateClubInCareer}
              onRemoveClub={removeClubFromCareer}
              onCreateClub={() => setShowCreateClub(true)}
            />
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CreateClubModalEnhanced
          isOpen={showCreateClub}
          onClose={() => setShowCreateClub(false)}
          newClub={newClub}
          leagues={leagues}
          isDarkMode={isDarkMode}
          onClubChange={(field, value) =>
            setNewClub((prev) => ({ ...prev, [field]: value }))
          }
          onCreateClub={handleCreateClub}
          onCreateLeague={() => setShowCreateLeague(true)}
        />
        <CreateLeagueModalEnhanced
          isOpen={showCreateLeague}
          onClose={() => setShowCreateLeague(false)}
          newLeague={newLeague}
          isDarkMode={isDarkMode}
          onLeagueChange={(field, value) =>
            setNewLeague((prev) => ({ ...prev, [field]: value }))
          }
          onCreateLeague={handleCreateLeague}
        />
      </FormCard>
    </FormLayout>
  );
}
