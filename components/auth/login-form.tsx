"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setStatus("loading");
    setError(null);
    const supabase = createSupabaseBrowserClient();

    if (!email) {
      setStatus("error");
      setError("Email is required.");
      return;
    }

    if (password) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setStatus("error");
        setError(signInError.message);
        return;
      }

      router.push("/app/agenda");
      router.refresh();
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/app/agenda`,
      },
    });

    if (otpError) {
      setStatus("error");
      setError(otpError.message);
      return;
    }

    setStatus("sent");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Staff login</h1>
        <p className="text-muted-foreground text-sm">
          Use your email for a magic link, or enter a password if you have one.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@herstudio.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password (optional)</Label>
          <Input
            id="password"
            type="password"
            placeholder="********"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      </div>

      {status === "sent" ? (
        <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-3 text-sm">
          Magic link sent. Check your inbox.
        </div>
      ) : null}

      {status === "error" && error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      <Button
        className="w-full"
        onClick={handleSignIn}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Signing in..." : "Continue"}
      </Button>
    </div>
  );
}
