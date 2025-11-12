"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useUserStore } from "@/stores/userStore";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const setUser = useUserStore((state) => state.setUser);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        if (data.user) {
          setUser(data.user);
          localStorage.setItem("userFallback", JSON.stringify(data.user));
        }
        router.push(callbackUrl);
      }
    } catch (error) {
      setError("Ocurrió un error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google`;
  };

  return (
    <div className="w-full max-w-sm rounded-xl border-2 shadow-xl m-auto p-5 bg-[var(--background)] border-[var(--primary)] dark:border-[var(--secondary)] text-[var(--text)]">
      <div className="text-center mb-4">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/futcuervo-logo-BVEl3yIsYZbvGKRzYTsnwYx4zjfB3m.png"
          alt="FutCuervo"
          className="w-14 h-14 mx-auto mb-2"
        />
        <h1 className="text-xl font-bold">Iniciar Sesión</h1>
        <p className="text-xs mt-1" style={{ color: "var(--gris)" }}>
          Ingresa a tu cuenta de FutCuervo
        </p>
      </div>

      {error && (
        <div className="p-2 mb-3 rounded-md text-sm bg-[var(--background)] text-[var(--primary)] dark:text-[var(--secondary)]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
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

        {/* Password */}
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
              placeholder="••••••••"
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

        <div className="flex justify-end text-xs">
          <Link
            href="/auth/forgot-password"
            className="transition-colors text-[var(--primary)] dark:text-[var(--secondary)]"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded-lg font-medium transition-all hover:shadow disabled:opacity-50 text-sm bg-[var(--primary)] dark:bg-[var(--secondary)]"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </button>

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
          ¿No tienes una cuenta?{" "}
          <Link
            href="/auth/register"
            className="font-medium text-[var(--primary)] dark:text-[var(--secondary)]"
          >
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}
