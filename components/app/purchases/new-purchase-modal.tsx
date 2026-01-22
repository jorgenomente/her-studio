"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProductOption = {
  id: string;
  name: string;
};

type PurchaseItemDraft = {
  id: string;
  productId: string;
  quantity: string;
  unitCost: string;
};

export function NewPurchaseModal({
  open,
  onOpenChange,
  products,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductOption[];
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  const [items, setItems] = useState<PurchaseItemDraft[]>([
    { id: "item-1", productId: "", quantity: "", unitCost: "" },
  ]);
  const [isOpen, setIsOpen] = useState(open);

  const productOptions = useMemo(() => products, [products]);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener("hs_open_purchase_modal", handler);
    return () => window.removeEventListener("hs_open_purchase_modal", handler);
  }, []);

  const updateItem = (id: string, updates: Partial<PurchaseItemDraft>) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: `item-${prev.length + 1}`,
        productId: "",
        quantity: "",
        unitCost: "",
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const itemsPayload = items
    .filter((item) => item.productId && Number(item.quantity) > 0)
    .map((item) => ({
      product_id: item.productId,
      quantity_ordered: Number(item.quantity),
      unit_cost: item.unitCost ? Number(item.unitCost) : null,
    }));

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    onOpenChange(nextOpen);
  };

  const canSubmit = itemsPayload.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nueva compra</DialogTitle>
        </DialogHeader>

        <form
          action={onSubmit}
          className="space-y-4"
          onSubmit={() => handleOpenChange(false)}
        >
          <input
            type="hidden"
            name="items"
            value={JSON.stringify(itemsPayload)}
          />

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={item.id} className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{`Item ${index + 1}`}</p>
                  {items.length > 1 ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                    >
                      Quitar
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <select
                    className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                    value={item.productId}
                    onChange={(event) =>
                      updateItem(item.id, { productId: event.target.value })
                    }
                    required
                  >
                    <option value="" disabled>
                      Seleccioná un producto
                    </option>
                    {productOptions.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Cantidad</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(item.id, { quantity: event.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Unit cost (opcional)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitCost}
                      onChange={(event) =>
                        updateItem(item.id, { unitCost: event.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="w-full"
          >
            Agregar item
          </Button>

          <Button type="submit" className="w-full" disabled={!canSubmit}>
            Crear compra
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
