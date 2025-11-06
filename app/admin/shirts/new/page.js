"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShirtIcon, Plus, X, ArrowLeft, Save } from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";

export default function NewShirtPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);

  const [formData, setFormData] = useState({
    clubId: "",
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

  // Dark mode sync
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

  // Load clubs
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setClubs(data))
      .catch((err) => console.error(err));
  }, []);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type, index) => {
    const { value } = e.target;
    if (type === "base" || type === "withoutEmblem" || type === "noSponsors") {
      setFormData((prev) => ({
        ...prev,
        images: { ...prev.images, [type]: value },
      }));
    } else if (type === "withSponsors") {
      const newArr = [...formData.images.withSponsors];
      newArr[index] = value;
      setFormData((prev) => ({
        ...prev,
        images: { ...prev.images, withSponsors: newArr },
      }));
    }
  };

  const handleSponsorChange = (e, index) => {
    const newSponsors = [...formData.sponsors];
    newSponsors[index] = e.target.value;
    setFormData((prev) => ({ ...prev, sponsors: newSponsors }));
  };

  const handleSeasonChange = (e, index) => {
    const newSeasons = [...formData.seasonsUsed];
    newSeasons[index] = e.target.value;
    setFormData((prev) => ({ ...prev, seasonsUsed: newSeasons }));
  };

  // Add/remove fields
  const addSponsorField = () =>
    setFormData((prev) => ({ ...prev, sponsors: [...prev.sponsors, ""] }));
  const removeSponsorField = (index) => {
    const arr = [...formData.sponsors];
    arr.splice(index, 1);
    setFormData((prev) => ({ ...prev, sponsors: arr }));
  };

  const addSeasonField = () =>
    setFormData((prev) => ({
      ...prev,
      seasonsUsed: [...prev.seasonsUsed, ""],
    }));
  const removeSeasonField = (index) => {
    const arr = [...formData.seasonsUsed];
    arr.splice(index, 1);
    setFormData((prev) => ({ ...prev, seasonsUsed: arr }));
  };

  const addWithSponsorsField = () =>
    setFormData((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        withSponsors: [...prev.images.withSponsors, ""],
      },
    }));
  const removeWithSponsorsField = (index) => {
    const arr = [...formData.images.withSponsors];
    arr.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      images: { ...prev.images, withSponsors: arr },
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    const clubId = selectedClub?.value || formData.clubId;
    if (!clubId) return alert("Debes seleccionar un club");

    const cleanedFormData = {
      ...formData,
      clubId,
      sponsors: formData.sponsors.filter((s) => s.trim() !== ""),
      seasonsUsed: formData.seasonsUsed.filter((s) => s.trim() !== ""),
      images: {
        base: formData.images.base.trim(),
        withoutEmblem: formData.images.withoutEmblem.trim(),
        noSponsors: formData.images.noSponsors.trim(),
        withSponsors: formData.images.withSponsors.filter(
          (i) => i.trim() !== ""
        ),
      },
    };

    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(cleanedFormData),
        }
      );
      setLoading(false);

      if (!res.ok) {
        const err = await res.json();
        console.error(err);
        return alert("❌ Error al guardar la camiseta.");
      }

      router.push("/admin/shirts");
    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Error al conectar con el servidor.");
    }
  };

  // Options
  const shirtTypes = [
    "Titular",
    "Suplente",
    "Alternativa",
    "Cuarta",
    "Arquero",
    "Arquero 2",
    "Arquero 3",
    "Entrenamiento",
    "Especial",
  ];
  const brands = [
    "Atomik",
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

  // UI
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
              color: isDarkMode ? "white" : "black",
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <h1
            className="text-2xl font-bold"
            style={{ color: isDarkMode ? "white" : "black" }}
          >
            Nueva Camiseta
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFO */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4 flex items-center gap-2"
            style={{ color: isDarkMode ? "white" : "black" }}
          >
            <ShirtIcon size={20} /> Información Básica
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Club */}
            <div className="md:col-span-3 space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Club *
              </label>
              <SearchableCustomSelect
                options={clubs.map((c) => ({
                  label: c.name,
                  value: c._id,
                  image: c.logo,
                }))}
                value={selectedClub?.value || ""}
                onChange={(val) => {
                  const club = clubs.find((c) => c._id === val);
                  if (club) {
                    setSelectedClub({
                      label: club.name,
                      value: club._id,
                      image: club.logo,
                    });
                    setFormData((prev) => ({ ...prev, clubId: club._id }));
                  }
                }}
                placeholder="Seleccionar club"
                searchPlaceholder="Buscar club..."
                enableSearch
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Tipo *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              >
                {shirtTypes.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Marca
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border"
              >
                <option value="">Seleccionar marca</option>
                {brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Tipo de emblema */}
            <div className="space-y-2">
              <label
                className="block text-sm font-medium"
                style={{ color: isDarkMode ? "white" : "black" }}
              >
                Tipo de Emblema/Escudo *
              </label>
              <select
                name="emblemType"
                value={formData.emblemType || ""}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    emblemType: e.target.value === "" ? null : e.target.value,
                  }))
                }
                className="w-full px-4 py-2 rounded-lg border"
              >
                <option value="">Sin escudo/emblema</option>
                <option value="escudo">Escudo</option>
                <option value="emblema">Emblema</option>
              </select>
            </div>
          </div>
        </div>

        {/* IMAGES */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{ color: isDarkMode ? "white" : "black" }}
          >
            Imágenes
          </h2>

          {/* Imagen base */}
          {formData.emblemType !== null && (
            <div className="mb-3">
              <label className="block text-sm font-medium">Imagen Base</label>
              <input
                type="text"
                value={formData.images.base}
                onChange={(e) => handleImageChange(e, "base")}
                placeholder="URL base"
                className="w-full px-4 py-2 rounded-lg border"
              />
            </div>
          )}

          {/* Sin escudo */}
          <div className="mb-3">
            <label className="block text-sm font-medium">
              Sin Escudo / Emblema
            </label>
            <input
              type="text"
              value={formData.images.withoutEmblem}
              onChange={(e) => handleImageChange(e, "withoutEmblem")}
              placeholder="URL sin escudo"
              className="w-full px-4 py-2 rounded-lg border"
            />
          </div>

          {/* Sin sponsors */}
          <div className="mb-3">
            <label className="block text-sm font-medium">Sin Sponsors</label>
            <input
              type="text"
              value={formData.images.noSponsors}
              onChange={(e) => handleImageChange(e, "noSponsors")}
              placeholder="URL sin sponsors"
              className="w-full px-4 py-2 rounded-lg border"
            />
          </div>

          {/* Imágenes completas con sponsors */}
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Imágenes Completas (con marca, escudo/emblema y sponsors)
              </label>
              <button
                type="button"
                onClick={addWithSponsorsField}
                className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-blue-600 text-white"
              >
                <Plus size={14} /> Agregar
              </button>
            </div>

            {formData.images.withSponsors.map((url, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => handleImageChange(e, "withSponsors", index)}
                  placeholder={`URL de la imagen completa ${index + 1}`}
                  className="flex-1 px-4 py-2 rounded-lg border"
                />
                {formData.images.withSponsors.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeWithSponsorsField(index)}
                    className="p-2 rounded-lg bg-red-600 text-white"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sponsors */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Sponsors</h2>
            <button
              type="button"
              onClick={addSponsorField}
              className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-blue-600 text-white"
            >
              <Plus size={14} /> Agregar
            </button>
          </div>

          {formData.sponsors.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={s}
                onChange={(e) => handleSponsorChange(e, i)}
                placeholder={`Nombre del sponsor ${i + 1}`}
                className="flex-1 px-4 py-2 rounded-lg border"
              />
              {formData.sponsors.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSponsorField(i)}
                  className="p-2 rounded-lg bg-red-600 text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Temporadas */}
        <div
          className="p-6 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "white",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Temporadas</h2>
            <button
              type="button"
              onClick={addSeasonField}
              className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-blue-600 text-white"
            >
              <Plus size={14} /> Agregar
            </button>
          </div>

          {formData.seasonsUsed.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input
                type="text"
                value={s}
                onChange={(e) => handleSeasonChange(e, i)}
                placeholder={`Temporada ${i + 1} (ej: 2024)`}
                className="flex-1 px-4 py-2 rounded-lg border"
              />
              {formData.seasonsUsed.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSeasonField(i)}
                  className="p-2 rounded-lg bg-red-600 text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-lg flex items-center gap-2 bg-gray-300"
          >
            <X size={18} /> Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded-lg flex items-center gap-2 bg-blue-600 text-white"
          >
            <Save size={18} />
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
}
