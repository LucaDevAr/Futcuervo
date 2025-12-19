"use client";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

export function GoogleAdsScript() {
  const pathname = usePathname();
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const excludePaths = [
      "/admin",
      "/auth",
      "/404",
      "/not-found",
      "/unauthorized",
      "/api",
      "/futcuervo/games",
      "/futmerengue/games",
    ];

    const canLoad = !excludePaths.some((path) => pathname.startsWith(path));
    setShouldLoad(canLoad);
  }, [pathname]);

  if (!shouldLoad) return null;

  return (
    <Script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6984459691312607"
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
