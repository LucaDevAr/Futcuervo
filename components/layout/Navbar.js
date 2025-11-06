"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DarkModeButton from "@/components/layout/DarkModeButton";
import UserButton from "@/components/auth/UserMenu";
import MobileMenu from "@/components/layout/MobileMenu";
import CafecitoButton from "@/components/layout/CafecitoButton";

export default function Navbar({
  title = "Fut ?",
  logo = "/images/logo.png",
  homeUrl = "/", // ✅ nuevo prop dinámico
}) {
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  const goToHome = () => router.push(homeUrl);

  return (
    <nav className="w-full h-[56px] md:h-[64px] px-6 flex items-center justify-between transition-colors duration-200 bg-[var(--navbar-bg)] text-[var(--navbar-text)] fixed z-50 top-0">
      {/* Logo + título */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={goToHome}
      >
        <div
          className={`${
            isMobile ? "w-10 h-10" : "w-12 h-12"
          } flex items-center justify-center`}
        >
          <img
            src={logo}
            alt={`Logo ${title}`}
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex items-center">
          <span className="text-xl font-black uppercase hidden sm:block">
            {title}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isMobile ? (
          <>
            <CafecitoButton />
            <DarkModeButton />
            <UserButton />
          </>
        ) : (
          <MobileMenu />
        )}
      </div>
    </nav>
  );
}
