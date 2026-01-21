import { createSupabaseServerClient } from "@/lib/supabase/server";

type AgendaFilters = {
  branchId: string;
  date: string;
  staffId?: string | null;
  status?: string | null;
};

export async function fetchAgendaDay({
  branchId,
  date,
  staffId,
  status,
}: AgendaFilters) {
  const supabase = (await createSupabaseServerClient()) as any;

  // TODO: Use branch timezone when available. For now, filter by UTC date.
  const startAt = new Date(`${date}T00:00:00.000Z`);
  const endAt = new Date(`${date}T23:59:59.999Z`);

  let query = supabase
    .from("v_app_agenda_day")
    .select(
      "appointment_id,branch_id,start_at,end_at,status,staff_id,staff_name,service_id,service_name,client_id,client_name,client_phone,has_deposit,has_payment",
    )
    .eq("branch_id", branchId)
    .gte("start_at", startAt.toISOString())
    .lte("start_at", endAt.toISOString())
    .order("start_at", { ascending: true });

  if (staffId) {
    query = query.eq("staff_id", staffId);
  }

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
