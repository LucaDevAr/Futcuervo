import Navbar from "@/components/layout/Navbar";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-full flex items-center justify-center py-10">
      <Navbar />
      <RegisterForm />
    </div>
  );
}
