import {
  BookOpen,
  Music,
  Shirt,
  Users,
  Film,
  CircleUserRound,
  User,
  Earth,
} from "lucide-react";
import { BiFootball } from "react-icons/bi";

export const GAME_CONFIGS = {
  history: {
    title: "Historia",
    icon: BookOpen,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 rounded-2xl bg-[var(--primary)] dark:bg-[var(--secondary)] flex items-center justify-center shadow-2xl mb-6">
          <BookOpen size={96} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
          Historia del día
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)] text-center">
          Pon a prueba tu conocimiento histórico
        </p>
      </div>
    ),
    objective: "Responde correctamente sobre la historia de San Lorenzo",
    timeLimit: 300,
    modes: ["time", "lives"],
    rules: {
      time: [
        "Selecciona la opción que creas correcta",
        "Completalo antes de que acabe el tiempo",
      ],
      lives: [
        "Selecciona la opción que creas correcta",
        "Completalo sin perder todas las vidas",
      ],
      normal: ["Selecciona la opción que creas correcta"],
    },
    mediaTypes: ["image", "video", "youtube"],
    questionBased: true,
    stepBased: false,
    lives: 3,
    useStreak: true,
  },

  shirt: {
    title: "Camiseta",
    icon: Shirt,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 rounded-2xl bg-[var(--primary)] dark:bg-[var(--secondary)] flex items-center justify-center shadow-2xl mb-6">
          <Shirt size={96} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
          Camiseta del día
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)]">
          Pon a prueba tus conocimientos de indumentaria
        </p>
      </div>
    ),
    objective: "Adivina todos los detalles de la camiseta",
    timeLimit: 300,
    modes: ["time", "lives"],
    rules: {
      time: [
        "Escudo o emblema",
        "Marca de la camiseta",
        "Cantidad y nombres de sponsors",
        "Temporadas en que se usó",
        "Completalo antes de que acabe el tiempo",
      ],
      lives: [
        "Escudo o emblema",
        "Marca de la camiseta",
        "Cantidad y nombres de sponsors",
        "Temporadas en que se usó",
        "Completalo sin perder todas las vidas",
      ],
      normal: [
        "Escudo o emblema",
        "Marca de la camiseta",
        "Cantidad y nombres de sponsors",
        "Temporadas en que se usó",
      ],
    },
    mediaTypes: ["image"],
    questionBased: false,
    stepBased: true,
    lives: 3,
    useStreak: true,
  },

  song: {
    title: "Música",
    icon: Music,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 rounded-2xl bg-[var(--primary)] dark:bg-[var(--secondary)] flex items-center justify-center shadow-2xl mb-6">
          <Music size={96} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
          Canción del día
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)]">
          Pon a prueba tu conocimiento musicale
        </p>
      </div>
    ),
    objective: "Adivina la canción y sus detalles originales",
    timeLimit: 300,
    modes: ["time", "lives"],
    rules: {
      time: [
        "Escucha el fragmento de audio",
        "Identifica la canción y sus detalles",
        "Responde correctamente para avanzar",
        "Completalo antes de que acabe el tiempo",
      ],
      lives: [
        "Escucha el fragmento de audio",
        "Identifica la canción y sus detalles",
        "Responde correctamente para avanzar",
        "Completalo sin perder todas las vidas",
      ],
      normal: [
        "Escucha el fragmento de audio",
        "Identifica la canción y sus detalles",
        "Responde correctamente para avanzar",
      ],
    },
    mediaTypes: ["audio", "image", "youtube"],
    questionBased: false,
    stepBased: true,
    lives: 3,
    useStreak: true,
  },

  video: {
    title: "Video",
    icon: Film,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 rounded-2xl bg-[var(--primary)] dark:bg-[var(--secondary)] flex items-center justify-center shadow-2xl mb-6">
          <Film size={96} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
          Video del día
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)]">
          Pon a prueba tu conocimiento futbolístico
        </p>
      </div>
    ),
    objective:
      "Mira el video y adivina cómo termina la jugada entre las opciones disponibles",
    modes: ["normal"],
    rules: {
      time: [
        "Observa atentamente el video",
        "Selecciona la opción correcta",
        "Verás la jugada completa al final",
      ],
      lives: [
        "Observa atentamente el video",
        "Selecciona la opción correcta",
        "Verás la jugada completa al final",
      ],
      normal: [
        "Observa atentamente el video",
        "Selecciona la opción correcta",
        "Verás la jugada completa al final",
      ],
    },
    mediaTypes: ["video"],
    questionBased: true,
    stepBased: false,
    timeLimit: 300,
    lives: 3,
    useStreak: true,
  },

  goals: {
    title: "Más o Menos Goles",
    icon: BiFootball,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg w-72 text-center">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col items-center">
              <User className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] mb-2" />
              <h3 className="font-bold text-sm text-[var(--primary)] dark:text-[var(--blanco)] truncate">
                Jugador 1
              </h3>
              <p className="text-lg font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
                20 goles
              </p>
            </div>

            <div className="h-36 w-[1px] bg-white"></div>

            <div className="flex-1 flex flex-col items-center">
              <User className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] mb-2" />
              <h3 className="font-bold text-sm text-[var(--primary)] dark:text-[var(--blanco)] truncate">
                Jugador 2
              </h3>
              <p className="text-lg font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
                11 goles
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-green-600 text-white">
              Más
            </button>
            <button className="flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-[var(--secondary)] text-white">
              Menos
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--blanco)] mt-4">
          Más o Menos Goles
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)] text-center">
          ¿Tiene más o menos goles que el anterior?
        </p>
      </div>
    ),
    objective: "Adivina si el jugador tiene más o menos goles que el anterior",
    timeLimit: 60,
    modes: ["time", "normal"],
    rules: {
      time: [
        "Compara los goles de cada jugador",
        "Un error y termina el juego",
        "Acumula puntos por cada acierto",
        "Completalo antes de que acabe el tiempo",
      ],
      lives: [
        "Compara los goles de cada jugador",
        "Un error y termina el juego",
        "Acumula puntos por cada acierto",
      ],
      normal: [
        "Compara los goles de cada jugador",
        "Un error y termina el juego",
        "Acumula puntos por cada acierto",
      ],
    },
    mediaTypes: ["image"],
    questionBased: true,
    stepBased: false,
    lives: 1,
    useStreak: false,
  },

  appearances: {
    title: "Más o Menos Presencias",
    icon: Users,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg w-72">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col items-center text-center">
              <User className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] mb-2" />
              <h3 className="font-bold text-sm text-[var(--primary)] dark:text-[var(--blanco)] truncate">
                Jugador 1
              </h3>
              <p className="text-lg font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
                100 presencias
              </p>
            </div>

            <div className="h-36 w-[1px] bg-white"></div>

            <div className="flex-1 flex flex-col items-center text-center">
              <User className="w-12 h-12 text-[var(--primary)] dark:text-[var(--secondary)] mb-2" />
              <h3 className="font-bold text-sm text-[var(--primary)] dark:text-[var(--blanco)] truncate">
                Jugador 2
              </h3>
              <p className="text-lg font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
                101 presencias
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-green-600 text-white">
              Más
            </button>
            <button className="flex-1 py-2 px-4 rounded-lg font-bold text-sm flex items-center justify-center gap-2 bg-[var(--secondary)] text-white">
              Menos
            </button>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--blanco)] mt-4">
          Más o Menos Presencias
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)] text-center">
          ¿Tiene más o menos presencias que el anterior?
        </p>
      </div>
    ),
    objective:
      "Adivina si el jugador tiene más o menos presencias que el anterior",
    timeLimit: 60, // 1 minuto para juegos de más/menos
    modes: ["time", "normal"],
    rules: {
      time: [
        "Compara las presencias de cada jugador",
        "Un error y termina el juego",
        "Acumula puntos por cada acierto",
        "Completalo antes de que acabe el tiempo",
      ],
      lives: [
        "Compara las presencias de cada jugador",
        "Un error y termina el juego",
        "Acumula puntos por cada acierto",
      ],
      normal: [
        "Compara las presencias de cada jugador",
        "Un error y termina el juego",
        "Acumula puntos por cada acierto",
      ],
    },
    mediaTypes: ["image"],
    questionBased: true,
    stepBased: false,
    lives: 1, // Solo una vida en juegos de más/menos
    useStreak: false, // Usa record score
  },

  career: {
    title: "Trayectoria",
    icon: User,
    visual: () => (
      <div className="relative bg-white dark:bg-gray-800 rounded-xl p-3 h-[350px] w-[250px] flex items-center justify-center">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[var(--primary)] dark:bg-[var(--secondary)] rounded-full"></div>
            <div className="text-sm font-medium text-[var(--primary)] dark:text-[var(--secondary)]">
              Club 1
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="text-sm font-medium text-gray-500">Club ???</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
            <div className="text-sm font-medium text-gray-500">Club ???</div>
          </div>
        </div>
        <div className="absolute bottom-4 left-0 right-0 text-center text-sm font-medium text-[var(--primary)] dark:text-[var(--secondary)]">
          Trayectoria del día
        </div>
      </div>
    ),
    objective: "Adivina el jugador por su carrera profesional",
    timeLimit: 300, // 5 minutos
    modes: ["time", "lives"],
    rules: {
      time: [
        "Tienes 30 segundos",
        "San Lorenzo siempre está visible",
        "Cada error revela un club",
        "Adivina antes de que acabe el tiempo",
      ],
      lives: [
        "Tienes 3 vidas",
        "San Lorenzo siempre está visible",
        "Cada error revela un club",
        "Adivina antes de quedarte sin vidas",
      ],
      normal: [
        "Tienes 3 vidas",
        "San Lorenzo siempre está visible",
        "Cada error revela un club",
        "Adivina antes de quedarte sin vidas",
      ],
    },
    mediaTypes: ["image"],
    questionBased: false,
    stepBased: true,
    lives: 3,
    useStreak: true,
  },

  player: {
    title: "Jugador del Día",
    icon: CircleUserRound,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 rounded-2xl bg-[var(--primary)] dark:bg-[var(--secondary)] flex flex-col items-center justify-center shadow-2xl mb-6 space-y-3 px-4 py-4 dark:text-[var(--fondo-oscuro)]">
          <CircleUserRound className="w-10 h-10" />
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-white dark:bg-gray-800 font-bold text-[var(--primary)] dark:text-[var(--secondary)] border-2 border-[var(--primary)] dark:border-[var(--secondary)] flex items-center justify-center rounded-md"
                >
                  ?
                </div>
              ))}
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--blanco)]">
          Jugador del día
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)] text-center">
          Adivina el nombre del jugador
        </p>
      </div>
    ),

    objective: "Adivina el nombre del jugador de San Lorenzo",
    modes: ["normal"],
    rules: {
      time: [
        "Tienes 6 intentos máximo",
        "Verde: letra correcta en posición correcta",
        "Amarillo: letra correcta en posición incorrecta",
        "Gris: letra no está en el nombre",
      ],
      lives: [
        "Tienes 6 intentos máximo",
        "Verde: letra correcta en posición correcta",
        "Amarillo: letra correcta en posición incorrecta",
        "Gris: letra no está en el nombre",
      ],
      normal: [
        "Tienes 6 intentos máximo",
        "Verde: letra correcta en posición correcta",
        "Amarillo: letra correcta en posición incorrecta",
        "Gris: letra no está en el nombre",
      ],
    },
    mediaTypes: ["image"],
    questionBased: false,
    stepBased: true,
    timeLimit: 300, // 5 minutos
    lives: 3,
    useStreak: true,
  },

  league: {
    title: "Liga Mundial",
    icon: Earth,
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 rounded-2xl bg-[var(--azul)] dark:bg-[var(--rojo)] shadow-2xl mb-6 relative overflow-hidden p-2">
          {/* Fondo de cancha táctico */}
          <div className="absolute inset-0 bg-green-500 rounded-xl overflow-hidden">
            <div className="absolute inset-0 border-2 border-white opacity-70"></div>
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white opacity-70 transform -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white opacity-70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-1/2 bottom-0 w-24 h-10 border-2 border-white opacity-70 transform -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-0 w-24 h-10 border-2 border-white opacity-70 transform -translate-x-1/2"></div>

            {/* Posiciones */}
            {[
              {
                position: "PO",
                x: 50,
                y: 92,
              },
              { position: "LD", x: 88, y: 65 },
              { position: "CT", x: 38, y: 70 },
              { position: "CT", x: 62, y: 70 },
              { position: "LI", x: 12, y: 65 },
              { position: "MD", x: 80, y: 45 },
              { position: "MC", x: 40, y: 50 },
              { position: "MC", x: 60, y: 50 },
              { position: "MI", x: 20, y: 45 },
              { position: "DC", x: 40, y: 22 },
              { position: "DC", x: 60, y: 22 },
            ].map((pos, index) => (
              <div
                key={index}
                className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="w-full h-full bg-[var(--rojo)] dark:bg-[var(--azul)] border border-white rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {pos.position}
                  </span>
                </div>
              </div>
            ))}

            {/* DT */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-[var(--azul)] dark:bg-[var(--rojo)] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">DT</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[var(--azul)] dark:text-[var(--blanco)] text-center">
          Equipo de Ligas del día
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)] text-center">
          Pon a prueba tu conocimiento táctico
        </p>
      </div>
    ),
    objective: "Arma tu equipo con jugadores que pasaron por San Lorenzo",
    timeLimit: 300, // 5 minutos
    modes: ["time", "lives"],
    rules: {
      time: [
        "Jugaron en San Lorenzo",
        "Jugaron en la liga mostrada",
        "Sin repetir jugadores/ligas",
        "Completalo antes de que acabe el tiempo",
      ],
      lives: [
        "Jugaron en San Lorenzo",
        "Jugaron en la liga mostrada",
        "Sin repetir jugadores/ligas",
        "Completalo sin perder todas las vidas",
      ],
      normal: [
        "Jugaron en San Lorenzo",
        "Jugaron en la liga mostrada",
        "Sin repetir jugadores/ligas",
      ],
    },
    mediaTypes: ["image"],
    questionBased: false,
    stepBased: true,
    lives: 3,
    useStreak: true,
  },

  national: {
    title: "Equipo Nacional",
    icon: () => (
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/design-mode-images/800px-Flag_of_Argentina.svg-gZbPf6RPghccdaxeCsWMxDuHiMpMDM.png"
        alt="Bandera Argentina"
        className="h-5"
      />
    ),
    visual: () => (
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 rounded-2xl bg-[var(--azul)] dark:bg-[var(--rojo)] shadow-2xl mb-6 relative overflow-hidden p-2">
          {/* Fondo de cancha táctico */}
          <div className="absolute inset-0 bg-green-500 rounded-xl overflow-hidden">
            <div className="absolute inset-0 border-2 border-white opacity-70"></div>
            <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white opacity-70 transform -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-1/2 w-16 h-16 border-2 border-white opacity-70 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute left-1/2 bottom-0 w-24 h-10 border-2 border-white opacity-70 transform -translate-x-1/2"></div>
            <div className="absolute left-1/2 top-0 w-24 h-10 border-2 border-white opacity-70 transform -translate-x-1/2"></div>

            {/* Posiciones */}
            {[
              {
                position: "PO",
                x: 50,
                y: 92,
              },
              { position: "LD", x: 88, y: 65 },
              { position: "CT", x: 38, y: 70 },
              { position: "CT", x: 62, y: 70 },
              { position: "LI", x: 12, y: 65 },
              { position: "MD", x: 80, y: 45 },
              { position: "MC", x: 40, y: 50 },
              { position: "MC", x: 60, y: 50 },
              { position: "MI", x: 20, y: 45 },
              { position: "DC", x: 40, y: 22 },
              { position: "DC", x: 60, y: 22 },
            ].map((pos, index) => (
              <div
                key={index}
                className="absolute w-6 h-6 transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                <div className="w-full h-full bg-[var(--rojo)] dark:bg-[var(--azul)] border border-white rounded-full flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">
                    {pos.position}
                  </span>
                </div>
              </div>
            ))}

            {/* DT */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-[var(--azul)] dark:bg-[var(--rojo)] rounded-full flex items-center justify-center">
              <span className="text-[10px] font-bold text-white">DT</span>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[var(--azul)] dark:text-[var(--blanco)] text-center">
          Equipo Nacional del día
        </h2>
        <p className="text-[var(--gris-oscuro)] dark:text-[var(--gris)] text-center">
          Pon a prueba tu conocimiento táctico
        </p>
      </div>
    ),
    objective: "Arma tu equipo con jugadores que pasaron por San Lorenzo",
    timeLimit: 300, // 5 minutos
    modes: ["time", "lives"],
    rules: {
      time: [
        "Jugaron en San Lorenzo",
        "Jugaron en el club mostrado",
        "Sin repetir jugadores/clubes",
        "Completalo antes de que acabe el tiempo",
      ],
      lives: [
        "Jugaron en San Lorenzo",
        "Jugaron en el club mostrado",
        "Sin repetir jugadores/clubes",
        "Completalo sin perder todas las vidas",
      ],
      normal: [
        "Jugaron en San Lorenzo",
        "Jugaron en el club mostrado",
        "Sin repetir jugadores/clubes",
      ],
    },
    mediaTypes: ["image"],
    questionBased: false,
    stepBased: true,
    lives: 3,
    useStreak: true,
  },
};
