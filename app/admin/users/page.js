"use client";

import { useState, useEffect } from "react";
import { Users, Edit, Trash2, Search, Shield, UserIcon } from "lucide-react";
import Image from "next/image";

export default function UsersAdminPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");

      if (!res.ok) {
        throw new Error("Error al obtener usuarios");
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser({ ...user });
    setShowEditModal(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const res = await fetch(`/api/admin/users/${editingUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
        }),
      });

      if (!res.ok) {
        throw new Error("Error al actualizar usuario");
      }

      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
      alert("Usuario actualizado exitosamente");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Error al actualizar usuario");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const confirmed = confirm(
      `¿Estás seguro de que quieres eliminar al usuario "${userName}"?`
    );
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Error al eliminar usuario");
      }

      fetchUsers();
      alert("Usuario eliminado exitosamente");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error al eliminar usuario");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold mb-2"
          style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
        >
          Gestión de Usuarios
        </h1>
        <p className="text-lg" style={{ color: "var(--gris)" }}>
          Administra los usuarios y permisos de FutCuervo
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2"
          style={{ color: "var(--gris)" }}
        />
        <input
          type="text"
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border-2 transition-colors"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
            color: isDarkMode ? "var(--blanco)" : "var(--negro)",
          }}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <div className="flex items-center gap-2">
            <Users
              size={20}
              style={{ color: isDarkMode ? "var(--azul)" : "var(--rojo)" }}
            />
            <span
              className="font-medium"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Total: {filteredUsers.length} usuarios
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--rojo)" : "var(--azul)",
          }}
        >
          <div className="flex items-center gap-2">
            <Shield
              size={20}
              style={{ color: isDarkMode ? "var(--rojo)" : "var(--azul)" }}
            />
            <span
              className="font-medium"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Admins: {filteredUsers.filter((u) => u.role === "admin").length}
            </span>
          </div>
        </div>

        <div
          className="p-4 rounded-lg border-2"
          style={{
            backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
            borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
          }}
        >
          <div className="flex items-center gap-2">
            <UserIcon
              size={20}
              style={{ color: isDarkMode ? "var(--azul)" : "var(--rojo)" }}
            />
            <span
              className="font-medium"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Usuarios: {filteredUsers.filter((u) => u.role === "user").length}
            </span>
          </div>
        </div>
      </div>

      {/* Users List */}
      {loading ? (
        <div className="text-center py-8" style={{ color: "var(--gris)" }}>
          Cargando usuarios...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-8" style={{ color: "var(--gris)" }}>
          {searchTerm
            ? "No se encontraron usuarios con ese término."
            : "No hay usuarios disponibles."}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <div
              key={user._id}
              className="p-4 rounded-lg border-2 transition-all duration-300 hover:shadow-lg"
              style={{
                backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
                borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              }}
            >
              <div className="flex items-center gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {user.image ? (
                    <Image
                      src={user.image || "/placeholder.svg"}
                      alt={user.name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-15 h-15 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: isDarkMode
                          ? "var(--azul)"
                          : "var(--rojo)",
                      }}
                    >
                      <UserIcon size={30} color="var(--blanco)" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-lg truncate"
                    style={{
                      color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                    }}
                  >
                    {user.name}
                  </h3>
                  <p
                    className="text-sm truncate"
                    style={{ color: "var(--gris)" }}
                  >
                    {user.email}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <span
                      className="text-xs px-2 py-1 rounded font-medium"
                      style={{
                        backgroundColor:
                          user.role === "admin"
                            ? `${isDarkMode ? "var(--rojo)" : "var(--azul)"}20`
                            : `${isDarkMode ? "var(--azul)" : "var(--rojo)"}20`,
                        color:
                          user.role === "admin"
                            ? isDarkMode
                              ? "var(--rojo)"
                              : "var(--azul)"
                            : isDarkMode
                            ? "var(--azul)"
                            : "var(--rojo)",
                      }}
                    >
                      {user.role === "admin" ? "Administrador" : "Usuario"}
                    </span>
                    {user.provider && (
                      <span
                        className="text-xs px-2 py-1 rounded"
                        style={{
                          backgroundColor: `${
                            isDarkMode ? "var(--gris)" : "var(--gris-oscuro)"
                          }20`,
                          color: "var(--gris)",
                        }}
                      >
                        {user.provider === "google" ? "Google" : "Email"}
                      </span>
                    )}
                    <span className="text-xs" style={{ color: "var(--gris)" }}>
                      Registrado: {formatDate(user.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--azul)"
                        : "var(--rojo)",
                      color: "var(--blanco)",
                    }}
                    title="Editar usuario"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user._id, user.name)}
                    className="p-2 rounded-lg transition-colors"
                    style={{
                      backgroundColor: isDarkMode
                        ? "var(--rojo)"
                        : "var(--azul)",
                      color: "var(--blanco)",
                    }}
                    title="Eliminar usuario"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className="w-full max-w-md p-6 rounded-lg"
            style={{
              backgroundColor: isDarkMode ? "var(--negro)" : "var(--blanco)",
              borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
              borderWidth: "2px",
            }}
          >
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: isDarkMode ? "var(--blanco)" : "var(--negro)" }}
            >
              Editar Usuario
            </h2>

            <div className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  Nombre
                </label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border-2 transition-colors"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--fondo-oscuro)"
                      : "var(--gris-claro)",
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                  className="w-full p-3 rounded-lg border-2 transition-colors"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--fondo-oscuro)"
                      : "var(--gris-claro)",
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  Rol
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-lg border-2 transition-colors"
                  style={{
                    backgroundColor: isDarkMode
                      ? "var(--fondo-oscuro)"
                      : "var(--gris-claro)",
                    borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                    color: isDarkMode ? "var(--blanco)" : "var(--negro)",
                  }}
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveUser}
                className="flex-1 p-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  color: "var(--blanco)",
                }}
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingUser(null);
                }}
                className="flex-1 p-3 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: "transparent",
                  borderWidth: "1px",
                  borderColor: isDarkMode ? "var(--azul)" : "var(--rojo)",
                  color: isDarkMode ? "var(--azul)" : "var(--rojo)",
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
