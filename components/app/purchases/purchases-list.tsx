"use client";

import Link from "next/link";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";

type PurchaseListItem = {
  purchase_id: string;
  status: string;
  ordered_at: string;
  received_at?: string | null;
  items_count: number;
  ordered_total_qty: number;
};

export function PurchasesList({ items }: { items: PurchaseListItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((purchase) => (
        <Link
          key={purchase.purchase_id}
          href={`/app/compras/${purchase.purchase_id}`}
          className="bg-card hover:border-foreground/20 block rounded-xl border p-4 transition"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-muted-foreground text-sm">
                {format(new Date(purchase.ordered_at), "dd/MM/yyyy")}
              </p>
              <h3 className="text-base font-semibold">
                Compra #{purchase.purchase_id.slice(0, 6)}
              </h3>
              <p className="text-muted-foreground text-sm">
                {purchase.items_count} items · {purchase.ordered_total_qty}{" "}
                unidades
              </p>
            </div>
            <Badge
              variant={purchase.status === "received" ? "default" : "outline"}
            >
              {purchase.status === "received" ? "Recibida" : "Pendiente"}
            </Badge>
          </div>
          {purchase.received_at ? (
            <p className="text-muted-foreground mt-3 text-xs">
              Recibida: {format(new Date(purchase.received_at), "dd/MM/yyyy")}
            </p>
          ) : null}
        </Link>
      ))}
    </div>
  );
}
