import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AppointmentCardProps = {
  appointmentId: string;
  startAt: string;
  endAt: string;
  status: string;
  staffName: string;
  serviceName: string;
  clientName?: string | null;
  clientPhone?: string | null;
  hasDeposit: boolean;
  hasPayment: boolean;
};

const STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  scheduled_deposit_pending: "Seña pendiente",
  scheduled_deposit_verified: "Seña verificada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No-show",
};

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700",
  scheduled_deposit_pending: "bg-amber-100 text-amber-700",
  scheduled_deposit_verified: "bg-emerald-100 text-emerald-700",
  in_progress: "bg-indigo-100 text-indigo-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  no_show: "bg-gray-200 text-gray-700",
};

export function AppointmentCard({
  appointmentId,
  startAt,
  endAt,
  status,
  staffName,
  serviceName,
  clientName,
  clientPhone,
  hasDeposit,
  hasPayment,
}: AppointmentCardProps) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  return (
    <Link
      href={`/app/agenda/${appointmentId}`}
      className="bg-card hover:border-foreground/20 block rounded-xl border p-4 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-sm">
            {format(start, "HH:mm")} - {format(end, "HH:mm")}
          </p>
          <h3 className="text-base font-semibold">{serviceName}</h3>
          <p className="text-muted-foreground text-sm">{staffName}</p>
        </div>
        <Badge
          className={cn(
            "border-0",
            STATUS_STYLES[status] ?? "bg-muted text-foreground",
          )}
        >
          {STATUS_LABELS[status] ?? status}
        </Badge>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div>
          <p className="font-medium">{clientName ?? "Cliente sin nombre"}</p>
          <p className="text-muted-foreground">
            {clientPhone ?? "Sin telefono"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Badge variant={hasDeposit ? "default" : "outline"}>
            {hasDeposit ? "Seña" : "Sin seña"}
          </Badge>
          <Badge variant={hasPayment ? "default" : "outline"}>
            {hasPayment ? "Pago" : "Sin pago"}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
