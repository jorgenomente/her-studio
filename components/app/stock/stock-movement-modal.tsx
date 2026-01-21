"use client";

import { useMemo, useState } from "react";

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

type StockMovementModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductOption[];
  productId: string;
  onProductChange: (productId: string) => void;
  onSubmit: (formData: FormData) => Promise<void>;
};

const MOVEMENT_TYPES = [
  { value: "in", label: "Entrada" },
  { value: "out", label: "Salida" },
  { value: "waste", label: "Desperdicio" },
  { value: "adjustment", label: "Ajuste" },
];

export function StockMovementModal({
  open,
  onOpenChange,
  products,
  productId,
  onProductChange,
  onSubmit,
}: StockMovementModalProps) {
  const [movementType, setMovementType] = useState("in");

  const productOptions = useMemo(() => products, [products]);

  useEffect(() => {
    if (open) {
      setProductId(initialProductId ?? "");
    }
  }, [open, initialProductId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
        </DialogHeader>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movement_product">Producto</Label>
            <select
              id="movement_product"
              name="product_id"
              className="bg-background h-10 w-full rounded-md border px-3 text-sm"
              value={productId}
              onChange={(event) => onProductChange(event.target.value)}
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

          <div className="space-y-2">
            <Label>Tipo</Label>
            <div className="grid grid-cols-2 gap-2">
              {MOVEMENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  className={`rounded-md border px-3 py-2 text-sm ${
                    movementType === type.value
                      ? "border-foreground text-foreground"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMovementType(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
            <input type="hidden" name="movement_type" value={movementType} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement_qty">Cantidad</Label>
            <Input
              id="movement_qty"
              name="quantity"
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="movement_reason">Motivo</Label>
            <Input
              id="movement_reason"
              name="reason"
              type="text"
              placeholder="Opcional"
            />
          </div>

          <Button type="submit" className="w-full">
            Confirmar movimiento
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
