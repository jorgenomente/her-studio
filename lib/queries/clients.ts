import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchClientsList({
  branchId,
  query,
}: {
  branchId: string;
  query?: string | null;
}) {
  const supabase = await createSupabaseServerClient();

  let request = supabase
    .from("v_app_clients_list")
    .select(
      "client_id,branch_id,full_name,phone,email,last_visit_at,visits_count,total_spent",
    )
    .eq("branch_id", branchId)
    .order("last_visit_at", { ascending: false, nullsFirst: false })
    .limit(50);

  if (query) {
    const escaped = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
    request = request.or(
      `full_name.ilike.%${escaped}%,phone.ilike.%${escaped}%`,
    );
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
