import { Badge } from "@/components/ui/badge";

type StockCardProps = {
  productId: string;
  productName: string;
  unit: string;
  qtyOnHand: number;
  stockMin: number;
  isLowStock: boolean;
  onSelect: (productId: string) => void;
  canManageStock: boolean;
};

export function StockCard({
  productId,
  productName,
  unit,
  qtyOnHand,
  stockMin,
  isLowStock,
  onSelect,
  canManageStock,
}: StockCardProps) {
  return (
    <div
      className={`bg-card rounded-xl border p-4 ${isLowStock ? "border-amber-300" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{productName}</h3>
          <p className="text-muted-foreground text-sm">{unit}</p>
        </div>
        {isLowStock ? <Badge variant="outline">Bajo</Badge> : null}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs">Disponible</p>
          <p className="text-xl font-semibold">{qtyOnHand}</p>
        </div>
        <div className="text-muted-foreground text-right text-xs">{`Min: ${stockMin}`}</div>
      </div>
      {canManageStock ? (
        <button
          type="button"
          className="text-foreground hover:border-foreground/20 mt-4 w-full rounded-md border px-3 py-2 text-sm transition"
          onClick={() => onSelect(productId)}
        >
          Movimiento
        </button>
      ) : null}
    </div>
  );
}
