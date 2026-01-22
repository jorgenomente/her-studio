import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchUnpaidAppointments({
  branchId,
}: {
  branchId: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("v_app_pos_unpaid_appointments")
    .select(
      "appointment_id,branch_id,start_at,end_at,status,staff_id,staff_name,service_id,service_name,client_id,client_name,client_phone",
    )
    .eq("branch_id", branchId)
    .order("start_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchPaymentsDay({ branchId }: { branchId: string }) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("v_app_pos_payments_day")
    .select(
      "payment_id,branch_id,appointment_id,client_id,amount,method,paid_at",
    )
    .eq("branch_id", branchId)
    .order("paid_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
