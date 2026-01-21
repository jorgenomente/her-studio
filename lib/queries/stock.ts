import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchStockSnapshot({
  branchId,
  query,
}: {
  branchId: string;
  query?: string | null;
}) {
  const supabase = await createSupabaseServerClient();

  let request = supabase
    .from("v_app_stock_snapshot")
    .select(
      "branch_id,product_id,product_name,unit,stock_min,qty_on_hand,is_low_stock",
    )
    .eq("branch_id", branchId)
    .order("product_name", { ascending: true })
    .limit(100);

  if (query) {
    const escaped = query.replace(/%/g, "\\%").replace(/_/g, "\\_");
    request = request.ilike("product_name", `%${escaped}%`);
  }

  const { data, error } = await request;

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
