"use client";

import { X } from "lucide-react";
import ClubSelector from "@/components/ClubSelector";
import ModalPortal from "@/components/ui/ModalPortal";

export default function ClubSelectorModal({ onClose }) {
  return (
    <ModalPortal>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div
          className="rounded-xl w-full max-w-5xl h-[90vh] flex flex-col shadow-lg"
          style={{
            backgroundColor: "var(--primary)",
            color: "var(--white)",
            border: "2px solid var(--secondary)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: "var(--secondary)" }}
          >
            <h2 className="text-xl sm:text-2xl font-bold">
              Selecciona tu Club
            </h2>

            <button
              onClick={onClose}
              className="hover:opacity-80 transition"
              style={{ color: "var(--white)" }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenido */}
          <div className="overflow-y-auto p-6 flex-1 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-200 dark:scrollbar-track-gray-700">
            <ClubSelector />
          </div>
        </div>
      </div>
    </ModalPortal>
  );
}
