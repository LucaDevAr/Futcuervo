import Image from "next/image";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Sobre Nosotros - FutCuervo",
  description:
    "Conoce más sobre FutCuervo, la plataforma de juegos y trivias para los fanáticos de San Lorenzo de Almagro.",
};

export default function AboutPage() {
  return (
    <div className="">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-centertext-black dark:text-white py-32 px-4 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto rounded-lg shadow-xl p-4 sm:p-6 lg:p-8 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[var(--secondary)] dark:text-[var(--primary)] mb-6">
            Sobre FutCuervo
          </h1>

          <div className="flex flex-col md:flex-row items-center gap-6 mb-10">
            <div className="md:w-1/2">
              <Image
                src="/images/futcuervo-logo.png"
                alt="Logo FutCuervo"
                width={200}
                height={200}
                className="rounded-full mx-auto shadow-lg"
                priority
              />
            </div>
            <div className="md:w-1/2 text-base leading-relaxed">
              <p className="mb-4">
                <strong>FutCuervo</strong> es un proyecto digital hecho por y
                para hinchas de San Lorenzo, nacido del amor por los colores
                azulgranas y de las ganas de compartir ese sentimiento con la
                comunidad. Queríamos ir más allá de las noticias y resultados:
                queríamos transformar la pasión en juego, desafío y memoria.
              </p>
              <p>
                Creamos una plataforma donde los cuervos pueden poner a prueba
                su conocimiento, recordar ídolos, revivir momentos históricos y
                divertirse con experiencias pensadas especialmente para ellos.
              </p>
            </div>
          </div>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3 text-center">
              ¿Qué ofrecemos?
            </h2>
            <p className="text-base leading-relaxed mb-4">
              En FutCuervo vas a encontrar juegos diarios, trivias aleatorias y
              retos de conocimiento sobre el club: camisetas, jugadores,
              técnicos, goles, partidos y más. Hay distintos modos de juego para
              todos los niveles, desde el que se acuerda del banco de suplentes
              del &apos;95 hasta el que recién empieza a conocer la historia del
              Ciclón.
            </p>
            <p className="text-base leading-relaxed">
              Además, contamos con un <strong>reproductor interactivo</strong>{" "}
              de canciones de cancha que te permite escuchar y revivir las
              melodías más emblemáticas de la hinchada azulgrana. Podés leer las
              letras, adivinar de qué canción se trata en nuestros juegos, o
              simplemente sentirte en la tribuna estés donde estés. Esta función
              es clave para mantener viva la cultura popular cuerva.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3 text-center">
              ¿Para quién es FutCuervo?
            </h2>
            <p className="text-base leading-relaxed">
              FutCuervo está pensado para cualquier hincha de San Lorenzo, sin
              importar la edad ni el nivel de conocimiento. Si disfrutás revivir
              partidos, recordar goles, cantar canciones de la tribuna o debatir
              sobre el mejor 5 de la historia, este es tu lugar. Es ideal para
              compartir en familia, competir con amigos o simplemente pasar un
              buen rato celebrando tu amor por el club.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3 text-center">
              ¿Por qué lo hicimos?
            </h2>
            <p className="text-base leading-relaxed">
              Sentíamos que faltaba un espacio donde el sentimiento cuervo
              pudiera vivirse también desde lo digital. No queríamos hacer solo
              un sitio de estadísticas: queríamos un espacio de pertenencia,
              identidad y comunidad. FutCuervo busca ser una nueva forma de
              vivir la pasión azulgrana todos los días.
            </p>
          </section>

          <section className="mt-10 text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              Nuestra Misión
            </h2>
            <p className="text-base leading-relaxed mb-6">
              Queremos fortalecer la identidad cuerva a través de experiencias
              únicas, entretenidas y educativas. FutCuervo es un puente entre
              generaciones, una forma de transmitir la historia y el amor por
              San Lorenzo con orgullo y creatividad.
            </p>

            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              Contáctanos
            </h2>
            <p className="text-base leading-relaxed">
              Si tenés sugerencias, ideas, preguntas o simplemente querés
              saludarnos, escribinos a{" "}
              <a
                href="mailto:futcuervo@gmail.com"
                className="text-white underline hover:text-gray-300"
              >
                futcuervo@gmail.com
              </a>{" "}
              o buscános en nuestras redes. ¡Siempre estamos abiertos a escuchar
              a la comunidad cuerva!
            </p>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
