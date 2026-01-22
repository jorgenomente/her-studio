import { format } from "date-fns";

import { StatusBadge } from "@/components/app/appointment/status-badge";

export function AppointmentHeader({
  startAt,
  endAt,
  status,
}: {
  startAt: string;
  endAt: string;
  status: string;
}) {
  const start = new Date(startAt);
  const end = new Date(endAt);

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-muted-foreground text-xs tracking-wide uppercase">
          Detalle de cita
        </p>
        <h1 className="text-xl font-semibold">
          {format(start, "EEEE, d MMMM")}
        </h1>
        <p className="text-muted-foreground text-sm">
          {format(start, "HH:mm")} - {format(end, "HH:mm")}
        </p>
      </div>
      <StatusBadge status={status} />
    </div>
  );
}
