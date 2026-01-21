import Link from "next/link";
import { redirect } from "next/navigation";

import { BookingProgress } from "@/components/public/booking-progress";
import { Button } from "@/components/ui/button";
import { fetchPublicBranchServices, fetchPublicBranches } from "@/lib/queries/public";

export default async function BookingServicePage({
  searchParams,
}: {
  searchParams: { branch_id?: string };
}) {
  const branchId = searchParams.branch_id;
  if (!branchId) {
    redirect("/reservar/sucursal");
  }

  let services = [] as Awaited<ReturnType<typeof fetchPublicBranchServices>>;
  let branchName = "";
  let error: string | null = null;

  try {
    const [branches, branchServices] = await Promise.all([
      fetchPublicBranches(),
      fetchPublicBranchServices({ branchId }),
    ]);
    branchName = branches.find((branch) => branch.branch_id === branchId)?.name ?? "";
    services = branchServices;
  } catch (err) {
    error = err instanceof Error ? err.message : "No pudimos cargar servicios.";
  }

  return (
    <section className="space-y-6">
      <BookingProgress current={2} />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Elegí tu servicio</h2>
        <p className="text-sm text-muted-foreground">
          {branchName ? `Sucursal ${branchName}` : "Servicios disponibles"}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!error && services.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-sm text-muted-foreground">
          No hay servicios disponibles en esta sucursal.
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.service_id}
            className="rounded-3xl border bg-white p-5 shadow-sm"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">{service.service_name}</h3>
              <p className="text-sm text-muted-foreground">
                {service.duration_min} min · ${service.price_base}
              </p>
            </div>
            <Button asChild className="mt-4 w-full">
              <Link
                href={`/reservar/fecha?branch_id=${branchId}&service_id=${service.service_id}`}
              >
                Seleccionar horario
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}
