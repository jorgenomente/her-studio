import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PosClient } from "@/components/app/pos/pos-client";
import { fetchPaymentsDay, fetchUnpaidAppointments } from "@/lib/queries/pos";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

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

type PaymentMethod = Database["public"]["Enums"]["payment_method"];
type PaymentSourceType = Database["public"]["Enums"]["payment_source_type"];

const allowedPaymentMethods: PaymentMethod[] = [
  "cash",
  "transfer",
  "card",
  "other",
];

const allowedPaymentSources: PaymentSourceType[] = [
  "recommendation",
  "instagram",
  "google_maps",
  "walk_in",
  "other",
];

export default async function PosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver POS.
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
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

  let unpaidAppointments: Awaited<ReturnType<typeof fetchUnpaidAppointments>> =
    [];
  let paymentsDay: Awaited<ReturnType<typeof fetchPaymentsDay>> = [];
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
    const referredBy = formData.get("referred_by")?.toString();
    const clientId = formData.get("client_id")?.toString();
    const isRecurrent = formData.get("is_recurrent") === "on";

    if (
      !activeBranchId ||
      !appointmentId ||
      Number.isNaN(amount) ||
      !method ||
      !source ||
      !allowedPaymentMethods.includes(method as PaymentMethod) ||
      !allowedPaymentSources.includes(source as PaymentSourceType)
    ) {
      redirect("/app/pos?error=Datos_incompletos");
    }

    const supabaseServer = await createSupabaseServerClient();
    const { error: payError } = await supabaseServer.rpc(
      "rpc_create_payment_for_appointment",
      {
        p_branch_id: activeBranchId,
        p_appointment_id: appointmentId,
        p_amount: amount,
        p_method: method as PaymentMethod,
        p_source: source as PaymentSourceType,
        p_is_recurrent: isRecurrent,
        p_client_id: clientId ?? undefined,
        p_referred_by: referredBy ?? undefined,
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
    const referredBy = formData.get("referred_by")?.toString();
    const isRecurrent = formData.get("is_recurrent") === "on";
    const clientPhone = formData.get("client_phone")?.toString();
    const clientFullName = formData.get("client_full_name")?.toString();
    const clientEmail = formData.get("client_email")?.toString();

    if (
      !activeBranchId ||
      Number.isNaN(amount) ||
      !method ||
      !source ||
      !allowedPaymentMethods.includes(method as PaymentMethod) ||
      !allowedPaymentSources.includes(source as PaymentSourceType)
    ) {
      redirect("/app/pos?error=Datos_incompletos");
    }

    const supabaseServer = await createSupabaseServerClient();
    const { error: walkinError } = await supabaseServer.rpc(
      "rpc_create_walkin_payment",
      {
        p_branch_id: activeBranchId,
        p_amount: amount,
        p_method: method as PaymentMethod,
        p_source: source as PaymentSourceType,
        p_is_recurrent: isRecurrent,
        p_client_phone: clientPhone ?? undefined,
        p_client_full_name: clientFullName ?? undefined,
        p_client_email: clientEmail ?? undefined,
        p_referred_by: referredBy ?? undefined,
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
        unpaidAppointments={(() => {
          const typedUnpaid = unpaidAppointments as {
            appointment_id: string | null;
            start_at: string | null;
            end_at: string | null;
            status: string | null;
            service_name: string | null;
            staff_name: string | null;
            client_name?: string | null;
            client_phone?: string | null;
            client_id?: string | null;
          }[];

          return typedUnpaid
            .filter(
              (appointment) =>
                appointment.appointment_id &&
                appointment.start_at &&
                appointment.end_at &&
                appointment.status &&
                appointment.service_name &&
                appointment.staff_name,
            )
            .map((appointment) => ({
              appointment_id: appointment.appointment_id as string,
              start_at: appointment.start_at as string,
              end_at: appointment.end_at as string,
              status: appointment.status as string,
              service_name: appointment.service_name as string,
              staff_name: appointment.staff_name as string,
              client_name: appointment.client_name ?? null,
              client_phone: appointment.client_phone ?? null,
              client_id: appointment.client_id ?? null,
            }));
        })()}
        paymentsDay={(() => {
          const typedPayments = paymentsDay as {
            payment_id: string | null;
            appointment_id?: string | null;
            amount: number | null;
            method: string | null;
            paid_at: string | null;
          }[];

          return typedPayments
            .filter((payment) => payment.payment_id && payment.paid_at)
            .map((payment) => ({
              payment_id: payment.payment_id as string,
              appointment_id: payment.appointment_id ?? null,
              amount: payment.amount ?? 0,
              method: payment.method ?? "other",
              paid_at: payment.paid_at as string,
            }));
        })()}
        canManagePayments={Boolean(canManagePayments)}
        onPayAppointment={payAppointment}
        onWalkInPayment={createWalkInPayment}
      />
    </div>
  );
}
