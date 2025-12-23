"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ChevronLeft,
  BarChart3,
  Music,
  Users,
  User,
  Video,
  Shirt,
  Shield,
  Globe,
  Settings,
  Gamepad2,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AdminLogoMenu from "@/components/admin/AdminLogoMenu";

const menuItems = [
  { icon: Home, label: "Home", href: "/", exact: true },
  { icon: BarChart3, label: "Dashboard", href: "/admin", exact: true },
  { icon: Gamepad2, label: "Juegos", href: "/admin/games" },
  { icon: Music, label: "Canciones", href: "/admin/songs" },
  { icon: User, label: "Jugadores", href: "/admin/players" },
  { icon: User, label: "Técnicos", href: "/admin/coaches" },
  { icon: Shield, label: "Clubes", href: "/admin/clubs" },
  { icon: Globe, label: "Ligas", href: "/admin/leagues" },
  { icon: Shirt, label: "Camisetas", href: "/admin/shirts" },
  { icon: Users, label: "Usuarios", href: "/admin/users" },
  { icon: Video, label: "Videos", href: "/admin/videos" },
  { icon: Settings, label: "Configuración", href: "/admin/settings" },
];

export default function AdminSidebar({
  isDarkMode = true,
  onToggleDarkMode,
  onToggleCollapse,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Notificar al layout cuando cambia el estado de colapso
  useEffect(() => {
    if (onToggleCollapse) {
      onToggleCollapse(isCollapsed);
    }
  }, [isCollapsed, onToggleCollapse]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (href, exact) =>
    exact ? pathname === href : pathname.startsWith(href);

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg md:hidden"
          style={{
            backgroundColor: isDarkMode ? "var(--primary)" : "var(--secondary)",
            color: "var(--white)",
          }}
        >
          <Menu size={20} />
        </button>

        {isMobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 h-full w-64 shadow-lg bg-[var(--background)]">
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{
                  borderColor: isDarkMode
                    ? "var(--primary)"
                    : "var(--secondary)",
                }}
              >
                <AdminLogoMenu
                  isDarkMode={isDarkMode}
                  onToggleDarkMode={onToggleDarkMode}
                />
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded"
                  style={{
                    color: isDarkMode ? "var(--white)" : "var(--black)",
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="p-4 space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, item.exact);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left",
                        active && "font-semibold"
                      )}
                      style={{
                        backgroundColor: active
                          ? isDarkMode
                            ? "var(--primary)"
                            : "var(--secondary)"
                          : "transparent",
                        color: active
                          ? "var(--white)"
                          : isDarkMode
                          ? "var(--white)"
                          : "var(--black)",
                      }}
                      onMouseEnter={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? "var(--primary)"
                            : "var(--secondary)";
                          e.currentTarget.style.color = "var(--white)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!active) {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.color = isDarkMode
                            ? "var(--white)"
                            : "var(--black)";
                        }
                      }}
                    >
                      <Icon size={24} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "hidden md:flex flex-col h-screen border-r transition-all duration-300 fixed top-0 left-0 z-40",
          isCollapsed ? "w-16" : "w-64"
        )}
        style={{
          backgroundColor: isDarkMode ? "var(--fondo-oscuro)" : "var(--white)",
          borderColor: isDarkMode ? "var(--primary)" : "var(--secondary)",
        }}
      >
        <div
          className={`relative p-4 border-b ${isCollapsed ? "px-2" : "px-4"}`}
          style={{
            borderColor: isDarkMode ? "var(--primary)" : "var(--secondary)",
          }}
        >
          <div className="absolute top-[56px] -right-4 z-10 bg-[var(--secondary)] rounded-full text-white hover:rounded-full">
            <button
              onClick={handleToggleCollapse}
              className="transition-colors w-8 h-8 flex justify-center items-center hover:bg-[var(--secondary)] hover:rounded-full rounded-full"
              title={isCollapsed ? "Expandir sidebar" : "Colapsar sidebar"}
            >
              <ChevronLeft
                size={24}
                className={cn(
                  "transition-transform ",
                  isCollapsed && "rotate-180"
                )}
              />
            </button>
          </div>
          <AdminLogoMenu
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            isCollapsed={isCollapsed}
          />
        </div>

        <nav className={`flex-1 space-y-2 ${isCollapsed ? "p-2" : "p-4"} py-4`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "h-10 w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      active && "font-semibold",
                      "justify-start",
                      "items-center"
                    )}
                    style={{
                      backgroundColor: active
                        ? isDarkMode
                          ? "var(--primary)"
                          : "var(--secondary)"
                        : "transparent",
                      color: active
                        ? "var(--white)"
                        : isDarkMode
                        ? "var(--white)"
                        : "var(--black)",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = isDarkMode
                          ? "var(--primary)"
                          : "var(--secondary)";
                        e.currentTarget.style.color = "var(--white)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = isDarkMode
                          ? "var(--white)"
                          : "var(--black)";
                      }
                    }}
                  >
                    <Icon size={24} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent
                    side="right"
                    align="center"
                    sideOffset={8}
                    className="text-white border-0 px-3 py-1.5 rounded-md text-sm"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--primary)"
                        : "var(--secondary)",
                    }}
                  >
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </TooltipProvider>
  );
}
