"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { filterByMultipleCriteria } from "@/lib/search-utils";

export function useAdminPage({
  apiEndpoint,
  itemName,
  itemNamePlural,
  searchFields,
  customFilters = [],
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // ✅ Memoizar campos de búsqueda
  const memoizedSearchFields = useMemo(
    () => searchFields,
    [searchFields.join(",")]
  );

  // ✅ Cargar datos desde el API
  // Cargar datos
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiEndpoint, {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          console.log("📦 Datos recibidos:", data);

          // 🔹 Normalización más robusta
          let normalized = [];
          if (Array.isArray(data)) normalized = data;
          else if (Array.isArray(data.players)) normalized = data.players;
          else if (Array.isArray(data.items)) normalized = data.items;
          else if (Array.isArray(data.data)) normalized = data.data;
          else console.warn("⚠️ Datos desconocidos recibidos:", data);

          setItems(normalized);
        } else {
          toast.error(`Error al cargar ${itemNamePlural}`);
        }
      } catch (error) {
        console.error("Error:", error);
        toast.error(`Error al cargar ${itemNamePlural}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiEndpoint, itemNamePlural]);

  // ✅ Siempre trabajar con un array seguro
  const safeItems = Array.isArray(items) ? items : [];

  // ✅ Filtrar items con useMemo
  const filteredItems = useMemo(() => {
    return filterByMultipleCriteria(safeItems, {
      search: searchTerm,
      searchFields: memoizedSearchFields,
      customFilters,
    });
  }, [safeItems, searchTerm, memoizedSearchFields, customFilters]);

  // ✅ Eliminar item
  const handleDelete = useCallback(
    async (itemId, itemDisplayName) => {
      if (
        window.confirm(
          `¿Estás seguro de que quieres eliminar ${itemDisplayName}?`
        )
      ) {
        try {
          const response = await fetch(`${apiEndpoint}/${itemId}`, {
            method: "DELETE",
            credentials: "include",
          });

          if (response.ok) {
            setItems((prev) => prev.filter((item) => item._id !== itemId));
            toast.success(`${itemName} eliminado correctamente`);
          } else {
            toast.error(`Error al eliminar ${itemName.toLowerCase()}`);
          }
        } catch (error) {
          console.error("Error:", error);
          toast.error(`Error al eliminar ${itemName.toLowerCase()}`);
        }
      }
    },
    [apiEndpoint, itemName]
  );

  return {
    items: safeItems,
    filteredItems,
    loading,
    searchTerm,
    setSearchTerm,
    showFilters,
    setShowFilters,
    handleDelete,
  };
}
