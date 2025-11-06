interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({
  message = "Verificando progreso...",
}: LoadingScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--azul)] dark:border-[var(--rojo)] mx-auto mb-4"></div>
        <p>{message}</p>
      </div>
    </div>
  );
}
