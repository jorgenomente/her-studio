"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function createStockMovementAction(formData: FormData) {
  const branchId = cookies().get("hs_branch_id")?.value ?? null;
  if (!branchId) {
    redirect("/app/stock?error=Selecciona_sucursal");
  }

  const productId = formData.get("product_id")?.toString();
  const movementType = formData.get("movement_type")?.toString();
  const quantity = Number(formData.get("quantity"));
  const reason = formData.get("reason")?.toString() ?? null;

  if (!productId || !movementType || Number.isNaN(quantity) || quantity <= 0) {
    redirect("/app/stock?error=Datos_incompletos");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_create_stock_movement", {
    p_branch_id: branchId,
    p_product_id: productId,
    p_movement_type: movementType,
    p_quantity: quantity,
    p_reason: reason,
    p_appointment_id: null,
    p_purchase_id: null,
  });

  if (error) {
    redirect(`/app/stock?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/stock?success=movimiento_creado");
}
