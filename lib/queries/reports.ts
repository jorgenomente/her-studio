import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DateRange = {
  from: string;
  to: string;
};

export async function fetchIncomeByMethod({
  branchId,
  range,
}: {
  branchId: string;
  range: DateRange;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_app_reports_income_by_method" as unknown as "v_app_dashboard_day")
    .select("branch_id,paid_date,method,total_amount,count")
    .eq("branch_id", branchId)
    .gte("paid_date", range.from)
    .lte("paid_date", range.to);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchIncomeBySource({
  branchId,
  range,
}: {
  branchId: string;
  range: DateRange;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_app_reports_income_by_source" as unknown as "v_app_dashboard_day")
    .select("branch_id,paid_date,source,total_amount,count")
    .eq("branch_id", branchId)
    .gte("paid_date", range.from)
    .lte("paid_date", range.to);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchIncomeRecurrentSplit({
  branchId,
  range,
}: {
  branchId: string;
  range: DateRange;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from(
      "v_app_reports_income_recurrent_split" as unknown as "v_app_dashboard_day",
    )
    .select("branch_id,paid_date,is_recurrent,total_amount,count")
    .eq("branch_id", branchId)
    .gte("paid_date", range.from)
    .lte("paid_date", range.to);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchTopServices({
  branchId,
  range,
}: {
  branchId: string;
  range: DateRange;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("v_app_reports_top_services" as unknown as "v_app_dashboard_day")
    .select("branch_id,paid_date,service_id,service_name,total_amount,count")
    .eq("branch_id", branchId)
    .gte("paid_date", range.from)
    .lte("paid_date", range.to);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
