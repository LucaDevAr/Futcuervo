/**
 * Normaliza texto removiendo acentos y convirtiendo a minúsculas
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^\w\s]/g, "") // Remover caracteres especiales
    .trim();
}

/**
 * Busca texto en múltiples campos con normalización
 */
export function searchInFields(searchTerm, fields) {
  if (!searchTerm.trim()) return true;

  const normalizedSearch = normalizeText(searchTerm);

  return fields.some((field) => {
    if (Array.isArray(field)) {
      // Si es un array (como nicknames), buscar en cada elemento
      return field.some((item) =>
        normalizeText(item).includes(normalizedSearch)
      );
    } else {
      // Si es un string simple
      return normalizeText(field).includes(normalizedSearch);
    }
  });
}

/**
 * Filtra array de objetos por múltiples criterios
 */
export function filterByMultipleCriteria(items, filters) {
  return items.filter((item) => {
    // Filtro de búsqueda por texto
    if (filters.search && filters.searchFields) {
      const searchFields = filters.searchFields.map((field) => {
        const value = item[field];
        return Array.isArray(value) ? value : String(value || "");
      });

      if (!searchInFields(filters.search, searchFields)) {
        return false;
      }
    }

    // Filtros de coincidencia exacta
    if (filters.exactMatches) {
      for (const [key, value] of Object.entries(filters.exactMatches)) {
        if (value && item !== value) {
          return false;
        }
      }
    }

    // Filtros personalizados
    if (filters.customFilters) {
      return filters.customFilters.every((filter) => filter(item));
    }

    return true;
  });
}

/**
 * Búsqueda avanzada en selects con normalización
 */
export function searchInSelectOptions(searchTerm, options) {
  if (!searchTerm.trim()) return options;

  const normalizedSearch = normalizeText(searchTerm);

  return options.filter((option) => {
    const normalizedLabel = normalizeText(option.label);
    const normalizedSubtitle = option.subtitle
      ? normalizeText(option.subtitle)
      : "";

    return (
      normalizedLabel.includes(normalizedSearch) ||
      normalizedSubtitle.includes(normalizedSearch)
    );
  });
}
