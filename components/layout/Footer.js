"use client";

import { memo } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Defaults globales (igual que Navbar)
const DEFAULT_TITLE = "Fut ?";
const DEFAULT_LOGO = "/images/logo.png";
const DEFAULT_HOME = "/";

// Redes por defecto
export const DEFAULT_SOCIALS = [
  {
    icon: require("lucide-react").Twitter,
    label: "Twitter",
    name: "Twitter",
    url: "https://x.com/futcuervo",
    even: true,
  },
  {
    icon: require("lucide-react").Instagram,
    label: "Instagram",
    name: "Instagram",
    url: "https://www.instagram.com/futcuervo/",
    even: false,
  },
  {
    icon: require("lucide-react").Mail,
    label: "Email",
    name: "Contacto",
    url: "mailto:futcuervo@gmail.com",
    even: true,
  },
];

function Footer({
  title = DEFAULT_TITLE,
  logo = DEFAULT_LOGO,
  homeUrl = DEFAULT_HOME,
  socials = DEFAULT_SOCIALS,
  showCuervo = true,

  // 🔥 CUSTOM FANBASE TEXT
  fanBase = "Fútbol",
  fanBasePrimaryColor = "var(--azul)",
  fanBaseSecondaryColor = "var(--rojo)",
}) {
  return (
    <footer className="relative w-full px-6 py-4 bg-[var(--footer-bg)] text-[var(--footer-text)] mt-12 transition-colors">
      {/* Cuervo flotante */}
      {showCuervo && (
        <div className="absolute right-4 -top-[42px] pointer-events-none hidden sm:block">
          <img
            src="/images/cuervo.png"
            alt="Cuervo"
            className="w-12 h-12 object-contain -scale-x-100"
          />
        </div>
      )}

      <div className="relative z-10 w-full">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-2 max-sm:w-full">
            {/* LOGO + TITLE */}
            <Link
              href={homeUrl}
              className="flex items-center gap-3 cursor-pointer max-sm:mb-10"
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src={logo} alt={`Logo ${title}`} />
              </div>
              <span className="text-md font-black uppercase text-[var(--blanco)]">
                {title}
              </span>
            </Link>

            <div className="text-[0.7rem] md:text-sm text-center flex items-center gap-1 absolute md:static left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 max-sm:top-14 max-sm:w-full justify-center">
              <span className="text-[var(--gris)]">Hecho con</span>

              <Heart
                size={14}
                className="text-red-500 fill-current animate-pulse"
              />

              <span className="text-[var(--gris)]">para los fanáticos de</span>

              {/* Fanbase customizable */}
              <span className="font-semibold">
                <span style={{ color: fanBasePrimaryColor }}>
                  {fanBase.split(" ")[0]}
                </span>{" "}
                {fanBase.split(" ")[1] && (
                  <span style={{ color: fanBaseSecondaryColor }}>
                    {fanBase.split(" ")[1]}
                  </span>
                )}
              </span>
            </div>

            {/* Redes sociales */}
            <TooltipProvider delayDuration={0}>
              <div className="flex gap-3">
                {socials.map(({ icon: Icon, label, name, url, even }) => {
                  const bg = even
                    ? "hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)]"
                    : "hover:bg-[var(--secondary)] dark:hover:bg-[var(--primary)]";

                  const tipBg = even
                    ? "bg-[var(--primary)] dark:bg-[var(--secondary)]"
                    : "bg-[var(--secondary)] dark:bg-[var(--primary)]";

                  return (
                    <Tooltip key={label}>
                      <TooltipTrigger asChild>
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className={`group p-2.5 rounded-xl transition duration-300 hover:scale-110 hover:shadow-lg text-[var(--footer-text)] ${bg}`}
                        >
                          <Icon
                            size={18}
                            className="transition group-hover:text-[var(--white)]"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className={`border-none rounded-lg text-[var(--white)] ${tipBg}`}
                      >
                        {name}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </TooltipProvider>
          </div>

          {/* Divider */}
          <div className="w-full border-t border-[var(--gris-oscuro)]" />

          {/* Links */}
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

          {/* Copy */}
          <div className="flex justify-center">
            <p className="text-xs text-center text-[var(--gris)]">
              © 2025 {title}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
