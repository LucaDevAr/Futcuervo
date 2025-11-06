"use client";

import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import Navbar from "@/components/layout/Navbar";

export default function LoginPage() {
  return (
    <div className="md:h-[calc(100vh-64px)] h-[calc(100vh-56px)] flex items-center justify-center">
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <Navbar />
        <LoginForm />
      </Suspense>
    </div>
  );
}
