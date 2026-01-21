"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/supabase";

type UserRole = Database["public"]["Enums"]["user_role"];

const allowedAssignableRoles: UserRole[] = ["admin", "seller"];

export async function createStaffAction(formData: FormData) {
  const branchId = (await cookies()).get("hs_branch_id")?.value ?? null;
  const fullName = formData.get("full_name")?.toString();
  const email = formData.get("email")?.toString() ?? null;
  const phone = formData.get("phone")?.toString() ?? null;

  if (!branchId || !fullName) {
    redirect("/app/configuracion?error=Datos_incompletos");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_create_staff", {
    p_branch_id: branchId,
    p_full_name: fullName,
    p_email: email,
    p_phone: phone,
  });

  if (error) {
    redirect(`/app/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/configuracion?success=staff_creado");
}

export async function updateStaffAction(formData: FormData) {
  const branchId = (await cookies()).get("hs_branch_id")?.value ?? null;
  const staffId = formData.get("staff_id")?.toString();
  const fullName = formData.get("full_name")?.toString() ?? null;
  const email = formData.get("email")?.toString() ?? null;
  const phone = formData.get("phone")?.toString() ?? null;
  const status = formData.get("status")?.toString() ?? null;

  if (!branchId || !staffId) {
    redirect("/app/configuracion?error=Datos_incompletos");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_update_staff", {
    p_staff_id: staffId,
    p_branch_id: branchId,
    p_full_name: fullName,
    p_email: email,
    p_phone: phone,
    p_status: status,
  });

  if (error) {
    redirect(`/app/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/configuracion?success=staff_actualizado");
}

export async function setStaffAvailabilityAction(formData: FormData) {
  const branchId = (await cookies()).get("hs_branch_id")?.value ?? null;
  const staffId = formData.get("staff_id")?.toString();
  const availabilityRaw = formData.get("availability")?.toString();

  if (!branchId || !staffId || !availabilityRaw) {
    redirect("/app/configuracion?error=Datos_incompletos");
  }

  let availability: Json | null = null;
  try {
    availability = JSON.parse(availabilityRaw) as Json;
  } catch {
    redirect("/app/configuracion?error=Disponibilidad_invalida");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_set_staff_availability", {
    p_staff_id: staffId,
    p_branch_id: branchId,
    p_availability: availability,
  });

  if (error) {
    redirect(`/app/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/configuracion?success=disponibilidad_actualizada");
}

export async function setBranchServiceStateAction(formData: FormData) {
  const branchId = (await cookies()).get("hs_branch_id")?.value ?? null;
  const serviceId = formData.get("service_id")?.toString();
  const isEnabled = formData.get("is_enabled") === "on";
  const isAvailable = formData.get("is_available") === "on";

  if (!branchId || !serviceId) {
    redirect("/app/configuracion?error=Datos_incompletos");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_set_branch_service_state", {
    p_branch_id: branchId,
    p_service_id: serviceId,
    p_is_enabled: isEnabled,
    p_is_available: isAvailable,
  });

  if (error) {
    redirect(`/app/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/configuracion?success=servicio_actualizado");
}

export async function createInviteAction(formData: FormData) {
  const branchId = formData.get("branch_id")?.toString();
  const email = formData.get("email")?.toString();
  const fullName = formData.get("full_name")?.toString() ?? null;
  const role = formData.get("role")?.toString() ?? "seller";
  const canManageAgenda = formData.get("can_manage_agenda") === "on";
  const canManagePayments = formData.get("can_manage_payments") === "on";
  const canManageStock = formData.get("can_manage_stock") === "on";

  if (
    !branchId ||
    !email ||
    !allowedAssignableRoles.includes(role as UserRole)
  ) {
    redirect("/app/configuracion?error=Datos_incompletos");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("rpc_create_invite", {
    p_branch_id: branchId,
    p_email: email,
    p_full_name: fullName,
    p_role: role as UserRole,
    p_can_manage_agenda: canManageAgenda,
    p_can_manage_payments: canManagePayments,
    p_can_manage_stock: canManageStock,
  });

  if (error) {
    redirect(`/app/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  const invite = Array.isArray(data) ? data[0] : data;
  if (invite?.token) {
    redirect(`/app/configuracion?success=invite&token=${invite.token}`);
  }

  redirect("/app/configuracion?success=invite");
}

export async function updateUserBranchRoleAction(formData: FormData) {
  const userId = formData.get("user_id")?.toString();
  const branchId = formData.get("branch_id")?.toString();
  const role = formData.get("role")?.toString();
  const canManageAgenda = formData.get("can_manage_agenda") === "on";
  const canManagePayments = formData.get("can_manage_payments") === "on";
  const canManageStock = formData.get("can_manage_stock") === "on";
  const isActive = formData.get("is_active") === "on";

  if (!userId || !branchId || !role) {
    redirect("/app/configuracion?error=Datos_incompletos");
  }

  if (!allowedAssignableRoles.includes(role as UserRole)) {
    redirect("/app/configuracion?error=Rol_invalido");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_update_user_branch_role", {
    p_user_id: userId,
    p_branch_id: branchId,
    p_role: role as UserRole,
    p_can_manage_agenda: canManageAgenda,
    p_can_manage_payments: canManagePayments,
    p_can_manage_stock: canManageStock,
    p_is_active: isActive,
  });

  if (error) {
    redirect(`/app/configuracion?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/configuracion?success=usuario_actualizado");
}
