"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createPublicReservationAction(formData: FormData) {
  const branchId = formData.get("branch_id")?.toString();
  const serviceId = formData.get("service_id")?.toString();
  const startAt = formData.get("start_at")?.toString();
  const staffStrategy = formData.get("staff_strategy")?.toString() ?? "any";
  const staffId = formData.get("staff_id")?.toString();
  const fullName = formData.get("full_name")?.toString();
  const phone = formData.get("phone")?.toString();
  const email = formData.get("email")?.toString();
  const notes = formData.get("notes")?.toString();

  if (!branchId || !serviceId || !startAt || !fullName || !phone) {
    redirect(
      `/reservar/confirmacion?branch_id=${branchId ?? ""}&service_id=${
        serviceId ?? ""
      }&start_at=${encodeURIComponent(startAt ?? "")}&staff_strategy=${
        staffStrategy ?? "any"
      }&staff_id=${staffId ?? ""}&error=Datos_incompletos`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rpc_public_create_reservation", {
    p_branch_id: branchId,
    p_service_id: serviceId,
    p_start_at: startAt,
    p_full_name: fullName,
    p_phone: phone,
    p_email: email || undefined,
    p_notes: notes || undefined,
    p_staff_id: staffStrategy === "explicit" ? staffId || undefined : undefined,
    p_staff_strategy: staffStrategy,
  });

  if (error) {
    redirect(
      `/reservar/confirmacion?branch_id=${branchId}&service_id=${serviceId}&start_at=${encodeURIComponent(
        startAt,
      )}&staff_strategy=${staffStrategy}&staff_id=${staffId ?? ""}&error=${encodeURIComponent(
        error.message,
      )}`,
    );
  }

  redirect(
    `/reservar/confirmacion?branch_id=${branchId}&service_id=${serviceId}&start_at=${encodeURIComponent(
      startAt,
    )}&staff_strategy=${staffStrategy}&staff_id=${staffId ?? ""}&success=1&appointment_id=${data}`,
  );
}
