import { Mail, Twitter, Instagram } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export const metadata = {
  title: "Contacto - FutCuervo",
  description:
    "Ponte en contacto con FutCuervo para cualquier consulta, sugerencia o comentario.",
};

export default function ContactPage() {
  return (
    <div className="">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--gris-claro)] dark:bg-[var(--background)] text-black dark:text-white py-32 px-4 sm:px-6 lg:px-8">
        <main className="max-w-3xl w-full mx-auto rounded-lg shadow-xl p-6 sm:p-8 lg:p-10 bg-[var(--primary)] dark:bg-[var(--secondary)] text-white dark:text-white">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-[var(--secondary)] dark:text-[var(--primary)] mb-6">
            Contacto
          </h1>

          <div className="text-base leading-relaxed text-center mb-8">
            <p className="mb-4">
              ¿Tenés ideas, comentarios o simplemente querés compartir tu pasión
              por el Ciclón?
            </p>
            <p>
              En FutCuervo valoramos cada mensaje de la comunidad. Ya sea para
              hacernos llegar una sugerencia, reportar un problema o simplemente
              saludarnos, estamos para escucharte.
            </p>
          </div>

          <section className="flex flex-col items-center gap-6 text-white dark:text-white">
            <div className="flex items-center gap-3 hover:text-[var(--secondary)] dark:hover:text-[var(--primary)]">
              <Mail className="h-6 w-6" />
              <a
                href="mailto:futcuervo@gmail.com"
                className="text-base font-medium hover:underline"
              >
                futcuervo@gmail.com
              </a>
            </div>
            <div className="flex items-center gap-3 hover:text-[var(--secondary)] dark:hover:text-[var(--primary)]">
              <Twitter className="h-6 w-6" />
              <a
                href="https://twitter.com/futcuervo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium hover:underline"
              >
                @futcuervo (Twitter/X)
              </a>
            </div>
            <div className="flex items-center gap-3 hover:text-[var(--secondary)] dark:hover:text-[var(--primary)]">
              <Instagram className="h-6 w-6" />
              <a
                href="https://instagram.com/futcuervo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium hover:underline"
              >
                @futcuervo (Instagram)
              </a>
            </div>
          </section>

          <p className="mt-8 text-center text-sm text-white dark:text-white opacity-80">
            Respondemos todos los mensajes lo antes posible. Gracias por formar
            parte de FutCuervo, la casa del hincha azulgrana en la web.
          </p>
        </main>
      </div>
      <Footer />
    </div>
  );
}
