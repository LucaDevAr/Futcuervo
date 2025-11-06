"use client";

import { useState, useEffect } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };

    checkDarkMode();
    checkMobile();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", checkMobile);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const handleToggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setIsDarkMode(!isDarkMode);
  };

  const handleToggleCollapse = (collapsed) => {
    setIsCollapsed(collapsed);
  };

  // Calcular el margen izquierdo basado en el estado del sidebar
  const getMainMargin = () => {
    if (isMobile) return "0px"; // Sin margen en móvil
    return isCollapsed ? "64px" : "256px"; // 64px colapsado, 256px expandido
  };

  return (
    <div className="min-h-screen flex transition-colors duration-200 bg-[var(--background)] text-[var(--text)]">
      {/* Sidebar fijo */}
      <AdminSidebar
        isDarkMode={isDarkMode}
        onToggleDarkMode={handleToggleDarkMode}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Contenido principal con margen dinámico */}
      <main
        className="flex-1 transition-all duration-300 bg-[var(--background)]"
        style={{
          marginLeft: getMainMargin(),
        }}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
