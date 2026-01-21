import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PosClient } from "@/components/app/pos/pos-client";
import { fetchPaymentsDay, fetchUnpaidAppointments } from "@/lib/queries/pos";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = {
  success?: string;
  error?: string;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  can_manage_payments: boolean;
  is_active: boolean;
};

export default async function PosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver POS.
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: branchRolesRaw } = await supabase
    .from("user_branch_role")
    .select("branch_id, role, can_manage_payments, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const branchRoles = (branchRolesRaw ?? []) as BranchRole[];
  const isSuperadmin = branchRoles.some((role) => role.role === "superadmin");
  const activeRole = branchRoles.find(
    (role) => role.branch_id === activeBranchId,
  );
  const canManagePayments =
    isSuperadmin ||
    activeRole?.role === "admin" ||
    activeRole?.can_manage_payments;

  let unpaidAppointments = [];
  let paymentsDay = [];
  let error: string | null = null;

  if (canManagePayments) {
    try {
      unpaidAppointments = await fetchUnpaidAppointments({
        branchId: activeBranchId,
      });
      paymentsDay = await fetchPaymentsDay({ branchId: activeBranchId });
    } catch (err) {
      error = err instanceof Error ? err.message : "Error cargando POS.";
    }
  }

  async function payAppointment(formData: FormData) {
    "use server";
    const appointmentId = formData.get("appointment_id")?.toString();
    const amount = Number(formData.get("amount"));
    const method = formData.get("method")?.toString();
    const source = formData.get("source")?.toString();
    const referredBy = formData.get("referred_by")?.toString() ?? null;
    const clientId = formData.get("client_id")?.toString() ?? null;
    const isRecurrent = formData.get("is_recurrent") === "on";

    if (!appointmentId || Number.isNaN(amount) || !method || !source) {
      redirect("/app/pos?error=Datos_incompletos");
    }

    const supabaseServer = createSupabaseServerClient();
    const { error: payError } = await supabaseServer.rpc(
      "rpc_create_payment_for_appointment",
      {
        p_branch_id: activeBranchId,
        p_appointment_id: appointmentId,
        p_amount: amount,
        p_method: method,
        p_source: source,
        p_is_recurrent: isRecurrent,
        p_client_id: clientId || null,
        p_referred_by: referredBy,
      },
    );

    if (payError) {
      redirect(`/app/pos?error=${encodeURIComponent(payError.message)}`);
    }

    redirect("/app/pos?success=cobro_registrado");
  }

  async function createWalkInPayment(formData: FormData) {
    "use server";
    const amount = Number(formData.get("amount"));
    const method = formData.get("method")?.toString();
    const source = formData.get("source")?.toString();
    const referredBy = formData.get("referred_by")?.toString() ?? null;
    const isRecurrent = formData.get("is_recurrent") === "on";
    const clientPhone = formData.get("client_phone")?.toString() ?? null;
    const clientFullName = formData.get("client_full_name")?.toString() ?? null;
    const clientEmail = formData.get("client_email")?.toString() ?? null;

    if (Number.isNaN(amount) || !method || !source) {
      redirect("/app/pos?error=Datos_incompletos");
    }

    const supabaseServer = createSupabaseServerClient();
    const { error: walkinError } = await supabaseServer.rpc(
      "rpc_create_walkin_payment",
      {
        p_branch_id: activeBranchId,
        p_amount: amount,
        p_method: method,
        p_source: source,
        p_is_recurrent: isRecurrent,
        p_client_phone: clientPhone,
        p_client_full_name: clientFullName,
        p_client_email: clientEmail,
        p_referred_by: referredBy,
      },
    );

    if (walkinError) {
      redirect(`/app/pos?error=${encodeURIComponent(walkinError.message)}`);
    }

    redirect("/app/pos?success=venta_registrada");
  }

  return (
    <div className="space-y-6">
      {searchParams?.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Operación registrada correctamente.
        </div>
      ) : null}
      {searchParams?.error || error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm">
          {searchParams?.error ?? error}
        </div>
      ) : null}
      <PosClient
        unpaidAppointments={unpaidAppointments}
        paymentsDay={paymentsDay}
        canManagePayments={Boolean(canManagePayments)}
        onPayAppointment={payAppointment}
        onWalkInPayment={createWalkInPayment}
      />
    </div>
  );
}
