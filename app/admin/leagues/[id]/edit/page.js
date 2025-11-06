"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { Globe } from "lucide-react";
import { Label } from "@/components/ui/label";
import { FormLayout } from "@/components/admin/form-layout";
import { FormButtons } from "@/components/admin/form-buttons";
import { FormCard } from "@/components/admin/form-card";
import { LoadingState } from "@/components/admin/loading-state";
import { useDarkMode } from "@/hooks/ui/use-dark-mode";

export default function EditLeaguePage() {
  const router = useRouter();
  const params = useParams();
  const leagueId = params.id;
  const isDarkMode = useDarkMode();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLeague, setIsLoadingLeague] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    logoUrl: "",
  });

  useEffect(() => {
    const fetchLeague = async () => {
      if (!leagueId) return;

      try {
        setIsLoadingLeague(true);
        const response = await fetch(`/api/admin/leagues/${leagueId}`);

        if (response.ok) {
          const leagueData = await response.json();
          setFormData({
            name: leagueData.name || "",
            country: leagueData.country || "",
            logoUrl: leagueData.logoUrl || "",
          });
        } else {
          toast.error("Error al cargar la liga");
          router.push("/admin/leagues");
        }
      } catch (error) {
        console.error("Error cargando liga:", error);
        toast.error("Error al cargar la liga");
        router.push("/admin/leagues");
      } finally {
        setIsLoadingLeague(false);
      }
    };

    fetchLeague();
  }, [leagueId, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("El nombre de la liga es obligatorio");
      return;
    }

    if (!formData.country.trim()) {
      toast.error("El país es obligatorio");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/admin/leagues/${leagueId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Liga actualizada correctamente");
        router.push("/admin/leagues");
      } else {
        const error = await response.json();
        toast.error(error.message || "Error al actualizar la liga");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al actualizar la liga");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingLeague) {
    return <LoadingState message="Cargando datos de la liga..." />;
  }

  return (
    <FormLayout
      title={`Editar Liga: ${formData.name}`}
      onSubmit={handleSubmit}
      submitButton={
        <FormButtons
          isLoading={isLoading}
          submitText="Guardar Cambios"
          loadingText="Guardando..."
        />
      }
    >
      <FormCard title="Información de la Liga" icon={<Globe size={20} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Nombre de la Liga *
            </Label>
            <input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Ej: Primera División Argentina"
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
              htmlFor="country"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              País *
            </Label>
            <input
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              placeholder="Ej: Argentina"
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

          <div className="space-y-2 md:col-span-2">
            <Label
              htmlFor="logoUrl"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Logo (URL)
            </Label>
            <input
              id="logoUrl"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              placeholder="https://ejemplo.com/logo.png"
              className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-colors"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--fondo-oscuro)"
                  : "var(--blanco)",
                color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            />
            {formData.logoUrl && (
              <div className="mt-4 flex items-center gap-3">
                <img
                  src={formData.logoUrl || "/placeholder.svg"}
                  alt="Vista previa logo"
                  className="w-16 h-16 object-contain border-2 rounded transition-all hover:scale-105"
                  style={{
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div
                  className="text-sm"
                  style={{
                    color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)",
                  }}
                >
                  Vista previa del logo
                </div>
              </div>
            )}
          </div>
        </div>
      </FormCard>
    </FormLayout>
  );
}
