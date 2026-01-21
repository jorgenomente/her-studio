"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PurchaseItem = {
  product_id: string;
  product_name: string;
  quantity_ordered: number;
  quantity_received: number | null;
};

export function PurchaseDetailClient({
  purchaseId,
  status,
  orderedAt,
  receivedAt,
  items,
  canManageStock,
  onReceivePurchase,
}: {
  purchaseId: string;
  status: string;
  orderedAt: string;
  receivedAt?: string | null;
  items: PurchaseItem[];
  canManageStock: boolean;
  onReceivePurchase: (formData: FormData) => Promise<void>;
}) {
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drafts, setDrafts] = useState(() =>
    items.map((item) => ({
      product_id: item.product_id,
      quantity_received: item.quantity_received ?? item.quantity_ordered,
    })),
  );

  const payload = useMemo(() => drafts, [drafts]);

  const hasAnyReceived = useMemo(
    () => payload.some((item) => item.quantity_received > 0),
    [payload],
  );

  const updateDraft = (productId: string, value: string) => {
    setDrafts((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity_received: value === "" ? 0 : Math.max(0, Number(value)),
            }
          : item,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">
              Ordenada: {format(new Date(orderedAt), "dd/MM/yyyy")}
            </p>
            {receivedAt ? (
              <p className="text-muted-foreground text-sm">
                Recibida: {format(new Date(receivedAt), "dd/MM/yyyy")}
              </p>
            ) : null}
          </div>
          <span className="rounded-full border px-3 py-1 text-xs">
            {status === "received" ? "Recibida" : "Pendiente"}
          </span>
        </div>
      </div>

      <div className="bg-card space-y-3 rounded-xl border p-4">
        <h2 className="text-base font-semibold">Items</h2>
        {items.map((item) => (
          <div
            key={item.product_id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-muted-foreground">{`Ordenado: ${item.quantity_ordered}`}</p>
            </div>
            <div className="text-muted-foreground">
              {`Recibido: ${item.quantity_received ?? 0}`}
            </div>
          </div>
        ))}
      </div>

      {status === "pending" && canManageStock ? (
        <Button onClick={() => setIsReceiveOpen(true)}>Recibir compra</Button>
      ) : null}

      <Dialog open={isReceiveOpen} onOpenChange={setIsReceiveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Recibir compra</DialogTitle>
          </DialogHeader>
          <form
            action={onReceivePurchase}
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              setConfirmOpen(true);
            }}
          >
            <input type="hidden" name="purchase_id" value={purchaseId} />
            <input type="hidden" name="items" value={JSON.stringify(payload)} />
            {items.map((item) => (
              <div key={item.product_id} className="space-y-2">
                <Label>{item.product_name}</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={
                    drafts.find((draft) => draft.product_id === item.product_id)
                      ?.quantity_received ?? 0
                  }
                  onChange={(event) =>
                    updateDraft(item.product_id, event.target.value)
                  }
                />
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={!hasAnyReceived}>
              Confirmar recepción
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar recepción</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            Esta acción registrará el stock recibido. ¿Querés continuar?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <form
              action={onReceivePurchase}
              onSubmit={() => {
                setConfirmOpen(false);
                setIsReceiveOpen(false);
              }}
            >
              <input type="hidden" name="purchase_id" value={purchaseId} />
              <input
                type="hidden"
                name="items"
                value={JSON.stringify(payload)}
              />
              <Button type="submit" disabled={!hasAnyReceived}>
                Confirmar
              </Button>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
