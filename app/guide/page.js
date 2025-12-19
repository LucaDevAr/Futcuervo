import { Separator } from "@/components/ui/separator";
import {
  Goal,
  Shirt,
  Music,
  Video,
  BookOpen,
  Flag,
  Shield,
  CalendarDays,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";

export default function GameGuidePage() {
  const games = [
    {
      name: "Apariciones",
      description: "Adiviná quién tiene más o menos partidos jugados.",
      icon: UserCheck,
      link: "/",
      howToPlay: [
        "Se mostrarán dos jugadores de San Lorenzo.",
        "Debés adivinar si el jugador de la derecha tiene MÁS o MENOS apariciones que el de la izquierda.",
        "Cada acierto suma puntos y te lleva al siguiente par.",
        "Un error te hace perder una vida o termina el juego, según el modo.",
        "El objetivo es lograr la mayor puntuación posible.",
      ],
    },
    {
      name: "Goles",
      description: "Compará y adiviná quién hizo más o menos goles.",
      icon: Goal,
      link: "/",
      howToPlay: [
        "Similar a Apariciones, pero comparás GOLES.",
        "Elegí si el jugador de la derecha tiene MÁS o MENOS goles.",
        "Sumá puntos por cada respuesta correcta.",
        "Un error termina la partida o te hace perder una vida, según el modo.",
      ],
    },
    {
      name: "Carrera",
      description: "Adiviná al jugador según los clubes donde jugó.",
      icon: CalendarDays,
      link: "/",
      howToPlay: [
        "Verás una línea de tiempo con los clubes que integraron la carrera de un jugador.",
        "Escribí su nombre o apodo para acertar.",
        "Cada error revela un nuevo club como pista.",
        "Tenés intentos limitados o vidas según el modo.",
      ],
    },
    {
      name: "Jugador",
      description: "Adiviná quién es el jugador en la imagen.",
      icon: User,
      link: "/",
      howToPlay: [
        "Se mostrará una imagen de un jugador del Ciclón.",
        "Escribí su nombre o apodo para adivinar.",
        "Tenés 6 intentos para acertar.",
        "El sistema indicará letras correctas, incorrectas o mal ubicadas.",
      ],
    },
    {
      name: "Camiseta",
      description: "Reconocé camisetas históricas del club.",
      icon: Shirt,
      link: "/",
      howToPlay: [
        "Vas a ver una camiseta histórica de San Lorenzo.",
        "Tenés que adivinar el año, la marca o el sponsor.",
        "Cada error revelará una nueva pista.",
        "Tenés intentos limitados o vidas según el modo.",
      ],
    },
    {
      name: "Canción",
      description: "Adiviná la canción escuchando un fragmento.",
      icon: Music,
      link: "/",
      howToPlay: [
        "Escucharás una parte de una canción de la hinchada.",
        "Adiviná el título o una palabra clave de la letra.",
        "Si fallás, recibirás pistas adicionales.",
        "Tenés intentos limitados o vidas según el modo.",
      ],
    },
    {
      name: "Video",
      description: "Reconocé momentos históricos en video.",
      icon: Video,
      link: "/",
      howToPlay: [
        "Verás un fragmento de video del club.",
        "Adiviná el jugador, evento o año del momento.",
        "Se te darán pistas si fallás.",
        "Completá antes de que se acabe el tiempo o sin perder vidas, según el modo.",
      ],
    },
    {
      name: "Equipo Nacional",
      description:
        "Armá un once ideal con jugadores del Ciclón y otro club nacional.",
      icon: Flag,
      link: "/",
      howToPlay: [
        "Completá una formación táctica con jugadores que jugaron en San Lorenzo y otro club nacional (no selección).",
        "No podés repetir jugadores ni clubes.",
        "Arrastrá cada jugador a la posición correspondiente.",
        "Completá antes de que se acabe el tiempo o sin perder vidas, según el modo.",
        "El juego valida si tu equipo es válido.",
      ],
    },
    {
      name: "Equipo de Liga",
      description: "Combiná jugadores del Ciclón y otro club.",
      icon: Shield,
      link: "/",
      howToPlay: [
        "Armá un equipo ideal con jugadores que hayan pasado por San Lorenzo y otro club.",
        "Debés respetar la táctica y la coherencia del plantel.",
        "El juego valida si la alineación tiene sentido.",
        "Completá dentro del tiempo o sin perder vidas, según el modo.",
      ],
    },
    {
      name: "Historia",
      description: "Responde preguntas sobre la historia del club.",
      icon: BookOpen,
      link: "/",
      howToPlay: [
        "Se te harán preguntas tipo trivia sobre San Lorenzo.",
        "Elegí la respuesta correcta entre las opciones.",
        "Sumás puntos por cada acierto.",
        "El objetivo es contestar la mayor cantidad posible antes de que se acabe el tiempo o sin perder vidas.",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-rojo to-azul dark:text-[var(--white)]">
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Guía de Juegos
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            Aprendé las reglas de cada modo y poné a prueba tus conocimientos
            azulgranas.
          </p>
        </section>

        <div className="max-w-5xl mx-auto space-y-10">
          {games.map((game, index) => {
            const bgClass =
              index % 2 === 0
                ? "bg-[var(--secondary)] dark:bg-[var(--primary)]"
                : "bg-[var(--primary)] dark:bg-[var(--secondary)]";

            return (
              <div
                key={index}
                className={`${bgClass} text-[var(--white)] rounded-xl p-6 md:p-8 shadow-xl transition-all`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <game.icon className="h-10 w-10 text-white" />
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold">
                      {game.name}
                    </h2>
                    <p className="text-base md:text-lg opacity-90">
                      {game.description}
                    </p>
                  </div>
                </div>
                <Separator className="my-4 bg-white/30" />
                <h3 className="text-xl font-semibold mb-2">Cómo se juega:</h3>
                <ol className="list-decimal list-inside ml-4 space-y-2 text-sm md:text-base">
                  {game.howToPlay.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
                <div className="text-center mt-6">
                  <Link href={game.link}>
                    <Button className="bg-[var(--white)] text-[var(--primary)] dark:text-[var(--secondary)] hover:bg-white/80 px-8 py-3 text-lg rounded-full font-bold shadow-md transition-transform hover:scale-105">
                      Jugar {game.name}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </main>
      <Footer />
    </div>
  );
}
