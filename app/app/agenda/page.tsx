import { format } from "date-fns";
import { cookies } from "next/headers";

import { AgendaFilters } from "@/components/app/agenda/agenda-filters";
import { AgendaHeader } from "@/components/app/agenda/agenda-header";
import { AppointmentCard } from "@/components/app/agenda/appointment-card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { fetchAgendaDay } from "@/lib/queries/agenda";

type SearchParams = {
  date?: string;
  staff?: string;
  status?: string;
};

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = searchParams;
  const today = new Date();
  const dateValue = params.date ?? format(today, "yyyy-MM-dd");
  const staffId = params.staff ?? null;
  const status = params.status ?? null;

  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver la agenda.
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data: staffRows } = await supabase
    .from("staff")
    .select("id, full_name")
    .eq("branch_id", activeBranchId)
    .eq("status", "active")
    .order("full_name", { ascending: true });

  const typedStaffRows = (staffRows ?? []) as { id: string; full_name: string }[];

  let appointments: Awaited<ReturnType<typeof fetchAgendaDay>> = [];
  let error: string | null = null;

  try {
    appointments = await fetchAgendaDay({
      branchId: activeBranchId,
      date: dateValue,
      staffId,
      status,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando la agenda.";
  }

  const typedAppointments = appointments as {
    appointment_id: string;
    start_at: string;
    end_at: string;
    status: string;
    staff_name: string;
    service_name: string;
    client_name?: string | null;
    client_phone?: string | null;
    has_deposit: boolean;
    has_payment: boolean;
  }[];

  return (
    <div className="space-y-6">
      <AgendaHeader date={new Date(`${dateValue}T00:00:00`)} />

      <AgendaFilters
        staffOptions={typedStaffRows.map((staff) => ({
          id: staff.id,
          name: staff.full_name,
        }))}
        staffId={staffId}
        status={status}
      />

      {error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-6 text-sm">
          {error}
        </div>
      ) : null}

      {!error && appointments.length === 0 ? (
        <div className="bg-card text-muted-foreground space-y-3 rounded-xl border p-6 text-sm">
          <div>No hay citas para este día.</div>
          <Button variant="outline" disabled>
            Crear cita (próximamente)
          </Button>
        </div>
      ) : null}

      <div className="space-y-3">
        {typedAppointments.map((appointment) => (
          <AppointmentCard
            key={appointment.appointment_id}
            appointmentId={appointment.appointment_id}
            startAt={appointment.start_at}
            endAt={appointment.end_at}
            status={appointment.status}
            staffName={appointment.staff_name}
            serviceName={appointment.service_name}
            clientName={appointment.client_name}
            clientPhone={appointment.client_phone}
            hasDeposit={appointment.has_deposit}
            hasPayment={appointment.has_payment}
          />
        ))}
      </div>
    </div>
  );
}
