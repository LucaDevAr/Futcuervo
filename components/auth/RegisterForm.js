"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // importante para recibir cookies
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar");

      router.push("/"); // Redirigir al home
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="w-full max-w-sm m-auto rounded-xl border-2 shadow-xl p-5 bg-[var(--background)] border-[var(--primary)] dark:border-[var(--secondary)] text-[var(--text)]">
      <div className="text-center mb-4">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/futcuervo-logo-BVEl3yIsYZbvGKRzYTsnwYx4zjfB3m.png"
          alt="FutCuervo"
          className="w-14 h-14 mx-auto mb-2"
        />
        <h1 className="text-xl font-bold">Crear Cuenta</h1>
        <p className="text-xs mt-1" style={{ color: "var(--gris)" }}>
          Únete a la comunidad de FutCuervo
        </p>
      </div>

      {error && (
        <div className="p-2 mb-3 rounded-md text-sm bg-[var(--background)] text-[var(--primary)] dark:text-[var(--secondary)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-xs font-medium mb-1">
            Nombre
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2 pl-9 pr-3 rounded-lg border-2 text-sm bg-[var(--background)] border-[var(--primary)] dark:border-[var(--secondary)]"
              placeholder="Tu nombre"
              required
            />
            <User
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--gris)" }}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-xs font-medium mb-1">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-2 pl-9 pr-3 rounded-lg border-2 text-sm bg-[var(--background)] border-[var(--primary)] dark:border-[var(--secondary)]"
              placeholder="tu@email.com"
              required
            />
            <Mail
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--gris)" }}
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className="block text-xs font-medium mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-2 pl-9 pr-9 rounded-lg border-2 text-sm bg-[var(--background)] border-[var(--primary)] dark:border-[var(--secondary)]"
              placeholder="Mínimo 6 caracteres"
              required
            />
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--gris)" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--gris)" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-xs font-medium mb-1"
          >
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full py-2 pl-9 pr-3 rounded-lg border-2 text-sm bg-[var(--background)] border-[var(--primary)] dark:border-[var(--secondary)]"
              placeholder="Confirma tu contraseña"
              required
            />
            <Lock
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--gris)" }}
            />
          </div>
        </div>

        {/* Botón de registro */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg font-medium text-sm transition hover:shadow disabled:opacity-50 bg-[var(--primary)] dark:bg-[var(--secondary)]"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>

        {/* Línea divisoria */}
        <div className="relative my-4">
          <div
            className="absolute inset-0 flex items-center"
            aria-hidden="true"
          >
            <div
              className="w-full border-t"
              style={{
                borderColor: "var(--gris)",
              }}
            ></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span
              className="px-2 bg-[var(--background)]"
              style={{
                color: "var(--gris)",
              }}
            >
              O continúa con
            </span>
          </div>
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 text-sm transition hover:shadow bg-[var(--background)]"
          style={{
            borderWidth: "1px",
            borderColor: "var(--gris)",
          }}
        >
          <FcGoogle size={18} />
          Google
        </button>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "var(--gris)" }}
        >
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/auth/login"
            className="font-medium text-[var(--primary)] dark:text-[var(--secondary)]"
          >
            Inicia sesión
          </Link>
        </p>
      </form>
    </div>
  );
}
