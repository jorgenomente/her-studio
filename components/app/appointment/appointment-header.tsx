import { format } from "date-fns";

import { StatusBadge } from "@/components/app/appointment/status-badge";

export function AppointmentHeader({
  startAt,
  endAt,
  status,
}: {
  startAt: string | null;
  endAt: string | null;
  status: string | null;
}) {
  const start = startAt ? new Date(startAt) : null;
  const end = endAt ? new Date(endAt) : null;
  const hasTimes =
    Boolean(start) &&
    Boolean(end) &&
    !Number.isNaN(start?.getTime()) &&
    !Number.isNaN(end?.getTime());

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Detalle de cita
        </p>
        <h1 className="text-xl font-semibold">
          {hasTimes && start
            ? format(start, "EEEE, d MMMM")
            : "Horario pendiente"}
        </h1>
        {hasTimes && start && end ? (
          <p className="text-muted-foreground text-sm">
            {format(start, "HH:mm")} - {format(end, "HH:mm")}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">Hora por confirmar</p>
        )}
      </div>
      <StatusBadge status={status} />
    </div>
  );
}
