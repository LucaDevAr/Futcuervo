"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Medal,
  Award,
  Users,
  Shield,
  Sun,
  CalendarRange,
  CalendarDays,
  CalendarClock,
  Crown,
  IdCard,
} from "lucide-react";
import { rankingsService } from "@/services/rankingsService";
import { getAllClubs } from "@/lib/data/clubs";

export default function Rankings() {
  const [globalUserRankings, setGlobalUserRankings] = useState([]);
  const [clubUserRankings, setClubUserRankings] = useState([]);
  const [clubRankings, setClubRankings] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [selectedType, setSelectedType] = useState("globalUsers");
  const [selectedClub, setSelectedClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clubDropdownOpen, setClubDropdownOpen] = useState(false);

  useEffect(() => {
    loadRankings();
  }, [selectedPeriod, selectedType, selectedClub]);

  const loadRankings = async () => {
    setLoading(true);
    try {
      if (selectedType === "globalUsers") {
        setGlobalUserRankings(
          rankingsService.getUserRankings({ period: selectedPeriod })
        );
      } else if (selectedType === "clubUsers" && selectedClub) {
        setClubUserRankings(
          rankingsService.getClubUserRankings({
            period: selectedPeriod,
            clubId: selectedClub,
          })
        );
      } else if (selectedType === "clubs") {
        setClubRankings(
          rankingsService.getTeamRankings({ period: selectedPeriod })
        );
      }
    } catch (error) {
      console.error("Error loading rankings:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-7 w-7 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <span className="text-xl font-bold text-muted-foreground">
            #{rank}
          </span>
        );
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <p className="text-muted-foreground text-center mb-2">
        Compite y escala en las tablas de posiciones
      </p>

      <Tabs
        value={selectedType}
        onValueChange={(value) => {
          setSelectedType(value);
          if (value === "clubUsers") setClubDropdownOpen(true);
          else setClubDropdownOpen(false);
        }}
        className="flex flex-col flex-1 bg-[var(--secondary)] rounded-lg p-4"
      >
        {/* Tabs principales */}
        <TabsList className="grid grid-cols-3 w-full gap-2 h-12 mb-3 bg-[var(--primary)]">
          <TabsTrigger
            value="globalUsers"
            className="flex items-center gap-2 data-[state=active]:bg-[var(--secondary)]"
          >
            <Users className="h-4 w-4 text-blue-500" /> Global
          </TabsTrigger>

          {/* Tab con dropdown */}
          <TabsTrigger
            className={`data-[state=active]:bg-[var(--secondary)] transition-all ${
              selectedType === "clubUsers" || clubDropdownOpen
                ? "bg-background text-foreground shadow-sm border"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => {
              if (selectedType !== "clubUsers") {
                setSelectedType("clubUsers");
              } else {
                setClubDropdownOpen((prev) => !prev);
              }
            }}
          >
            <IdCard className="h-5 w-5 text-green-500" />
            {selectedClub
              ? getAllClubs().find((c) => c.id === selectedClub)?.name
              : "Por Club"}
            {/* <svg
              className={`h-4 w-4 transition-transform duration-200 ${
                clubDropdownOpen ? "rotate-180" : "rotate-0"
              } ${
                selectedType === "clubUsers"
                  ? "text-foreground"
                  : "text-transparent"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg> */}
          </TabsTrigger>

          <TabsTrigger
            value="clubs"
            className="flex items-center gap-2  data-[state=active]:bg-[var(--secondary)]"
          >
            <Shield className="h-4 w-4 text-red-500" /> Clubes
          </TabsTrigger>
        </TabsList>
        {clubDropdownOpen && selectedType === "clubUsers" && (
          <div className="absolute top-full mt-1 bg-white w-full dark:bg-gray-900 border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {getAllClubs().map((club) => (
              <div
                key={club.id}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => {
                  setSelectedClub(club.id);
                  setClubDropdownOpen(false);
                }}
              >
                {club.name}
              </div>
            ))}
          </div>
        )}

        {/* Tabs de periodo */}
        <Tabs
          value={selectedPeriod}
          onValueChange={(value) => setSelectedPeriod(value)}
          className="flex flex-col flex-1"
        >
          <TabsList className="grid grid-cols-4 w-full gap-2 h-9 mb-3 bg-[var(--primary)]">
            <TabsTrigger
              value="daily"
              className="flex items-center gap-1 data-[state=active]:bg-[var(--secondary)]"
            >
              <Sun className="h-3 w-3 text-orange-500" /> Diario
            </TabsTrigger>
            <TabsTrigger
              value="weekly"
              className="flex items-center gap-1 data-[state=active]:bg-[var(--secondary)]"
            >
              <CalendarRange className="h-3 w-3 text-blue-500" /> Semanal
            </TabsTrigger>
            <TabsTrigger
              value="monthly"
              className="flex items-center gap-1 data-[state=active]:bg-[var(--secondary)]"
            >
              <CalendarDays className="h-3 w-3 text-purple-500" /> Mensual
            </TabsTrigger>
            <TabsTrigger
              value="yearly"
              className="flex items-center gap-1 data-[state=active]:bg-[var(--secondary)]"
            >
              <CalendarClock className="h-3 w-3 text-green-600" /> Anual
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value={selectedPeriod}
            className="flex-1 overflow-y-auto pr-2 scrollbar-thin"
          >
            <RankingsContent
              type={selectedType}
              period={selectedPeriod}
              globalUserRankings={globalUserRankings}
              clubUserRankings={clubUserRankings}
              clubRankings={clubRankings}
              loading={loading}
              getRankIcon={getRankIcon}
            />
          </TabsContent>
        </Tabs>
      </Tabs>
    </div>
  );
}

function RankingsContent({
  type,
  globalUserRankings,
  clubUserRankings,
  clubRankings,
  loading,
  getRankIcon,
}) {
  if (loading) {
    return (
      <div className="flex-1 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 flex items-center space-x-4">
              <div className="w-12 h-12 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
              <div className="h-6 bg-muted rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const entries =
    type === "globalUsers"
      ? globalUserRankings
      : type === "clubUsers"
      ? clubUserRankings
      : clubRankings;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {entries.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No hay rankings disponibles
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          {/* Podio */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {entries.slice(0, 3).map((entry) => (
              <div
                key={entry.rank}
                className={`flex flex-col items-center justify-center p-4 rounded-xl shadow-md ${
                  entry.rank === 1
                    ? "bg-yellow-100"
                    : entry.rank === 2
                    ? "bg-gray-100"
                    : "bg-amber-100"
                }`}
              >
                {getRankIcon(entry.rank)}
                <Avatar className="w-16 h-16 mt-2">
                  <AvatarImage
                    src={entry.avatarUrl || entry.logo}
                    alt={entry.userName || entry.clubName}
                  />
                  <AvatarFallback>
                    {(entry.userName || entry.clubName).charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-2 font-semibold text-center">
                  {entry.userName || entry.clubName}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {entry.teamName ||
                    entry.clubName ||
                    `${entry.memberCount || 0} miembros`}
                </p>
                <Badge variant="secondary" className="mt-2 font-bold">
                  {entry.points || entry.totalPoints} pts
                </Badge>
              </div>
            ))}
          </div>

          {/* Listado resto */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
            {entries.slice(3).map((entry) => (
              <Card key={entry.rank}>
                <CardContent className="p-6 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {getRankIcon(entry.rank)}
                    <Avatar>
                      <AvatarImage
                        src={entry.avatarUrl || entry.logo}
                        alt={entry.userName || entry.clubName}
                      />
                      <AvatarFallback>
                        {(entry.userName || entry.clubName).charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {entry.userName || entry.clubName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {entry.teamName ||
                          entry.clubName ||
                          `${entry.memberCount || 0} miembros`}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {entry.points || entry.totalPoints} pts
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
