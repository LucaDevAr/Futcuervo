"use client";

import { Heart, Twitter, Instagram, Mail } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";

export default function Footer({ isDarkMode = true }) {
  return (
    <footer className="relative w-full px-6 py-4 transition-colors duration-200 bg-[var(--footer-bg)] dark:bg-[var(--footer-bg)] mt-12 text-[var(--footer-text)]">
      {/* Cuervo */}
      <div className="absolute right-4 -top-[42px] pointer-events-none hidden sm:block">
        <img
          src="/images/cuervo.png"
          alt="Cuervo"
          className="w-12 h-12 object-contain -scale-x-100"
        />
      </div>

      <div className="relative z-10 w-full">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2">
            {/* Logo */}
            <div className="flex items-center gap-3 order-1 sm:order-1">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/images/futcuervo-logo.png" alt="Logo FutCuervo" />
              </div>
              <span
                className="text-md font-black uppercase"
                style={{ color: "var(--blanco)" }}
              >
                FutCuervo
              </span>
            </div>

            {/* Mensaje desktop */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
              <div className="flex items-center gap-1 text-sm">
                <span style={{ color: "var(--gris)" }}>Hecho con</span>
                <Heart
                  size={14}
                  className="text-red-500 fill-current animate-pulse"
                />
                <span style={{ color: "var(--gris)" }}>
                  para los fanáticos de
                </span>
                <span className="font-semibold">
                  <span style={{ color: "var(--azul)" }}>San</span>{" "}
                  <span style={{ color: "var(--rojo)" }}>Lorenzo</span>
                </span>
              </div>
            </div>

            {/* Mensaje mobile */}
            <div className="block md:hidden order-2">
              <div className="flex items-center gap-1 text-xs text-center">
                <span style={{ color: "var(--gris)" }}>Hecho con</span>
                <Heart
                  size={14}
                  className="text-red-500 fill-current animate-pulse"
                />
                <span style={{ color: "var(--gris)" }}>
                  para los fanáticos de
                </span>
                <span className="font-semibold">
                  <span style={{ color: "var(--azul)" }}>San</span>{" "}
                  <span style={{ color: "var(--rojo)" }}>Lorenzo</span>
                </span>
              </div>
            </div>

            {/* Redes */}
            <TooltipProvider delayDuration={0}>
              <div className="flex gap-3 order-3 sm:order-3">
                {[
                  {
                    icon: Twitter,
                    label: "Twitter",
                    name: "Twitter",
                    url: "https://x.com/futcuervo",
                  },
                  {
                    icon: Instagram,
                    label: "Instagram",
                    name: "Instagram",
                    url: "https://www.instagram.com/futcuervo/",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    name: "Contacto",
                    url: "mailto:futcuervo@gmail.com",
                  },
                ].map(({ icon: Icon, label, name, url }, index) => {
                  const isEven = index % 2 === 0;
                  const hoverBg = isEven
                    ? "hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)]"
                    : "hover:bg-[var(--secondary)] dark:hover:bg-[var(--primary)]";

                  return (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className={`group p-2.5 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-lg text-[var(--footer-text)] ${hoverBg}`}
                        >
                          <Icon
                            size={18}
                            className="transition-all duration-300 group-hover:text-[var(--white)]"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent
                        className={`border-none text-[var(--white)] rounded-lg ${
                          isEven
                            ? "bg-[var(--primary)] dark:bg-[var(--secondary)]"
                            : "bg-[var(--secondary)] dark:bg-[var(--primary)]"
                        }`}
                        side="top"
                      >
                        {name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>

          {/* Línea */}
          <div
            className="w-full border-t"
            style={{ borderColor: "var(--gris-oscuro)" }}
          />

          {/* Enlaces de información */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/about"
              className="text-[var(--gris)] hover:text-[var(--blanco)] transition-colors"
            >
              Sobre Nosotros
            </Link>
            <Link
              href="/privacy-policy"
              className="text-[var(--gris)] hover:text-[var(--blanco)] transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/contact"
              className="text-[var(--gris)] hover:text-[var(--blanco)] transition-colors"
            >
              Contáctanos
            </Link>
          </div>

          {/* Copyright */}
          <div className="flex justify-center">
            <p className="text-xs text-center" style={{ color: "var(--gris)" }}>
              © 2025 FutCuervo. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
