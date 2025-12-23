"use client";

import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";
import ClubSelector from "@/components/ClubSelector";

const ClubModalContext = createContext(null);

export function useClubModal() {
  const ctx = useContext(ClubModalContext);
  if (!ctx) {
    throw new Error("useClubModal debe usarse dentro de ClubModalProvider");
  }
  return ctx;
}

export function ClubModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <ClubModalContext.Provider
      value={{
        openClubModal: () => setOpen(true),
        closeClubModal: () => setOpen(false),
      }}
    >
      {children}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-lg bg-[var(--background)] text-[var(--text)] border-2 border-[var(--secondary)]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--secondary)]">
              <h2 className="text-xl sm:text-2xl font-bold">
                Selecciona tu Club
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="hover:opacity-80 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Contenido */}
            <div className="overflow-y-auto p-6 flex-1">
              <ClubSelector />
            </div>
          </div>
        </div>
      )}
    </ClubModalContext.Provider>
  );
}
