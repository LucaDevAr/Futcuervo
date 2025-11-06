"use client";

import RegisterForm from "@/components/auth/RegisterForm";
import Navbar from "@/components/layout/Navbar";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <div className="min-h-full flex items-center justify-center py-10">
      <Suspense fallback={<div>Cargando formulario...</div>}>
        <Navbar />
        <RegisterForm />
      </Suspense>
    </div>
  );
}
