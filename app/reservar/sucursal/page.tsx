import Link from "next/link";

import { BookingProgress } from "@/components/public/booking-progress";
import { Button } from "@/components/ui/button";
import { fetchPublicBranches } from "@/lib/queries/public";

export default async function BookingBranchPage() {
  let branches = [] as Awaited<ReturnType<typeof fetchPublicBranches>>;
  let error: string | null = null;

  try {
    branches = await fetchPublicBranches();
  } catch (err) {
    error = err instanceof Error ? err.message : "No pudimos cargar sucursales.";
  }

  return (
    <section className="space-y-6">
      <BookingProgress current={1} />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Seleccioná tu sucursal</h2>
        <p className="text-sm text-muted-foreground">
          Primero elegimos la ubicación para mostrar disponibilidad real.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!error && branches.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          No hay sucursales disponibles por el momento.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {branches.map((branch) => (
          <div
            key={branch.branch_id}
            className="rounded-3xl border bg-white p-5 shadow-sm"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{branch.name}</h3>
              <p className="text-sm text-muted-foreground">
                {branch.address || "Dirección a confirmar"}
              </p>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {branch.timezone}
              </p>
            </div>
            <Button asChild className="mt-4 w-full">
              <Link href={`/reservar/servicio?branch_id=${branch.branch_id}`}>
                Elegir esta sucursal
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
