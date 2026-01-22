"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createPublicReservationAction } from "@/lib/actions/public-booking";

export function PublicReservationForm({
  branchId,
  serviceId,
  startAt,
  staffStrategy,
  staffId,
}: {
  branchId: string;
  serviceId: string;
  startAt: string;
  staffStrategy: string;
  staffId?: string | null;
}) {
  return (
    <form action={createPublicReservationAction} className="space-y-6">
      <input type="hidden" name="branch_id" value={branchId} />
      <input type="hidden" name="service_id" value={serviceId} />
      <input type="hidden" name="start_at" value={startAt} />
      <input type="hidden" name="staff_strategy" value={staffStrategy} />
      <input type="hidden" name="staff_id" value={staffId ?? ""} />
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Nombre completo</Label>
          <Input name="full_name" placeholder="Ej: Camila López" required />
        </div>
        <div className="space-y-2">
          <Label>Celular</Label>
          <Input name="phone" type="tel" placeholder="11 1234 5678" required />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input name="email" type="email" placeholder="tu@email.com" />
        </div>
        <div className="space-y-2">
          <Label>Notas adicionales</Label>
          <Textarea
            name="notes"
            placeholder="Preferencias, alergias o comentarios"
          />
        </div>
      </div>

      <div className="rounded-2xl border bg-muted/40 p-4 space-y-2 text-sm text-muted-foreground">
        Si querés dejar una seña, podés subir el comprobante luego de confirmar
        la reserva. La validación es manual.
      </div>

      <Button className="w-full" type="submit">
        Confirmar reserva
      </Button>
    </form>
  );
}
