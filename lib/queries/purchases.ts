import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchPurchasesList({ branchId }: { branchId: string }) {
  const supabase = (await createSupabaseServerClient()) as any;

  const { data, error } = await supabase
    .from("v_app_purchases_list")
    .select(
      "purchase_id,branch_id,status,ordered_at,received_at,items_count,ordered_total_qty",
    )
    .eq("branch_id", branchId)
    .order("ordered_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchPurchaseDetail({
  branchId,
  purchaseId,
}: {
  branchId: string;
  purchaseId: string;
}) {
  const supabase = (await createSupabaseServerClient()) as any;

  const { data, error } = await supabase
    .from("v_app_purchase_detail")
    .select(
      "purchase_id,branch_id,status,ordered_at,received_at,notes,purchase_item_id,product_id,product_name,quantity_ordered,quantity_received,unit_cost",
    )
    .eq("branch_id", branchId)
    .eq("purchase_id", purchaseId)
    .order("product_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
