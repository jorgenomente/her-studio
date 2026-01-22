"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { StockCard } from "@/components/app/stock/stock-card";
import { StockMovementModal } from "@/components/app/stock/stock-movement-modal";

type StockItem = {
  product_id: string;
  product_name: string;
  unit: string;
  qty_on_hand: number;
  stock_min: number;
  is_low_stock: boolean;
};

type StockClientProps = {
  items: StockItem[];
  canManageStock: boolean;
  onCreateMovement: (formData: FormData) => Promise<void>;
};

export function StockClient({
  items,
  canManageStock,
  onCreateMovement,
}: StockClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");

  const productOptions = useMemo(
    () =>
      items.map((item) => ({ id: item.product_id, name: item.product_name })),
    [items],
  );

  const openModal = (productId?: string) => {
    setSelectedProductId(productId ?? "");
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {canManageStock ? (
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Snapshot</h2>
          <Button onClick={() => openModal()}>Movimiento</Button>
        </div>
      ) : null}

      {items.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
          No hay insumos cargados aún.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <StockCard
              key={item.product_id}
              productId={item.product_id}
              productName={item.product_name}
              unit={item.unit}
              qtyOnHand={item.qty_on_hand}
              stockMin={item.stock_min}
              isLowStock={item.is_low_stock}
              onSelect={openModal}
              canManageStock={canManageStock}
            />
          ))}
        </div>
      )}

      <StockMovementModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        products={productOptions}
        productId={selectedProductId}
        onProductChange={setSelectedProductId}
        onSubmit={onCreateMovement}
      />
    </div>
  );
}
