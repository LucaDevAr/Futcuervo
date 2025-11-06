"use client";

import { PageHeader } from "./page-header";
import { SearchAndFilters } from "./search-and-filters";
import { EmptyState } from "./empty-state";
import { LoadingState } from "./loading-state";

export function AdminPageLayout({
  title,
  icon,
  count,
  actionButton,
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  showFilters,
  onToggleFilters,
  activeFiltersCount,
  onClearFilters,
  loading,
  isEmpty,
  emptyStateProps,
  isDarkMode,
  filterChildren,
  children,
}) {
  if (loading) {
    return <LoadingState title={title} isDarkMode={isDarkMode} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        icon={icon}
        count={count}
        actionButton={actionButton}
        isDarkMode={isDarkMode}
      />

      <SearchAndFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        searchPlaceholder={searchPlaceholder}
        showFilters={showFilters}
        onToggleFilters={onToggleFilters}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={onClearFilters}
        isDarkMode={isDarkMode}
        filterChildren={filterChildren}
      />

      {isEmpty ? (
        <EmptyState
          icon={icon}
          title={emptyStateProps.title}
          description={emptyStateProps.description}
          actionButton={emptyStateProps.actionButton}
          isDarkMode={isDarkMode}
        />
      ) : (
        children
      )}
    </div>
  );
}
