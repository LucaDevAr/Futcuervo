"use client";

import Image from "next/image";

export function HomeInfo() {
  return (
    <>
      {/* Info y previews */}
      <div className="mt-10 max-w-3xl mx-auto text-center px-4 space-y-6 text-sm sm:text-base text-gray-700 dark:text-gray-300">
        <p>
          Bienvenido a <strong>FutCuervo</strong>, la plataforma creada por y
          para hinchas de <strong>San Lorenzo de Almagro</strong>. Aquí
          celebramos la historia, los ídolos y la pasión azulgrana a través de
          juegos y trivias diarias.
        </p>
        <p>
          ¿Cuánto sabés del <em>Ciclón</em>? Participá en desafíos únicos sobre{" "}
          <strong>jugadores históricos</strong>,{" "}
          <strong>camisetas clásicas</strong>,{" "}
          <strong>goles inolvidables</strong>,{" "}
          <strong>técnicos legendarios</strong> y{" "}
          <strong>canciones de la hinchada</strong>.
        </p>
        <p>
          Todos los días nuevos retos para sumar{" "}
          <strong>rachas de victorias</strong> y romper tus{" "}
          <strong>récords personales</strong>. Compará tus resultados con otros
          cuervos y mantené viva la llama azulgrana.
        </p>
        <p>
          FutCuervo no es solo un sitio de juegos, es un homenaje al club de
          nuestros amores. ¡Jugá, compartí y disfrutá la pasión por San Lorenzo
          como nunca antes!
        </p>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold text-[var(--azul)] dark:text-[var(--rojo)] mb-4">
          ¿Cómo se juega?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <Image
            src="/images/preview-player.png"
            alt="Vista previa jugador"
            width={400}
            height={300}
            className="rounded-lg shadow-md"
          />
          <Image
            src="/images/preview-shirt.png"
            alt="Vista previa camiseta"
            width={400}
            height={300}
            className="rounded-lg shadow-md"
          />
          <Image
            src="/images/preview-song.png"
            alt="Vista previa canción"
            width={400}
            height={300}
            className="rounded-lg shadow-md"
          />
        </div>
        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
          Podés ver las reglas y mecánicas detalladas de cada modo de juego en
          la sección <strong>Guía</strong> del menú superior. Ahí encontrarás
          una explicación clara de cómo jugar cada uno.
        </p>
      </div>
    </>
  );
}
