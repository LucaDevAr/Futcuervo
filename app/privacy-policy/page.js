import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Política de Privacidad - FutCuervo",
  description:
    "Conoce nuestra política de privacidad en FutCuervo. Información sobre la recopilación y uso de datos.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--gris-claro)] dark:bg-[var(--background)] text-black dark:text-white py-32 px-4 sm:px-6 lg:px-8">
        <main className="max-w-4xl mx-auto rounded-lg shadow-xl p-6 sm:p-8 lg:p-10 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[var(--secondary)] dark:text-[var(--primary)] mb-6">
            Política de Privacidad de FutCuervo
          </h1>
          <p className="mb-4 text-sm sm:text-base leading-relaxed text-center">
            Última actualización: 16 de Julio de 2025
          </p>

          <section className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              1. Introducción
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              En FutCuervo respetamos tu privacidad. Esta Política explica cómo
              tratamos tus datos cuando usás nuestra plataforma para jugar,
              competir y disfrutar del contenido dedicado al Club San Lorenzo de
              Almagro.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              2. Datos que Recopilamos
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-2">
              Dependiendo de cómo usés FutCuervo, podemos recopilar:
            </p>
            <ul className="list-disc list-inside text-sm sm:text-base leading-relaxed">
              <li>
                <strong>Datos de cuenta:</strong> correo electrónico, nombre de
                usuario, contraseña.
              </li>
              <li>
                <strong>Actividad en el sitio:</strong> resultados de juegos,
                rachas, puntajes, interacciones con canciones o camisetas.
              </li>
              <li>
                <strong>Datos técnicos:</strong> dirección IP, navegador,
                sistema operativo, tiempo de uso.
              </li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              3. Cookies y Tecnologías Similares
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Usamos cookies para mejorar tu experiencia, guardar tu sesión,
              mostrar contenido personalizado (como canciones favoritas o
              progreso de juego) y ofrecer anuncios relevantes.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              4. Uso de los Datos
            </h2>
            <ul className="list-disc list-inside text-sm sm:text-base leading-relaxed">
              <li>
                Ofrecer los modos de juego, reproductores de canciones y
                funcionalidades.
              </li>
              <li>
                Guardar tus resultados y preferencias (como rachas o aciertos).
              </li>
              <li>Mejorar el sitio con base en el uso real.</li>
              <li>Mostrar anuncios relevantes a través de Google AdSense.</li>
              <li>Proteger la seguridad del sitio y prevenir abusos.</li>
            </ul>
          </section>

          <section className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              5. Terceros y Anuncios
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-2">
              Compartimos datos anonimizados con servicios como Google AdSense
              para mostrar anuncios personalizados. También podemos usar
              herramientas como Google Analytics para conocer el rendimiento del
              sitio.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              6. Seguridad
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Tomamos medidas razonables para proteger tu información. Sin
              embargo, ninguna transmisión o almacenamiento electrónico es
              completamente seguro.
            </p>
          </section>

          <section className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              7. Cambios en esta Política
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Esta política puede actualizarse si cambiamos nuestras prácticas.
              Te avisaremos en el sitio si hay cambios importantes.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--secondary)] dark:text-[var(--primary)] mb-3">
              8. Contacto
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Si tenés dudas sobre esta política o querés ejercer tus derechos
              sobre tus datos, escribinos a:
            </p>
            <p className="text-sm sm:text-base leading-relaxed">
              <a
                href="mailto:futcuervo@gmail.com"
                className="underline text-white hover:text-gray-200"
              >
                futcuervo@gmail.com
              </a>
            </p>
          </section>
        </main>
      </div>
      <Footer />
    </div>
  );
}
