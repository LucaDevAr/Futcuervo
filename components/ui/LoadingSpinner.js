"use client";

function LoadingSpinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
      />
    </div>
  );
}

export default LoadingSpinner;

export function LoadingSpinnerWithText({ text = "Cargando...", size = "md" }) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <LoadingSpinner size={size} />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
    </div>
  );
}
