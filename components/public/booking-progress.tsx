import { cn } from "@/lib/utils";

const steps = ["Sucursal", "Servicio", "Fecha", "Confirmación"];

export function BookingProgress({ current }: { current: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>Paso {current} de {steps.length}</span>
        <span>{steps[current - 1]}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {steps.map((step, index) => {
          const isActive = index + 1 <= current;
          return (
            <div key={step} className="space-y-2">
              <div
                className={cn(
                  "h-1.5 w-full rounded-full bg-border",
                  isActive && "bg-foreground",
                )}
              />
              <p
                className={cn(
                  "text-[11px] font-medium text-muted-foreground",
                  isActive && "text-foreground",
                )}
              >
                {step}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
