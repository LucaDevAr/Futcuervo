"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, UserCog } from "lucide-react";
import DarkModeButton from "@/components/layout/DarkModeButton";
import { useUserStore } from "@/stores/userStore";

export default function AdminLogoMenu({
  isDarkMode,
  onToggleDarkMode,
  isCollapsed,
}) {
  const user = useUserStore((state) => state.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogoutClick = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }

    clearUser();
    localStorage.removeItem("userFallback");
    setIsMenuOpen(false);
    window.location.href = "/"; // redirige al home
  };

  return (
    <div className="relative w-full bg-[var(--background)]">
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={`w-full flex items-center gap-3 py-2 px-2 rounded-md transition-colors 
          hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)] 
          text-[var(--black)] dark:text-[var(--white)] ${
            isCollapsed ? "justify-center" : ""
          }`}
      >
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/futcuervo-logo-BVEl3yIsYZbvGKRzYTsnwYx4zjfB3m.png"
          alt="FutCuervo"
          className="w-6 h-6"
        />
        {!isCollapsed && (
          <span className="text-base font-semibold truncate">FutCuervo</span>
        )}
      </button>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-0 top-full mt-2 w-64 rounded-lg shadow-lg border-2 z-50 border-[var(--primary)] dark:border-[var(--secondary)] bg-[var(--white)] dark:bg-[var(--background)]"
        >
          <div className="p-4 space-y-3">
            {user ? (
              <>
                <div className="px-4 py-2 border-b border-[var(--primary)] dark:border-[var(--secondary)]">
                  <p className="font-medium text-[var(--black)] dark:text-[var(--white)]">
                    {user.name}
                  </p>
                  <p className="text-sm text-[var(--gris)] truncate">
                    {user.email}
                  </p>
                </div>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)] text-[var(--black)] dark:text-[var(--white)]"
                  >
                    <UserCog size={16} />
                    Dashboard Admin
                  </Link>
                )}

                <button
                  onClick={handleLogoutClick}
                  className="flex w-full items-center gap-3 px-4 py-2 rounded-md transition-colors hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)] text-[var(--black)] dark:text-[var(--white)]"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2 rounded-md transition-colors hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)] text-[var(--black)] dark:text-[var(--white)]"
              >
                <User size={16} />
                Iniciar Sesión
              </Link>
            )}

            <DarkModeButton
              className="flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer transition-colors hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)] text-[var(--black)] dark:text-[var(--white)] w-full"
              isDarkMode={isDarkMode}
              onToggle={onToggleDarkMode}
            />
          </div>
        </div>
      )}
    </div>
  );
}
