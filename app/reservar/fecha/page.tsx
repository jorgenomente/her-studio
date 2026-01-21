import { redirect } from "next/navigation";

import { BookingProgress } from "@/components/public/booking-progress";
import { BookingDateSelector } from "@/components/public/booking-date-selector";
import { fetchPublicBranchServices, fetchPublicBranches, fetchPublicStaff } from "@/lib/queries/public";

export default async function BookingDatePage({
  searchParams,
}: {
  searchParams: { branch_id?: string; service_id?: string };
}) {
  const branchId = searchParams.branch_id;
  const serviceId = searchParams.service_id;

  if (!branchId) {
    redirect("/reservar/sucursal");
  }

  if (!serviceId) {
    redirect(`/reservar/servicio?branch_id=${branchId}`);
  }

  let branchName = "";
  let serviceName = "";
  let error: string | null = null;
  let staff = [] as Awaited<ReturnType<typeof fetchPublicStaff>>;

  try {
    const [branches, services, staffList] = await Promise.all([
      fetchPublicBranches(),
      fetchPublicBranchServices({ branchId }),
      fetchPublicStaff({ branchId }),
    ]);

    branchName = branches.find((branch) => branch.branch_id === branchId)?.name ?? "";
    serviceName =
      services.find((service) => service.service_id === serviceId)?.service_name ?? "";
    staff = staffList;
  } catch (err) {
    error = err instanceof Error ? err.message : "No pudimos cargar disponibilidad.";
  }

  return (
    <section className="space-y-6">
      <BookingProgress current={3} />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Elegí fecha y horario</h2>
        <p className="text-sm text-muted-foreground">
          {branchName && serviceName
            ? `${branchName} · ${serviceName}`
            : "Confirmá tu disponibilidad"}
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!error ? (
        <BookingDateSelector
          branchId={branchId}
          serviceId={serviceId}
          staff={staff}
        />
      ) : null}
    </section>
  );
}
