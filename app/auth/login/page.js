import Navbar from "@/components/layout/Navbar";
import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="md:h-[calc(100vh-64px)] h-[calc(100vh-56px)] flex items-center justify-center">
      <Navbar />
      <LoginForm />
    </div>
  );
}
