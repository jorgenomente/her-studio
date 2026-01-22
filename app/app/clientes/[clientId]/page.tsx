import { cookies } from "next/headers";
import { format } from "date-fns";

import { StatusBadge } from "@/components/app/appointment/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  fetchClientAppointments,
  fetchClientDetail,
  fetchClientPayments,
} from "@/lib/queries/client-detail";

type PageProps = {
  params: { clientId: string };
};

export default async function ClientDetailPage({ params }: PageProps) {
  const { clientId } = params;
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver el cliente.
      </div>
    );
  }

  let client = null;
  let appointments = [];
  let payments = [];
  let error: string | null = null;

  try {
    client = await fetchClientDetail({ clientId, branchId: activeBranchId });
    appointments = await fetchClientAppointments({
      clientId,
      branchId: activeBranchId,
    });
    payments = await fetchClientPayments({
      clientId,
      branchId: activeBranchId,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando el cliente.";
  }

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-6 text-sm">
        {error}
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Cliente no encontrado.
      </div>
    );
  }

  const isRecurrent = client.visits_count > 1;
  const lastVisitLabel = client.last_visit_at
    ? format(new Date(client.last_visit_at), "dd/MM/yyyy")
    : "—";

  const typedPayments = payments as {
    source?: string | null;
    referred_by?: string | null;
    appointment_id?: string | null;
    payment_id: string;
    amount: number;
    method: string;
    paid_at: string;
  }[];

  const typedAppointments = appointments as {
    appointment_id: string;
    start_at: string;
    service_name: string;
    staff_name: string;
    status: string;
  }[];

  const sourceCounts = typedPayments.reduce(
    (acc: Record<string, number>, payment) => {
      if (payment.source) {
        acc[payment.source] = (acc[payment.source] ?? 0) + 1;
      }
      return acc;
    },
    {},
  );

  const topSource =
    Object.entries(sourceCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const referredCounts = typedPayments.reduce(
    (acc: Record<string, number>, payment) => {
      if (payment.referred_by) {
        acc[payment.referred_by] = (acc[payment.referred_by] ?? 0) + 1;
      }
      return acc;
    },
    {},
  );

  const topReferredBy =
    Object.entries(referredCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-xl border p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">
              {client.full_name ?? "Sin nombre"}
            </h1>
            <p className="text-muted-foreground text-sm">{client.phone}</p>
            {client.email ? (
              <p className="text-muted-foreground text-sm">{client.email}</p>
            ) : null}
          </div>
          <Badge variant={isRecurrent ? "default" : "outline"}>
            {isRecurrent ? "Recurrente" : "Nuevo"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Visitas</p>
          <p className="text-lg font-semibold">{client.visits_count}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Gasto total</p>
          <p className="text-lg font-semibold">{`$${client.total_spent.toFixed(2)}`}</p>
        </div>
        <div className="bg-card rounded-xl border p-4">
          <p className="text-muted-foreground text-sm">Última visita</p>
          <p className="text-lg font-semibold">{lastVisitLabel}</p>
        </div>
      </div>

      <div className="bg-card space-y-3 rounded-xl border p-4">
        <h2 className="text-base font-semibold">Historial de citas</h2>
        {appointments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sin citas registradas.
          </p>
        ) : (
          <div className="space-y-3">
            {typedAppointments.map((appointment) => (
              <div
                key={appointment.appointment_id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(appointment.start_at), "dd/MM/yyyy HH:mm")}
                  </p>
                  <p className="text-sm font-medium">
                    {appointment.service_name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {appointment.staff_name}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card space-y-3 rounded-xl border p-4">
        <h2 className="text-base font-semibold">Pagos</h2>
        {payments.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Sin pagos registrados.
          </p>
        ) : (
          <div className="space-y-3">
            {typedPayments.map((payment) => (
              <div
                key={payment.payment_id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-muted-foreground text-sm">
                    {format(new Date(payment.paid_at), "dd/MM/yyyy HH:mm")}
                  </p>
                  <p className="text-sm font-medium">{`$${payment.amount}`}</p>
                  <p className="text-muted-foreground text-xs">
                    {payment.method}
                  </p>
                </div>
                <Badge variant="outline">
                  {payment.appointment_id ? "Cita" : "Walk-in"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card space-y-3 rounded-xl border p-4">
        <h2 className="text-base font-semibold">Marketing</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
            Fuente principal:{" "}
            <span className="text-foreground font-medium">{topSource}</span>
          </div>
          <div className="text-muted-foreground rounded-lg border border-dashed p-3 text-sm">
            Referido por:{" "}
            <span className="text-foreground font-medium">{topReferredBy}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
