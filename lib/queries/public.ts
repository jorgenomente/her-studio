import { createSupabaseServerClient } from "@/lib/supabase/server";

export type PublicBranch = {
  branch_id: string;
  name: string;
  address: string | null;
  timezone: string;
};

export type PublicService = {
  branch_id: string;
  service_id: string;
  service_name: string;
  duration_min: number;
  price_base: number;
  is_available: boolean;
};

export type PublicStaff = {
  staff_id: string;
  staff_name: string | null;
};

export async function fetchPublicBranches() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rpc_public_list_branches");
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as PublicBranch[];
}

export async function fetchPublicBranchServices({
  branchId,
}: {
  branchId: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rpc_public_list_branch_services", {
    p_branch_id: branchId,
  });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as PublicService[];
}

export async function fetchPublicStaff({ branchId }: { branchId: string }) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rpc_public_list_staff", {
    p_branch_id: branchId,
  });
  if (error) {
    throw new Error(error.message);
  }
  return (data ?? []) as PublicStaff[];
}
