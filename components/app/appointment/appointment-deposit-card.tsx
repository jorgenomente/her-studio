import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DepositCardProps = {
  appointmentId: string;
  branchId: string;
  hasPaymentPermission: boolean;
  depositId?: string | null;
  amount?: number | null;
  status?: string | null;
  proofUrl?: string | null;
  onCreateOrUpdate: (formData: FormData) => Promise<void>;
  onVerify: (formData: FormData) => Promise<void>;
};

export function AppointmentDepositCard({
  appointmentId,
  branchId,
  hasPaymentPermission,
  depositId,
  amount,
  status,
  proofUrl,
  onCreateOrUpdate,
  onVerify,
}: DepositCardProps) {
  const hasDeposit = Boolean(depositId);

  return (
    <div className="bg-card space-y-4 rounded-xl border p-4">
      <div>
        <h2 className="text-sm font-semibold">Seña</h2>
        <p className="text-muted-foreground text-sm">
          {hasDeposit ? "Registro existente" : "No registrada"}
        </p>
      </div>

      {hasDeposit ? (
        <div className="space-y-2 text-sm">
          <div>Estado: {status ?? "pending"}</div>
          <div>Monto: {amount ? `$${amount}` : "—"}</div>
          {proofUrl ? (
            <a
              className="text-primary underline"
              href={proofUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver comprobante
            </a>
          ) : (
            <div className="text-muted-foreground">Sin comprobante</div>
          )}
        </div>
      ) : null}

      {hasPaymentPermission && (!hasDeposit || status === "pending") ? (
        <form action={onCreateOrUpdate} className="space-y-3">
          <input type="hidden" name="appointment_id" value={appointmentId} />
          <input type="hidden" name="branch_id" value={branchId} />
          <div className="space-y-2">
            <Label htmlFor="deposit_amount">Monto</Label>
            <Input
              id="deposit_amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              defaultValue={amount ?? ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit_proof">Comprobante (URL)</Label>
            <Input
              id="deposit_proof"
              name="proof_url"
              type="url"
              placeholder="https://"
              defaultValue={proofUrl ?? ""}
            />
          </div>
          <Button type="submit" variant="outline">
            {hasDeposit ? "Actualizar seña" : "Registrar seña"}
          </Button>
        </form>
      ) : (
        <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-3 text-sm">
          {hasPaymentPermission
            ? "La seña ya fue verificada o rechazada."
            : "Sin permisos para gestionar señas."}
        </div>
      )}

      {hasDeposit && hasPaymentPermission && status === "pending" ? (
        <div className="flex gap-2">
          <form action={onVerify}>
            <input type="hidden" name="deposit_id" value={depositId ?? ""} />
            <input type="hidden" name="branch_id" value={branchId} />
            <input type="hidden" name="appointment_id" value={appointmentId} />
            <input type="hidden" name="status" value="verified" />
            <Button type="submit">Verificar</Button>
          </form>
          <form action={onVerify}>
            <input type="hidden" name="deposit_id" value={depositId ?? ""} />
            <input type="hidden" name="branch_id" value={branchId} />
            <input type="hidden" name="appointment_id" value={appointmentId} />
            <input type="hidden" name="status" value="rejected" />
            <Button type="submit" variant="outline">
              Rechazar
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
