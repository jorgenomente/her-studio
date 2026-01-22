import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchClientDetail({
  clientId,
  branchId,
}: {
  clientId: string;
  branchId: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("v_app_client_detail")
    .select("*")
    .eq("client_id", clientId)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchClientAppointments({
  clientId,
  branchId,
}: {
  clientId: string;
  branchId: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("v_app_client_appointments")
    .select(
      "appointment_id,branch_id,client_id,start_at,end_at,status,service_id,service_name,staff_id,staff_name",
    )
    .eq("client_id", clientId)
    .eq("branch_id", branchId)
    .order("start_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchClientPayments({
  clientId,
  branchId,
}: {
  clientId: string;
  branchId: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("v_app_client_payments")
    .select(
      "payment_id,branch_id,client_id,appointment_id,amount,method,paid_at,source,is_recurrent,referred_by",
    )
    .eq("client_id", clientId)
    .eq("branch_id", branchId)
    .order("paid_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
