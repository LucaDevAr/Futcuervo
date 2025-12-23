// frontend/utils/auth.js
import { useUserStore } from "@/stores/userStore";
import { postLogout } from "@/services/api";

export const performLogout = async () => {
  try {
    // Llamar a la API de logout en backend
    await postLogout();
  } catch (err) {
    console.warn("Error calling API logout:", err);
    // seguimos con el logout local de todos modos
  }

  // Limpiar store y localStorage
  useUserStore.getState().clearUser();
  localStorage.removeItem("user");
  localStorage.removeItem("game-attempts-storage");
  localStorage.removeItem("authFlag");

  // Redirigir a home/login
  window.location.href = "/";

  // Detener ejecución del flujo actual
  throw new Error("Logout ejecutado, flujo detenido");
};
