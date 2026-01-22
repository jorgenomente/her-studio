import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchDashboardDay({ branchId }: { branchId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_app_dashboard_day")
    .select(
      "branch_id,total_income_day,count_appointments_day,count_no_show_day,count_cancelled_day,count_completed_day,unpaid_count,low_stock_count",
    )
    .eq("branch_id", branchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function fetchDashboardGlobalDay() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_app_dashboard_global_day")
    .select(
      "branch_id,total_income_day,count_appointments_day,count_no_show_day,count_cancelled_day,count_completed_day,unpaid_count,low_stock_count",
    )
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
