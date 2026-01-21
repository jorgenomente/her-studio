import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function fetchAppointmentDetail({
  appointmentId,
  branchId,
}: {
  appointmentId: string;
  branchId: string;
}) {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("v_app_appointment_detail")
    .select("*")
    .eq("appointment_id", appointmentId)
    .eq("branch_id", branchId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
