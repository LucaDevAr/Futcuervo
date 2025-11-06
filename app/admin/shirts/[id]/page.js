"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShirtIcon, Plus, X, ArrowLeft, Save, Trash2 } from "lucide-react";

export default function EditShirtPage({ params }) {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    type: "Titular",
    images: {
      base: "",
      withoutEmblem: "",
      noSponsors: "",
      withSponsors: [""],
    },
    sponsors: [""],
    brand: "",
    seasonsUsed: [""],
    emblemType: "escudo",
  });

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchShirt = async () => {
      try {
        const response = await fetch(`/api/admin/shirts/${params.id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch shirt");
        }

        const data = await response.json();

        // Ensure arrays have at least one empty item for UI
        const shirt = {
          ...data,
          sponsors: data.sponsors?.length ? data.sponsors : [""],
          seasonsUsed: data.seasonsUsed?.length ? data.seasonsUsed : [""],
          emblemType: data.emblemType || "escudo",
          images: {
            base: data.images?.base || "",
            withoutEmblem: data.images?.withoutEmblem || "",
            noSponsors: data.images?.noSponsors || "",
            withSponsors: data.images?.withSponsors?.length
              ? data.images.withSponsors
              : [""],
          },
        };

        setFormData(shirt);
      } catch (error) {
        console.error("Error fetching shirt:", error);
        alert("Error al cargar la camiseta");
      } finally {
        setLoading(false);
      }
    };

    fetchShirt();
  }, [params.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e, type, index) => {
    const { value } = e.target;

    if (type === "base" || type === "withoutEmblem" || type === "noSponsors") {
      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          [type]: value,
        },
      }));
    } else if (type === "withSponsors" && index !== undefined) {
      const newWithSponsors = [...(formData.images.withSponsors || [])];
      newWithSponsors[index] = value;

      setFormData((prev) => ({
        ...prev,
        images: {
          ...prev.images,
          withSponsors: newWithSponsors,
        },
      }));
    }
  };

  const handleSponsorChange = (e, index) => {
    const { value } = e.target;
    const newSponsors = [...formData.sponsors];
    newSponsors[index] = value;

    setFormData((prev) => ({
      ...prev,
      sponsors: newSponsors,
    }));
  };

  const handleSeasonChange = (e, index) => {
    const { value } = e.target;
    const newSeasons = [...formData.seasonsUsed];
    newSeasons[index] = value;

    setFormData((prev) => ({
      ...prev,
      seasonsUsed: newSeasons,
    }));
  };

  const addSponsorField = () => {
    setFormData((prev) => ({
      ...prev,
      sponsors: [...prev.sponsors, ""],
    }));
  };

  const removeSponsorField = (index) => {
    const newSponsors = [...formData.sponsors];
    newSponsors.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      sponsors: newSponsors,
    }));
  };

  const addSeasonField = () => {
    setFormData((prev) => ({
      ...prev,
      seasonsUsed: [...prev.seasonsUsed, ""],
    }));
  };

  const removeSeasonField = (index) => {
    const newSeasons = [...formData.seasonsUsed];
    newSeasons.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      seasonsUsed: newSeasons,
    }));
  };

  const addWithSponsorsField = () => {
    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        withSponsors: [...(prev.images.withSponsors || []), ""],
      },
    }));
  };

  const removeWithSponsorsField = (index) => {
    const newWithSponsors = [...(formData.images.withSponsors || [])];
    newWithSponsors.splice(index, 1);

    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        withSponsors: newWithSponsors,
      },
    }));
  };

  const handleDelete = async () => {
    if (confirm("¿Estás seguro de que quieres eliminar esta camiseta?")) {
      try {
        const response = await fetch(`/api/admin/shirts/${params.id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          router.push("/admin/shirts");
        } else {
          alert("Error al eliminar la camiseta");
        }
      } catch (error) {
        console.error("Error deleting shirt:", error);
        alert("Error al eliminar la camiseta");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Filter out empty values
    const cleanedFormData = {
      ...formData,
      sponsors: formData.sponsors.filter((s) => s.trim() !== ""),
      seasonsUsed: formData.seasonsUsed.filter((s) => s.trim() !== ""),
      images: {
        ...formData.images,
        withSponsors: formData.images.withSponsors?.filter(
          (img) => img.trim() !== ""
        ),
      },
    };

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/shirts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedFormData),
      });

      if (response.ok) {
        router.push("/admin/shirts");
      } else {
        const error = await response.json();
        alert(
          `Error al actualizar la camiseta: ${
            error.message || "Ocurrió un error desconocido"
          }`
        );
      }
    } catch (error) {
      console.error("Error updating shirt:", error);
      alert("Error al actualizar la camiseta");
    } finally {
      setSaving(false);
    }
  };

  const shirtTypes = [
    "Titular",
    "Suplente",
    "Alternativa",
    "Cuarta",
    "Entrenamiento",
    "Especial",
  ];
  const brands = [
    "Adidas",
    "Nike",
    "Puma",
    "Umbro",
    "Kappa",
    "Lotto",
    "Topper",
    "Penalty",
    "Otra",
  ];
  const emblemTypes = [
    { value: "escudo", label: "Escudo" },
    { value: "emblema", label: "Emblema" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: isDarkMode
                ? "var(--azul-oscuro)"
                : "var(--gris-claro)",
              color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-2xl font-bold"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Editar Camiseta
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
          style={{
            backgroundColor: isDarkMode
              ? "var(--rojo-oscuro)"
              : "var(--rojo-claro)",
            color: isDarkMode ? "white" : "var(--rojo)",
          }}
        >
          <Trash2 size={18} />
          <span>Eliminar</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            <ShirtIcon size={20} />
            Información Básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label
                htmlFor="type"
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Tipo de Camiseta *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              >
                {shirtTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="brand"
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Marca
              </label>
              <select
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              >
                <option value="">Seleccionar marca</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="emblemType"
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Tipo de Emblema/Escudo *
              </label>
              <select
                id="emblemType"
                name="emblemType"
                value={formData.emblemType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: isDarkMode
                    ? "var(--fondo-oscuro)"
                    : "var(--blanco)",
                  color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              >
                {emblemTypes.map((emblem) => (
                  <option key={emblem.value} value={emblem.value}>
                    {emblem.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Images Section */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Imágenes
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="baseImage"
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Imagen Base (sin marca, sponsors ni escudo/emblema)
              </label>
              <input
                id="baseImage"
                type="text"
                value={formData.images.base || ""}
                onChange={(e) => handleImageChange(e, "base")}
                placeholder="URL de la imagen"
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
              <label
                htmlFor="withoutEmblemImage"
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Imagen con Marca (sin escudo/emblema ni sponsors)
              </label>
              <input
                id="withoutEmblemImage"
                type="text"
                value={formData.images.withoutEmblem || ""}
                onChange={(e) => handleImageChange(e, "withoutEmblem")}
                placeholder="URL de la imagen"
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
              <label
                htmlFor="noSponsorsImage"
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
              >
                Imagen con Marca y Escudo/Emblema (sin sponsors)
              </label>
              <input
                id="noSponsorsImage"
                type="text"
                value={formData.images.noSponsors || ""}
                onChange={(e) => handleImageChange(e, "noSponsors")}
                placeholder="URL de la imagen"
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
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-sm font-medium"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  Imágenes con Sponsors (completas)
                </label>
                <button
                  type="button"
                  onClick={addWithSponsorsField}
                  className="flex items-center gap-1 text-sm px-2 py-1 rounded"
                  style={{
                    backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    color: "white",
                  }}
                >
                  <Plus size={14} />
                  <span>Agregar</span>
                </button>
              </div>

              {formData.images.withSponsors?.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) =>
                      handleImageChange(e, "withSponsors", index)
                    }
                    placeholder={`URL de la imagen ${index + 1}`}
                    className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--fondo-oscuro)"
                        : "var(--blanco)",
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                      borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    }}
                  />
                  {(formData.images.withSponsors?.length || 0) > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWithSponsorsField(index)}
                      className="p-2 rounded-lg"
                      style={{
                        backgroundColor: isDarkMode
                          ? "var(--rojo-oscuro)"
                          : "var(--rojo-claro)",
                        color: isDarkMode ? "white" : "var(--rojo)",
                      }}
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sponsors Section */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Sponsors
            </h2>
            <button
              type="button"
              onClick={addSponsorField}
              className="flex items-center gap-1 text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                color: "white",
              }}
            >
              <Plus size={14} />
              <span>Agregar</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.sponsors.map((sponsor, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={sponsor}
                  onChange={(e) => handleSponsorChange(e, index)}
                  placeholder={`Nombre del sponsor ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--fondo-oscuro)"
                      : "var(--blanco)",
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
                {formData.sponsors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSponsorField(index)}
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--rojo-oscuro)"
                        : "var(--rojo-claro)",
                      color: isDarkMode ? "white" : "var(--rojo)",
                    }}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Seasons Section */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-xl font-semibold"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Temporadas
            </h2>
            <button
              type="button"
              onClick={addSeasonField}
              className="flex items-center gap-1 text-sm px-2 py-1 rounded"
              style={{
                backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                color: "white",
              }}
            >
              <Plus size={14} />
              <span>Agregar</span>
            </button>
          </div>

          <div className="space-y-2">
            {formData.seasonsUsed.map((season, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={season}
                  onChange={(e) => handleSeasonChange(e, index)}
                  placeholder={`Temporada ${index + 1} (ej: 2014-2015)`}
                  className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--fondo-oscuro)"
                      : "var(--blanco)",
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  }}
                />
                {formData.seasonsUsed.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSeasonField(index)}
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--rojo-oscuro)"
                        : "var(--rojo-claro)",
                      color: isDarkMode ? "white" : "var(--rojo)",
                    }}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg flex items-center gap-2"
            style={{
              backgroundColor: isDarkMode
                ? "var(--fondo-oscuro)"
                : "var(--gris-claro)",
              color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            }}
          >
            <X size={18} />
            <span>Cancelar</span>
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg flex items-center gap-2 text-white"
            style={{
              backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Save size={18} />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
