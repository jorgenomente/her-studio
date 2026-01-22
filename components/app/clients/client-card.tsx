import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";

type ClientCardProps = {
  clientId: string;
  name?: string | null;
  phone: string;
  lastVisitAt?: string | null;
  visitsCount: number;
  totalSpent: number;
};

export function ClientCard({
  clientId,
  name,
  phone,
  lastVisitAt,
  visitsCount,
  totalSpent,
}: ClientCardProps) {
  const lastVisitLabel = lastVisitAt
    ? format(new Date(lastVisitAt), "dd/MM/yyyy")
    : "—";

  return (
    <Link
      href={`/app/clientes/${clientId}`}
      className="bg-card hover:border-foreground/20 block rounded-xl border p-4 transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{name ?? "Sin nombre"}</h3>
          <p className="text-muted-foreground text-sm">{phone}</p>
        </div>
        <Badge variant="outline">{`${visitsCount} visitas`}</Badge>
      </div>
      <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span>Última visita: {lastVisitLabel}</span>
        <span>·</span>
        <span>{`Gasto: $${totalSpent.toFixed(2)}`}</span>
      </div>
    </Link>
  );
}
