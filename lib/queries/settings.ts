import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchStaffList({ branchId }: { branchId: string }) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { data, error } = await supabase
    .from("v_app_staff_list")
    .select("staff_id,branch_id,full_name,email,phone,status")
    .eq("branch_id", branchId)
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchStaffAvailability({
  branchId,
}: {
  branchId: string;
}) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { data, error } = await supabase
    .from("v_app_staff_availability")
    .select("staff_id,weekday,start_time,end_time,is_active")
    .eq("branch_id", branchId);

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchBranchServices({ branchId }: { branchId: string }) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { data, error } = await supabase
    .from("v_app_branch_services")
    .select(
      "branch_id,service_id,service_name,duration_min,price_base,is_active,is_enabled,is_available",
    )
    .eq("branch_id", branchId)
    .order("service_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchUsersList({ branchIds }: { branchIds: string[] }) {
  const supabase = (await createSupabaseServerClient()) as any;
  const { data, error } = await supabase
    .from("v_app_users_list")
    .select(
      "user_id,branch_id,branch_name,full_name,email,role,can_manage_agenda,can_manage_payments,can_manage_stock,is_active",
    )
    .in("branch_id", branchIds)
    .order("email", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function fetchBranches() {
  const supabase = (await createSupabaseServerClient()) as any;
  const { data, error } = await supabase
    .from("branch")
    .select("id,name,status")
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}
