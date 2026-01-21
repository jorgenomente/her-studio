import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-4 py-10">
      <div className="bg-background w-full max-w-sm rounded-2xl border p-6 shadow-sm">
        <LoginForm />
      </div>
    </div>
  );
}
