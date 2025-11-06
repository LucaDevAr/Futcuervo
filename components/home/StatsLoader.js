export function StatsLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-0">
      <div className="w-full max-w-6xl">
        {/* Grid que coincide exactamente con GameGrid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={index}
              className="aspect-square rounded-xl lg:rounded-2xl p-2 sm:p-3 lg:p-4 xl:p-2 flex flex-col items-center justify-center shadow-lg animate-pulse"
              style={{
                backgroundColor:
                  index % 2 === 0 ? "var(--azul)" : "var(--rojo)",
                opacity: 0.3,
              }}
            >
              {/* Skeleton del badge superior derecho */}
              <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-8 h-6 rounded-full bg-white/20 animate-pulse" />

              {/* Skeleton del icono */}
              <div className="flex items-center justify-center mb-1 sm:mb-2 lg:mb-3 xl:mb-4 flex-1">
                <div className="w-16 h-16 md:w-20 md:h-20 lg:w-20 lg:w-20 xl:w-24 xl:h-24 rounded-lg bg-white/20 animate-pulse" />
              </div>

              {/* Skeleton del título */}
              <div className="w-3/4 h-3 sm:h-4 bg-white/20 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Indicador de carga centrado */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center space-x-2 text-gray-500 dark:text-gray-400">
            <svg
              className="animate-spin w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="text-sm font-medium">
              Cargando estadísticas...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
