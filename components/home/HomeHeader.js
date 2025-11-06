"use client";

export function HomeHeader() {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold text-[var(--azul)] dark:text-[var(--rojo)]">
        Bienvenido a FutCuervo
      </h1>
      <p className="text-base text-gray-400">Selecciona un modo de juego</p>
    </div>
  );
}
