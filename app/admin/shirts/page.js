"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShirtIcon,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Building2,
} from "lucide-react";
import { SearchableCustomSelect } from "@/components/ui/searchable-custom-select";

export default function ShirtsPage() {
  const [shirts, setShirts] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterBrand, setFilterBrand] = useState("");
  const [filterClub, setFilterClub] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const router = useRouter();

  // Detect dark mode
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

  // Fetch clubs for filter
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/clubs`,
          { credentials: "include" }
        );
        const data = await res.json();
        setClubs(data);
      } catch (err) {
        console.error("Error fetching clubs:", err);
      }
    };
    fetchClubs();
  }, []);

  // Fetch shirts
  useEffect(() => {
    fetchShirts();
  }, [page, searchTerm, filterType, filterBrand, filterClub]);

  const fetchShirts = async () => {
    try {
      setLoading(true);
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/admin/shirts?page=${page}&search=${searchTerm}&type=${filterType}&brand=${filterBrand}&clubId=${filterClub}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      if (data.shirts) {
        setShirts(data.shirts);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching shirts:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterType("");
    setFilterBrand("");
    setFilterClub("");
    setPage(1);
  };

  const getDisplayImage = (shirt) => {
    return (
      shirt.images?.withSponsors?.[0] ||
      shirt.images?.noSponsors ||
      shirt.images?.withoutEmblem ||
      shirt.images?.base
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-3xl font-bold mb-1"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            Camisetas
          </h1>
          <p className="text-sm" style={{ color: "var(--gris)" }}>
            Gestiona las camisetas históricas del club
          </p>
        </div>
        <Link
          href="/admin/shirts/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-transform hover:scale-105"
          style={{
            backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <Plus size={18} />
          <span>Nueva Camiseta</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-2 flex-wrap">
        {/* Tipo de camiseta */}
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <option value="">Todos los tipos</option>
          {shirtTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        {/* Marca */}
        <select
          value={filterBrand}
          onChange={(e) => {
            setFilterBrand(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <option value="">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>

        {/* Club */}
        <div className="flex-1">
          <SearchableCustomSelect
            options={clubs.map((c) => ({
              label: c.name,
              value: c._id,
              image: c.logo, // <--- esto agrega el logo
            }))}
            value={filterClub}
            onChange={(val) => {
              setFilterClub(val);
              setPage(1);
            }}
            placeholder="Seleccionar club"
            searchPlaceholder="Buscar club..."
            enableSearch={true}
          />
        </div>

        {/* Botón limpiar filtros */}
        {(filterType || filterBrand || filterClub) && (
          <button
            onClick={clearFilters}
            className="p-2 rounded-lg"
            style={{
              backgroundColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
              color: "white",
            }}
            title="Limpiar filtros"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Shirts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl animate-pulse"
              style={{
                backgroundColor: isDarkMode
                  ? "var(--negro)"
                  : "var(--gris-claro)",
              }}
            />
          ))}
        </div>
      ) : shirts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shirts.map((shirt) => (
            <div
              key={shirt._id}
              className="relative rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl"
              style={{
                backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
                border: `1px solid ${
                  isDarkMode ? "var(--azul)" : "var(--rojo)"
                }`,
              }}
            >
              <div className="h-48 overflow-hidden relative">
                {getDisplayImage(shirt) ? (
                  <img
                    src={getDisplayImage(shirt) || "/placeholder.svg"}
                    alt={`Camiseta ${shirt.type}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <ShirtIcon size={64} className="text-gray-400" />
                  </div>
                )}
                <div
                  className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium"
                  style={{
                    backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    color: "white",
                  }}
                >
                  {shirt.type}
                </div>
                {shirt.clubId && (
                  <div
                    className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)",
                      color: "white",
                    }}
                  >
                    {shirt.clubId.logo && (
                      <img
                        src={shirt.clubId.logo}
                        alt={shirt.clubId.name}
                        className="h-4 w-4 object-contain"
                      />
                    )}
                    <span>{shirt.clubId.name}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-xl"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--gris-claro)",
          }}
        >
          <ShirtIcon
            size={64}
            style={{ color: isDarkMode ? "var(--gris)" : "var(--gris-oscuro)" }}
          />
          <h3
            className="mt-4 text-xl font-medium"
            style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
          >
            No se encontraron camisetas
          </h3>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              color: "white",
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ color: isDarkMode ? "white" : "black" }}>
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 rounded"
            style={{
              backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              color: "white",
              opacity: page === totalPages ? 0.5 : 1,
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
