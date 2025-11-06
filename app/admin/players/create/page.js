"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, BarChart3, Briefcase, Shirt } from "lucide-react";

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
import { JerseysTab } from "@/components/admin/player-form/jerseys-tab";
import { CreateClubModalEnhanced } from "@/components/admin/player-form/create-club-modal-enhanced";
import { CreateLeagueModalEnhanced } from "@/components/admin/player-form/create-league-modal-enhanced";

// Utils
import { createLeague, createClub, submitPlayer } from "@/lib/player-utils";

export default function CreatePlayerPage() {
  const router = useRouter();
  const isDarkMode = useDarkMode();
  const { clubs, leagues, shirts, countries, addClub, addLeague } =
    usePlayerData();

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
    handleShirtToggle,
  } = usePlayerForm();

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

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

    const success = await submitPlayer(formData, titles, careerPath);
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
            className="grid grid-cols-4 mb-6"
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
              value="jerseys"
              className="transition-all"
              style={{
                backgroundColor:
                  activeTab === "jerseys"
                    ? isDarkMode
                      ? "var(--azul)"
                      : "var(--rojo)"
                    : "transparent",
                color:
                  activeTab === "jerseys"
                    ? "var(--blanco)"
                    : isDarkMode
                    ? "var(--blanco)"
                    : "var(--negro)",
              }}
            >
              <Shirt size={16} className="mr-2" />
              Camisetas
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
              formData={formData}
              titles={titles}
              isDarkMode={isDarkMode}
              onNumberChange={handleNumberChange}
              onAddTitle={addTitle}
              onUpdateTitle={updateTitle}
              onRemoveTitle={removeTitle}
            />
          </TabsContent>

          <TabsContent value="career">
            <CareerTab
              careerPath={careerPath}
              clubs={clubs}
              leagues={leagues}
              isDarkMode={isDarkMode}
              onAddClub={addClubToCareer}
              onUpdateClub={updateClubInCareer}
              onRemoveClub={removeClubFromCareer}
              onCreateClub={() => setShowCreateClub(true)}
            />
          </TabsContent>

          <TabsContent value="jerseys">
            <JerseysTab
              shirts={shirts}
              selectedJerseys={formData.jerseysUsed}
              isDarkMode={isDarkMode}
              onShirtToggle={handleShirtToggle}
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
