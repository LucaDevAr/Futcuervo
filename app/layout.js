import React from "react";
import { GoogleAdsScript } from "@/components/GoogleAdsScript";
import "./globals.css";
import ClientProviders from "@/components/ClientProviders";
import { Analytics } from "@vercel/analytics/react"; // 👈 agrega esto

export const metadata = {
  title: "FutCuervo - Juegos y Preguntas sobre San Lorenzo",
  description:
    "FutCuervo es el sitio de trivias, juegos y curiosidades sobre San Lorenzo de Almagro: jugadores, camisetas, técnicos, canciones, equipos y mucho más.",
  keywords: [
    "San Lorenzo",
    "FutCuervo",
    "juegos de fútbol",
    "trivia",
    "preguntas",
    "cuervos",
    "camisetas",
    "jugadores",
    "fútbol argentino",
  ],
  authors: [{ name: "FutCuervo", url: "https://futcuervo.com" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/icons/futcuervo-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
      {
        url: "/icons/futcuervo-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/futcuervo-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: "/icons/futcuervo-192x192.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "FutCuervo",
    url: "https://futcuervo.com",
    author: {
      "@type": "Organization",
      name: "FutCuervo",
      url: "https://futcuervo.com",
    },
    description: "Juegos, trivias y desafíos sobre San Lorenzo de Almagro.",
  };

  return (
    <html lang="es">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href="https://www.futcuervo.com/" />
        <meta
          name="google-site-verification"
          content="8RnR13G0ViAIZENwhi_2dpooIeCKvti6QIjqW1hlxuY"
        />
        <meta name="theme-color" content="#002f6c" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link
          rel="icon"
          href="/icons/futcuervo-192x192.png"
          sizes="192x192"
          type="image/png"
        />
        <link
          rel="icon"
          href="/icons/futcuervo-512x512.png"
          sizes="512x512"
          type="image/png"
        />
        <link rel="apple-touch-icon" href="/icons/futcuervo-512x512.png" />
      </head>
      <body>
        <ClientProviders>{children}</ClientProviders>
        {/* Google Ads Script solo en cliente */}
        {typeof window !== "undefined" && <GoogleAdsScript />}

        {/* 👇 Agregamos el componente de analíticas de Vercel */}
        <Analytics />
      </body>
    </html>
  );
}
