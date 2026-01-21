import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppointmentActions } from "@/components/app/appointment/appointment-actions";
import { AppointmentClientCard } from "@/components/app/appointment/appointment-client-card";
import { AppointmentDepositCard } from "@/components/app/appointment/appointment-deposit-card";
import { AppointmentHeader } from "@/components/app/appointment/appointment-header";
import { AppointmentPaymentCard } from "@/components/app/appointment/appointment-payment-card";
import { AppointmentServiceCard } from "@/components/app/appointment/appointment-service-card";
import { fetchAppointmentDetail } from "@/lib/queries/appointment";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type PageProps = {
  params: { appointmentId: string };
  searchParams?: { success?: string };
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  can_manage_agenda: boolean;
  can_manage_payments: boolean;
  is_active: boolean;
};

type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];
type DepositStatus = Database["public"]["Enums"]["deposit_status"];

const allowedAppointmentStatuses: AppointmentStatus[] = [
  "scheduled",
  "scheduled_deposit_pending",
  "scheduled_deposit_verified",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
];

const allowedDepositStatuses: DepositStatus[] = [
  "pending",
  "verified",
  "rejected",
];

export default async function AppointmentDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { appointmentId } = params;
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver la cita.
      </div>
    );
  }

  const supabase = (await createSupabaseServerClient()) as any;
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: branchRolesRaw } = await supabase
    .from("user_branch_role")
    .select(
      "branch_id, role, can_manage_agenda, can_manage_payments, is_active",
    )
    .eq("user_id", user.id)
    .eq("is_active", true);

  const branchRoles = (branchRolesRaw ?? []) as BranchRole[];
  const isSuperadmin = branchRoles.some((role) => role.role === "superadmin");
  const activeRole = branchRoles.find(
    (role) => role.branch_id === activeBranchId,
  );
  const canManageAgenda =
    isSuperadmin ||
    activeRole?.role === "admin" ||
    activeRole?.can_manage_agenda;
  const canManagePayments =
    isSuperadmin ||
    activeRole?.role === "admin" ||
    activeRole?.can_manage_payments;

  let appointment = null;
  let error: string | null = null;

  try {
    appointment = await fetchAppointmentDetail({
      appointmentId,
      branchId: activeBranchId,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando la cita.";
  }

  async function updateStatus(formData: FormData) {
    "use server";
    const appointmentIdValue = formData.get("appointment_id")?.toString();
    const branchIdValue = formData.get("branch_id")?.toString();
    const statusValue = formData.get("status")?.toString();

    if (
      !appointmentIdValue ||
      !branchIdValue ||
      !statusValue ||
      !allowedAppointmentStatuses.includes(statusValue as AppointmentStatus)
    ) {
      return;
    }

    const supabaseServer = await createSupabaseServerClient();
    await supabaseServer.rpc("rpc_update_appointment_status", {
      p_appointment_id: appointmentIdValue,
      p_branch_id: branchIdValue,
      p_new_status: statusValue as AppointmentStatus,
    });
    redirect(`/app/agenda/${appointmentIdValue}?success=estado_actualizado`);
  }

  async function createOrUpdateDeposit(formData: FormData) {
    "use server";
    const appointmentIdValue = formData.get("appointment_id")?.toString();
    const branchIdValue = formData.get("branch_id")?.toString();
    const amountValue = Number(formData.get("amount"));
    const proofUrlValue = formData.get("proof_url")?.toString();

    if (!appointmentIdValue || !branchIdValue || Number.isNaN(amountValue)) {
      return;
    }

    const supabaseServer = await createSupabaseServerClient();
    await supabaseServer.rpc("rpc_create_or_update_deposit", {
      p_appointment_id: appointmentIdValue,
      p_branch_id: branchIdValue,
      p_amount: amountValue,
      p_proof_url: proofUrlValue ?? undefined,
    });
    redirect(`/app/agenda/${appointmentIdValue}?success=senia_guardada`);
  }

  async function verifyDeposit(formData: FormData) {
    "use server";
    const depositIdValue = formData.get("deposit_id")?.toString();
    const branchIdValue = formData.get("branch_id")?.toString();
    const statusValue = formData.get("status")?.toString();

    if (
      !depositIdValue ||
      !branchIdValue ||
      !statusValue ||
      !allowedDepositStatuses.includes(statusValue as DepositStatus)
    ) {
      return;
    }

    const supabaseServer = await createSupabaseServerClient();
    await supabaseServer.rpc("rpc_verify_deposit", {
      p_deposit_id: depositIdValue,
      p_branch_id: branchIdValue,
      p_status: statusValue as DepositStatus,
    });
    const appointmentIdValue = formData.get("appointment_id")?.toString();
    if (appointmentIdValue) {
      redirect(
        `/app/agenda/${appointmentIdValue}?success=senia_${statusValue}`,
      );
    }
  }

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-6 text-sm">
        {error}
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Cita no encontrada.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {searchParams?.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Cambios guardados correctamente.
        </div>
      ) : null}
      <AppointmentHeader
        startAt={appointment.start_at}
        endAt={appointment.end_at}
        status={appointment.status}
      />

      <AppointmentActions
        appointmentId={appointment.appointment_id}
        branchId={appointment.branch_id}
        status={appointment.status}
        canManageAgenda={Boolean(canManageAgenda)}
        onUpdateStatus={updateStatus}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <AppointmentServiceCard
          serviceName={appointment.service_name}
          durationMin={appointment.appointment_duration_min}
          staffName={appointment.staff_name}
        />
        <AppointmentClientCard
          name={appointment.client_name}
          phone={appointment.client_phone}
          email={appointment.client_email}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <AppointmentDepositCard
          appointmentId={appointment.appointment_id}
          branchId={appointment.branch_id}
          hasPaymentPermission={Boolean(canManagePayments)}
          depositId={appointment.deposit_id}
          amount={appointment.deposit_amount}
          status={appointment.deposit_status}
          proofUrl={appointment.deposit_proof_url}
          onCreateOrUpdate={createOrUpdateDeposit}
          onVerify={verifyDeposit}
        />
        <AppointmentPaymentCard
          amount={appointment.payment_amount}
          method={appointment.payment_method}
        />
      </div>
    </div>
  );
}
