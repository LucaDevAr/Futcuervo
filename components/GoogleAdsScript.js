"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";

export function GoogleAdsScript() {
  const pathname = usePathname();

  const excludePaths = [
    "/admin",
    "/auth",
    "/404",
    "/not-found",
    "/unauthorized",
    "/api",
    "/games",
  ];

  const shouldShowAds = !excludePaths.some((path) => pathname.startsWith(path));

  if (!shouldShowAds) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6984459691312607"
      crossOrigin="anonymous"
    />
  );
}
