export default function LoadingScreen({ message = "Cargando..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-700 flex items-center justify-center">
      <div className="text-center">
        {/* Spinner animado */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mx-auto"></div>
        </div>

        {/* Mensaje */}
        <p className="text-white text-lg font-medium">{message}</p>

        {/* Puntos animados */}
        <div className="flex justify-center space-x-1 mt-4">
          <div
            className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-2 h-2 bg-white/60 rounded-full animate-pulse"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
