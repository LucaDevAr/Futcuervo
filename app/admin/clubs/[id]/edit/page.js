"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";
import { FormLayout } from "@/components/admin/form-layout";
import { FormButtons } from "@/components/admin/form-buttons";
import { FormCard } from "@/components/admin/form-card";
import { LoadingState } from "@/components/admin/loading-state";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";
import { useCoachData } from "@/hooks/data/use-coach-data";

export default function EditClubPage() {
  const router = useRouter();
  const params = useParams();
  const clubId = params.id;
  const isDarkMode = useDarkMode();
  const { leagues } = useCoachData();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingClub, setIsLoadingClub] = useState(true);
  const [showCreateLeague, setShowCreateLeague] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    logo: "",
    league: "",
  });

  const [newLeague, setNewLeague] = useState({
    name: "",
    country: "",
    logoUrl: "",
  });

  useEffect(() => {
    const fetchClub = async () => {
      if (!clubId) return;

      try {
        setIsLoadingClub(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs/${clubId}`
        );

        if (response.ok) {
          const clubData = await response.json();
          setFormData({
            name: clubData.name || "",
            logo: clubData.logo || "",
            league: clubData.league._id || "",
          });
        } else {
          toast.error("Error al cargar el club");
          router.push("/admin/clubs");
        }
      } catch (error) {
        console.error("Error cargando club:", error);
        toast.error("Error al cargar el club");
        router.push("/admin/clubs");
      } finally {
        setIsLoadingClub(false);
      }
    };

    fetchClub();
  }, [clubId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLeagueChange = (leagueId) => {
    setFormData((prev) => ({ ...prev, league: leagueId }));
  };

  const handleCreateLeague = async () => {
    if (!newLeague.name.trim() || !newLeague.country.trim()) {
      toast.error("Nombre y país de la liga son obligatorios");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/leagues`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newLeague),
        }
      );

      if (response.ok) {
        const createdLeague = await response.json();
        setFormData((prev) => ({ ...prev, league: createdLeague._id }));
        setNewLeague({ name: "", country: "", logoUrl: "" });
        setShowCreateLeague(false);
        toast.success("Liga creada correctamente");
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al crear la liga");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al crear la liga");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre del club es obligatorio");
      return;
    }

    if (!formData.league) {
      toast.error("Debe seleccionar una liga");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs/${clubId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        toast.success("Club actualizado correctamente");
        router.push("/admin/clubs");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al actualizar el club");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar el club");
    } finally {
      setIsLoading(false);
    }
  };

  const leagueOptions = leagues
    .sort((a, b) => {
      if (a.country.toLowerCase() === "argentina") return -1;
      if (b.country.toLowerCase() === "argentina") return 1;
      return a.name.localeCompare(b.name, "es", { sensitivity: "base" });
    })
    .map((league) => ({
      value: league._id,
      label: league.name,
      image: league.logoUrl,
      subtitle: league.country,
    }));

  if (isLoadingClub) {
    return <LoadingState message="Cargando datos del club..." />;
  }

  return (
    <FormLayout
      title={`Editar Club: ${formData.name}`}
      onSubmit={handleSubmit}
      submitButton={
        <FormButtons
          isLoading={isLoading}
          submitText="Guardar Cambios"
          loadingText="Guardando..."
        />
      }
    >
      <FormCard title="Información del Club" icon={<Building2 size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Nombre del Club *
            </Label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="logo"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Logo (URL)
            </Label>
            <input
              id="logo"
              name="logo"
              value={formData.logo}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
            {formData.logo && (
              <div className="mt-2">
                <img
                  src={formData.logo || "/placeholder.svg"}
                  alt="Vista previa logo"
                  className="w-16 h-16 object-contain border-2 rounded transition-all hover:scale-105"
                  style={{
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Liga *
            </Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <SearchableCustomSelect
                  options={leagueOptions}
                  value={formData.league}
                  onChange={handleLeagueChange}
                  placeholder="Seleccionar liga"
                  searchPlaceholder="Buscar liga..."
                  enableSearch={true}
                />
              </div>
              <button
                type="button"
                onClick={() => setShowCreateLeague(true)}
                className="p-3 rounded-lg hover:scale-105 transition-transform"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--azul-oscuro)"
                    : "var(--gris-claro)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                }}
                title="Crear nueva liga"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </FormCard>

      {/* Modal para crear liga */}
      <Dialog open={showCreateLeague} onOpenChange={setShowCreateLeague}>
        <DialogContent
          style={{
            backgroundColor: isDarkMode
              ? "var(--fondo-oscuro)"
              : "var(--blanco)",
            border: `1px solid ${isDarkMode ? "var(--azul)" : "var(--rojo)"}`,
          }}
        >
          <DialogHeader>
            <DialogTitle
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Crear Nueva Liga
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Nombre de la Liga *
              </Label>
              <input
                value={newLeague.name}
                onChange={(e) =>
                  setNewLeague((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                País *
              </Label>
              <input
                value={newLeague.country}
                onChange={(e) =>
                  setNewLeague((prev) => ({ ...prev, country: e.target.value }))
                }
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              />
            </div>
            <div className="space-y-2">
              <Label
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Logo (URL)
              </Label>
              <input
                value={newLeague.logoUrl}
                onChange={(e) =>
                  setNewLeague((prev) => ({ ...prev, logoUrl: e.target.value }))
                }
                placeholder="https://..."
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCreateLeague(false)}
                className="flex-1 py-2 rounded-lg border transition-colors hover:scale-105"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateLeague}
                className="flex-1 py-2 rounded-lg text-white transition-all hover:scale-105"
                style={{
                  backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              >
                Crear Liga
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </FormLayout>
  );
}
