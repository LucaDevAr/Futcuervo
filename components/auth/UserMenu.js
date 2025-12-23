"use client";

import { useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  UserCog,
  BookOpen,
  CircleUserRound,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserStore } from "@/stores/userStore";
import { useSession } from "@/hooks/auth/useSession";

export default function UserMenu() {
  useSession(); // 👈 listo
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((state) => state.clearUser);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const handleUserClick = () => setIsMenuOpen(!isMenuOpen);

  const API_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleLogoutClick = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("[v0] Logout error:", error);
    }

    clearUser();
    localStorage.removeItem("user");
    localStorage.removeItem("game-attempts-storage");
    setIsMenuOpen(false);
    window.location.href = "/";
  };

  const userIcon = useMemo(() => {
    if (!user) {
      return <User size={20} />;
    }

    if (user.image) {
      return (
        <img
          src={user.image}
          alt={user.name || "Usuario"}
          className="w-7 h-7 rounded-full object-cover"
        />
      );
    }

    return <CircleUserRound size={22} />;
  }, [user]);

  return (
    <div className="relative">
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              ref={buttonRef}
              onClick={handleUserClick}
              className="h-9 w-9 min-w-[36px] min-h-[36px] max-w-[36px] max-h-[36px] flex items-center justify-center rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg outline-none focus:outline-none border-none bg-[var(--navbar-button-bg)] text-[var(--navbar-button-text)] hover:bg-[var(--navbar-button-bg-hover)] hover:text-[var(--navbar-button-text-hover)]"
              aria-label="User menu"
            >
              <div className="relative flex items-center justify-center">
                {userIcon}
                {user?.image && <User size={20} className="hidden" />}
              </div>
            </button>
          </TooltipTrigger>
          <TooltipContent className="border-0 text-[var(--navbar-text-tooltip)] bg-[var(--navbar-button-bg)]">
            {user ? user.name : "Iniciar Sesión"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg border-2 z-50 border-[var(--primary)] dark:border-[var(--secondary)] bg-[var(--background)] dark:bg-[var(--background)] px-2 text-[var(--text)]"
        >
          <div className="py-2">
            <Link
              href="/guide"
              className="flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)]"
              onClick={() => setIsMenuOpen(false)}
            >
              <BookOpen size={16} />
              Guía de reglas
            </Link>
            {!user ? (
              <>
                <Link
                  href="/auth/login"
                  className="flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn size={16} />
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors hover:bg-[var(--primary)] dark:hover:bg-[var(--secondary)] hover:text-[var(--white)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserPlus size={16} />
                  Registrarse
                </Link>
              </>
            ) : (
              <>
                <div className="px-4 py-2 border-b mb-2 border-[var(--azul)] dark:border-[var(--rojo)]">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs truncate text-[var(--gris)]">
                    {user.email}
                  </p>
                </div>

                <Link
                  href="/profile"
                  className="flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors hover:bg-[var(--azul)] dark:hover:bg-[var(--rojo)] hover:text-[var(--blanco)] text-[var(--negro)] dark:text-[var(--blanco)]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User size={16} />
                  Mi Perfil
                </Link>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors hover:bg-[var(--azul)] dark:hover:bg-[var(--rojo)] hover:text-[var(--blanco)] text-[var(--negro)] dark:text-[var(--blanco)]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <UserCog size={16} />
                    Dashboard
                  </Link>
                )}

                <div className="border-t my-2 border-[var(--azul)] dark:border-[var(--rojo)]" />

                <button
                  onClick={handleLogoutClick}
                  className="flex w-full px-4 py-2 items-center gap-3 rounded-md transition-colors hover:bg-[var(--azul)] dark:hover:bg-[var(--rojo)] hover:text-[var(--blanco)] text-[var(--negro)] dark:text-[var(--blanco)]"
                >
                  <LogOut size={16} />
                  Cerrar Sesión
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
