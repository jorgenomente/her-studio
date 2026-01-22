"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";

export function DepositUpload({ appointmentId }: { appointmentId: string }) {
  const [amount, setAmount] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleUpload = async () => {
    if (!file) {
      setError("Seleccioná un comprobante.");
      return;
    }
    if (!amount || Number.isNaN(Number(amount))) {
      setError("Ingresá un monto válido para la seña.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append("appointment_id", appointmentId);
      formData.append("file", file);

      const uploadResponse = await fetch("/api/public/deposit/upload", {
        method: "POST",
        body: formData,
      });

      const uploadBody = (await uploadResponse.json()) as {
        proof_path?: string;
        error?: string;
      };

      if (!uploadResponse.ok || !uploadBody.proof_path) {
        throw new Error(uploadBody.error || "No se pudo subir el comprobante.");
      }

      const supabase = createSupabaseBrowserClient();
      const { error: attachError } = await supabase.rpc(
        "rpc_public_attach_deposit_proof",
        {
          p_appointment_id: appointmentId,
          p_amount: Number(amount),
          p_proof_path: uploadBody.proof_path,
        },
      );

      if (attachError) {
        throw new Error(attachError.message);
      }

      setSuccess("Comprobante registrado. Verificaremos la seña pronto.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo archivo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Monto de la seña</Label>
        <Input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          placeholder="Ej: 15000"
        />
      </div>
      <div className="space-y-2">
        <Label>Comprobante (opcional)</Label>
        <Input
          type="file"
          accept="image/*,application/pdf"
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
          }}
          disabled={isUploading}
        />
      </div>
      <button
        type="button"
        onClick={() => void handleUpload()}
        className="w-full rounded-2xl bg-foreground px-4 py-3 text-sm font-medium text-background transition disabled:opacity-60"
        disabled={isUploading}
      >
        {isUploading ? "Subiendo..." : "Subir comprobante"}
      </button>
      {error ? (
        <p className="text-sm text-destructive">{error}</p>
      ) : null}
      {success ? (
        <p className="text-sm text-emerald-600">{success}</p>
      ) : null}
      {isUploading ? (
        <p className="text-sm text-muted-foreground">Subiendo...</p>
      ) : null}
    </div>
  );
}
