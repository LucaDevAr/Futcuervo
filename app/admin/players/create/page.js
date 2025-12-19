"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BarChart3, Briefcase } from "lucide-react";

// Hooks
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { usePlayerData } from "@/hooks/data/use-player-data";
import { usePlayerForm } from "@/hooks/data/use-player-form";

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
import { createLeague, createClub, submitPlayer } from "@/lib/player-utils";

export default function CreatePlayerPage() {
  const router = useRouter();
  const isDarkMode = useDarkMode();
  const { clubs, leagues, countries, addClub, addLeague } = usePlayerData();

  const {
    formData,
    titles,
    careerPath,
    setTitles,
    setCareerPath,
    handleChange,
    handleNumberChange,
    handleDateChange,
    handleCountrySelect,
    handlePositionToggle,
  } = usePlayerForm();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const [globalStats, setGlobalStats] = useState({
    totalGoals: 0,
    totalAppearances: 0,
    totalAssists: 0,
    totalYellowCards: 0,
    totalRedCards: 0,
  });

  // Modal states
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [showCreateLeague, setShowCreateLeague] = useState(false);
  const [newClub, setNewClub] = useState();
  const [newLeague, setNewLeague] = useState();

  // Title handlers
  const addTitle = () => {
    setTitles((prev) => [...prev, { name: "", image: "", year: "" }]);
  };

  const updateTitle = (index, field, value) => {
    setTitles((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeTitle = (index) => {
    setTitles((prev) => prev.filter((_, i) => i !== index));
  };

  // Career handlers
  const addClubToCareer = () => {
    setCareerPath((prev) => [
      ...prev,
      { club: "", league: "", joinedDate: null, leftDate: null },
    ]);
  };

  const updateClubInCareer = (index, field, value) => {
    setCareerPath((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeClubFromCareer = (index) => {
    setCareerPath((prev) => prev.filter((_, i) => i !== index));
  };

  // Clubs stats handlers
  const [clubsStats, setClubsStats] = useState([]);

  useEffect(() => {
    if (careerPath.length === 0) {
      setClubsStats([]);
      return;
    }

    setClubsStats((prevStats) => {
      // Obtener todos los clubIds únicos del career
      const careerClubIds = [
        ...new Set(careerPath.map((c) => c.club).filter(Boolean)),
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
  }, [careerPath, clubs]);

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

  // Create handlers
  const handleCreateLeague = async () => {
    const leagueId = await createLeague(newLeague);
    if (leagueId) {
      const createdLeague = { ...newLeague, _id: leagueId };
      addLeague(createdLeague);
      setNewLeague({ name: "", country: "", logoUrl: "" });
      setShowCreateLeague(false);
      return leagueId;
    }
    return null;
  };

  const handleCreateClub = async () => {
    let leagueId = newClub.league;

    if (!leagueId && newLeague.name) {
      leagueId = await handleCreateLeague();
      if (!leagueId) return;
    }

    const clubId = await createClub(newClub, leagueId);
    if (clubId) {
      const league = leagues.find((l) => l._id === leagueId);
      const createdClub = {
        ...newClub,
        _id: clubId,
        league: league || { _id: leagueId, name: "", country: "" },
      };
      addClub(createdClub);
      setNewClub({ name: "", logo: "", league: "" });
      setShowCreateClub(false);
    }
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await submitPlayer(
      formData,
      titles,
      careerPath,
      clubsStats,
      globalStats
    );
    if (success) {
      router.push("/admin/players");
    }

    setIsLoading(false);
  };

  return (
    <FormLayout
      title="Nuevo Jugador"
      onSubmit={handleSubmit}
      submitButton={
        <FormButtons
          isLoading={isLoading}
          submitText="Guardar"
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
              className="transition-all"
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
              <User size={16} className="mr-2" />
              Datos Básicos
            </TabsTrigger>
            <TabsTrigger
              value="career"
              className="transition-all"
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
              <Briefcase size={16} className="mr-2" />
              Trayectoria
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="transition-all"
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
              <BarChart3 size={16} className="mr-2" />
              Stats y Títulos
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
              career={careerPath}
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
      </FormCard>

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
    </FormLayout>
  );
}
