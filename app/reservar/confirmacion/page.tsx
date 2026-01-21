import Link from "next/link";
import { redirect } from "next/navigation";

import { BookingProgress } from "@/components/public/booking-progress";
import { DepositUpload } from "@/components/public/deposit-upload";
import { PublicReservationForm } from "@/components/public/public-reservation-form";
import { Button } from "@/components/ui/button";
import { fetchPublicBranchServices, fetchPublicBranches, fetchPublicStaff } from "@/lib/queries/public";

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: {
    branch_id?: string;
    service_id?: string;
    start_at?: string;
    staff_id?: string;
    staff_strategy?: string;
    success?: string;
    appointment_id?: string;
    error?: string;
  };
}) {
  const branchId = searchParams.branch_id;
  const serviceId = searchParams.service_id;
  const startAt = searchParams.start_at;
  const staffStrategy = searchParams.staff_strategy ?? "any";

  if (!branchId || !serviceId || !startAt) {
    redirect("/reservar");
  }

  let branchName = "";
  let serviceName = "";
  let staffName = "";
  let error: string | null = null;

  try {
    const [branches, services, staffList] = await Promise.all([
      fetchPublicBranches(),
      fetchPublicBranchServices({ branchId }),
      fetchPublicStaff({ branchId }),
    ]);

    branchName = branches.find((branch) => branch.branch_id === branchId)?.name ?? "";
    serviceName =
      services.find((service) => service.service_id === serviceId)?.service_name ?? "";
    if (staffStrategy === "explicit" && searchParams.staff_id) {
      staffName =
        staffList.find((staff) => staff.staff_id === searchParams.staff_id)
          ?.staff_name ?? "";
    }
  } catch (err) {
    error = err instanceof Error ? err.message : "No pudimos cargar el resumen.";
  }

  const formattedDate = new Date(startAt).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const formattedTime = new Date(startAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section className="space-y-6">
      <BookingProgress current={4} />
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">Confirmá tu reserva</h2>
        <p className="text-sm text-muted-foreground">
          Revisá los detalles antes de enviar tu solicitud.
        </p>
      </div>

      {searchParams.error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {searchParams.error}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="rounded-3xl border bg-white p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sucursal</span>
          <span className="font-medium">{branchName || "-"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Servicio</span>
          <span className="font-medium">{serviceName || "-"}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Fecha</span>
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Horario</span>
          <span className="font-medium">{formattedTime}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Profesional</span>
          <span className="font-medium">
            {staffStrategy === "explicit" && staffName
              ? staffName
              : "Cualquiera disponible"}
          </span>
        </div>
      </div>

      {searchParams.success ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-800 space-y-3">
          <p>Reserva confirmada. Te enviaremos la confirmación final por WhatsApp.</p>
          {searchParams.appointment_id ? (
            <p className="text-xs text-emerald-700">
              Código de reserva: {searchParams.appointment_id}
            </p>
          ) : null}
          {searchParams.appointment_id ? (
            <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 text-emerald-800">
              <h3 className="text-sm font-semibold">¿Querés dejar seña?</h3>
              <p className="text-xs text-emerald-700">
                Subí el comprobante y registraremos la seña como pendiente.
              </p>
              <div className="mt-4">
                <DepositUpload appointmentId={searchParams.appointment_id} />
              </div>
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary">
              <Link href="/reservar">Nueva reserva</Link>
            </Button>
            <Button variant="outline" disabled>
              Agregar al calendario (próximamente)
            </Button>
            <Button asChild>
              <Link href="/">Volver al inicio</Link>
            </Button>
          </div>
        </div>
      ) : (
        <PublicReservationForm
          branchId={branchId}
          serviceId={serviceId}
          startAt={startAt}
          staffStrategy={staffStrategy}
          staffId={searchParams.staff_id}
        />
      )}
    </section>
  );
}
