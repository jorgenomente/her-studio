import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

export function StatusBadge({ status }: { status: string | null }) {
  const resolvedStatus = status ?? "unknown";
  return (
    <Badge
      className={cn(
        "border-0",
        STATUS_STYLES[resolvedStatus] ?? "bg-muted text-foreground",
      )}
    >
      {STATUS_LABELS[resolvedStatus] ?? "Sin estado"}
    </Badge>
  );
}
