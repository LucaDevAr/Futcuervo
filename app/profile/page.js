"use client";

import { useState } from "react";
import { User, Mail } from "lucide-react";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { useClubMemberships } from "@/hooks/auth/useClubMemberships";
import ClubMemberSelector from "@/components/ClubMemberSelector";
import ConfirmModal from "@/components/ConfirmModal";
import { useUserStore } from "@/stores/userStore";

const canLeave = (membership) => {
  const joined = new Date(membership.joinedDate);
  const now = new Date();
  const diffDays = (now - joined) / (1000 * 60 * 60 * 24);

  return diffDays >= 7;
};

const getDaysRemaining = (membership) => {
  const joined = new Date(membership.joinedDate);
  const now = new Date();
  const diffDays = (now - joined) / (1000 * 60 * 60 * 24);
  return Math.ceil(7 - diffDays);
};

export default function ProfilePage() {
  const user = useUserStore((s) => s.user);
  const loading = !user;

  const { memberships, join, leave } = useClubMemberships();
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [action, setAction] = useState(null);
  const [selectedClub, setSelectedClub] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);

  const safeMemberships = (memberships || []).filter(Boolean);

  const partnerClub = safeMemberships.find((m) => m.role === "partner");
  const supporterClub = safeMemberships.find((m) => m.role === "supporter");

  if (loading || !user) return null;

  const askJoin = (club, role) => {
    setSelectedClub(club);
    setSelectedRole(role);
    setAction("join");
    setConfirmOpen(true);
  };

  const askLeave = (clubId, role) => {
    const membership = safeMemberships.find(
      (m) => m.club.id === clubId && m.role === role
    );

    if (!membership) return;

    // ⛔ BLOQUEO INMEDIATO (0 fetchs)
    if (!canLeave(membership)) {
      const remaining = getDaysRemaining(membership);

      setErrorMessage(
        `Aún no puedes salir del club. Debes esperar ${remaining} día(s) más.`
      );
      setErrorModalOpen(true);
      return;
    }

    // ✔ Si pasó la validación → abrir modal de confirmación
    setSelectedClub({ _id: clubId });
    setSelectedRole(role);
    setAction("leave");
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setConfirmOpen(false);

    let result;

    if (action === "join") {
      result = await join(selectedClub.id || selectedClub._id, selectedRole);
    } else if (action === "leave") {
      result = await leave(selectedClub._id, selectedRole);
    }

    if (result?.error) {
      setErrorMessage(result.error);
      setErrorModalOpen(true);
    }

    setSelectedClub(null);
    setSelectedRole(null);
    setAction(null);
  };

  const excludedClubIds = safeMemberships.map((m) => m.club.id);

  const getDaysRemaining = (club) => {
    const joined = new Date(club.joinedDate);
    const now = new Date();
    const diffDays = (now - joined) / (1000 * 60 * 60 * 24);
    const remaining = Math.ceil(7 - diffDays);
    return remaining > 0 ? remaining : 0;
  };

  return (
    <div className="text-[var(--text)]">
      <Navbar />

      <div className="py-10 flex items-center justify-center bg-[var(--background)]">
        <div className="w-96 flex flex-col gap-4">
          {/* TARJETA PERFIL */}
          <div className="p-6 rounded-xl shadow-md bg-[var(--primary)] dark:bg-[var(--secondary)]">
            <div className="text-center mb-6 text-white">
              <h1 className="text-2xl font-bold mb-1">Mi Perfil</h1>
              <p className="text-sm">Tu información en FutCuervo</p>
            </div>

            <div className="flex justify-center mb-4">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-24 h-24 rounded-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full flex items-center justify-center bg-[var(--primary)] dark:bg-[var(--secondary)]">
                  <User size={40} color="var(--blanco)" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="p-3 rounded-md bg-[var(--background)]">
                <div className="flex items-center gap-2 mb-1">
                  <User size={18} />
                  <span className="font-medium text-sm">Nombre</span>
                </div>
                <p className="text-base">{user.name}</p>
              </div>

              <div className="p-3 rounded-md bg-[var(--background)]">
                <div className="flex items-center gap-2 mb-1">
                  <Mail size={18} />
                  <span className="font-medium text-sm">Email</span>
                </div>
                <p className="text-base">{user.email}</p>
              </div>

              {/* PUNTOS TOTALES */}
              <div className="p-3 rounded-md bg-[var(--background)]">
                <span className="font-medium text-sm block mb-1">
                  Puntos Totales
                </span>
                <p className="text-2xl font-bold text-[var(--primary)]">
                  {user.points ?? 0} pts
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-xl shadow-md bg-[var(--primary)] dark:bg-[var(--secondary)] flex flex-col gap-2">
            {/* PARTNER */}
            <div className="p-4 rounded-md bg-[var(--background)]">
              <h3 className="font-semibold text-lg mb-2">Club como Socio</h3>

              {partnerClub ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={partnerClub.club.logo}
                      className="w-10 h-10 rounded object-contain"
                    />
                    <span>{partnerClub.club.name}</span>
                  </div>

                  {/* PUNTOS DEL CLUB */}
                  <span className="text-sm font-semibold text-green-500">
                    {partnerClub.points} pts
                  </span>

                  <button
                    onClick={() => askLeave(partnerClub.club.id, "partner")}
                    className="text-red-500 hover:underline"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Aún no elegiste un club como socio 👇
                  </p>
                  <ClubMemberSelector
                    exclude={excludedClubIds}
                    onSelect={(club) => askJoin(club, "partner")}
                  />
                </div>
              )}

              {partnerClub && (
                <p className="text-xs text-gray-400 mt-1">
                  {getDaysRemaining(partnerClub) > 0
                    ? `Podrás salir dentro de ${getDaysRemaining(
                        partnerClub
                      )} día(s)`
                    : `Ya puedes salir`}
                </p>
              )}
            </div>

            {/* SUPPORTER */}
            <div className="p-4 rounded-md bg-[var(--background)]">
              <h3 className="font-semibold text-lg mb-2">
                Club como Simpatizante
              </h3>

              {supporterClub ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={supporterClub.club.logo}
                      className="w-10 h-10 rounded object-contain"
                    />
                    <span>{supporterClub.club.name}</span>
                  </div>

                  {/* PUNTOS DEL CLUB */}
                  <span className="text-sm font-semibold text-blue-500">
                    {supporterClub.points} pts
                  </span>

                  <button
                    onClick={() => askLeave(supporterClub.club.id, "supporter")}
                    className="text-red-500 hover:underline"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-400 mb-2">
                    Aún no sos simpatizante de ningún club 👇
                  </p>
                  <ClubMemberSelector
                    exclude={excludedClubIds}
                    onSelect={(club) => askJoin(club, "supporter")}
                  />
                </div>
              )}

              {supporterClub && (
                <p className="text-xs text-gray-400 mt-1">
                  {getDaysRemaining(supporterClub) > 0
                    ? `Podrás salir dentro de ${getDaysRemaining(
                        supporterClub
                      )} día(s)`
                    : `Ya puedes salir`}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <ConfirmModal
        open={confirmOpen}
        title={action === "leave" ? "Salir del Club" : "Unirse al Club"}
        message="Solo podrás cambiar nuevamente de club después de 7 días. ¿Deseas continuar?"
        onConfirm={handleConfirm}
        onCancel={() => setConfirmOpen(false)}
      />

      {errorModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] p-5 rounded-md w-80 text-center shadow-lg">
            <h2 className="text-lg font-semibold mb-3 text-red-500">Aviso</h2>
            <p className="text-sm mb-4">{errorMessage}</p>
            <button
              onClick={() => setErrorModalOpen(false)}
              className="px-4 py-2 rounded bg-[var(--primary)] text-white hover:opacity-90"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
