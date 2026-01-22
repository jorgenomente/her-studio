import { Button } from "@/components/ui/button";

type AppointmentActionsProps = {
  appointmentId: string;
  branchId: string;
  status: string;
  canManageAgenda: boolean;
  onUpdateStatus: (formData: FormData) => Promise<void>;
};

const ACTIONS: {
  label: string;
  value: string;
  allowedFrom: string[];
  variant?: "default" | "outline";
}[] = [
  {
    label: "Iniciar",
    value: "in_progress",
    allowedFrom: [
      "scheduled",
      "scheduled_deposit_pending",
      "scheduled_deposit_verified",
    ],
  },
  { label: "Completar", value: "completed", allowedFrom: ["in_progress"] },
  {
    label: "Cancelar",
    value: "cancelled",
    allowedFrom: [
      "scheduled",
      "scheduled_deposit_pending",
      "scheduled_deposit_verified",
      "in_progress",
    ],
  },
  {
    label: "No-show",
    value: "no_show",
    allowedFrom: [
      "scheduled",
      "scheduled_deposit_pending",
      "scheduled_deposit_verified",
      "in_progress",
    ],
  },
];

export function AppointmentActions({
  appointmentId,
  branchId,
  status,
  canManageAgenda,
  onUpdateStatus,
}: AppointmentActionsProps) {
  if (!canManageAgenda) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed p-4 text-sm">
        Sin permisos para cambiar el estado de la cita.
      </div>
    );
  }

  const available = ACTIONS.filter((action) =>
    action.allowedFrom.includes(status),
  );

  if (available.length === 0) {
    return null;
  }

  return (
    <div className="bg-card space-y-3 rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Acciones rápidas</h2>
      <div className="flex flex-wrap gap-2">
        {available.map((action) => (
          <form key={action.value} action={onUpdateStatus}>
            <input type="hidden" name="appointment_id" value={appointmentId} />
            <input type="hidden" name="branch_id" value={branchId} />
            <input type="hidden" name="status" value={action.value} />
            <Button type="submit" variant={action.variant ?? "outline"}>
              {action.label}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}
