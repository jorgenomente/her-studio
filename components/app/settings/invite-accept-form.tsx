"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function InviteAcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setStatus("loading");
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setStatus("error");
      setError(signUpError.message);
      return;
    }

    const { error: acceptError } = await supabase.rpc("rpc_accept_invite", {
      p_token: token,
      p_full_name: fullName || null,
    });

    if (acceptError) {
      setStatus("error");
      setError(acceptError.message);
      return;
    }

    setStatus("success");
    router.push("/login");
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Aceptar invitación</h1>
        <p className="text-muted-foreground text-sm">
          Creá tu cuenta para acceder a Her Studio.
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
          />
        </div>
        <div className="space-y-2">
          <Label>Nombre</Label>
          <Input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            type="text"
          />
        </div>
        <div className="space-y-2">
          <Label>Contraseña</Label>
          <Input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
          />
        </div>
      </div>

      {status === "error" && error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-3 text-sm">
          {error}
        </div>
      ) : null}

      {status === "success" ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          Invitación aceptada. Redirigiendo...
        </div>
      ) : null}

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Creando cuenta..." : "Aceptar invitación"}
      </Button>
    </div>
  );
}
