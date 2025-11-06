"use client";
import { X } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[var(--background)] rounded-lg p-6 w-80 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <p className="text-sm mb-6 text-[var(--text)]">{message}</p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 p-2 rounded-md bg-gray-300 dark:bg-gray-600 hover:opacity-80"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 p-2 rounded-md bg-red-500 text-white hover:opacity-80"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
