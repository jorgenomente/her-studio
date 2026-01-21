"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type StockMovementType = Database["public"]["Enums"]["stock_movement_type"];

const allowedMovementTypes: StockMovementType[] = [
  "in",
  "out",
  "waste",
  "adjustment",
];

export async function createStockMovementAction(formData: FormData) {
  const branchId = (await cookies()).get("hs_branch_id")?.value ?? null;
  if (!branchId) {
    redirect("/app/stock?error=Selecciona_sucursal");
  }

  const productId = formData.get("product_id")?.toString();
  const movementType = formData.get("movement_type")?.toString();
  const quantity = Number(formData.get("quantity"));
  const reason = formData.get("reason")?.toString();

  if (
    !productId ||
    !movementType ||
    Number.isNaN(quantity) ||
    quantity <= 0 ||
    !allowedMovementTypes.includes(movementType as StockMovementType)
  ) {
    redirect("/app/stock?error=Datos_incompletos");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_create_stock_movement", {
    p_branch_id: branchId,
    p_product_id: productId,
    p_movement_type: movementType as StockMovementType,
    p_quantity: quantity,
    p_reason: reason ?? undefined,
    p_appointment_id: undefined,
    p_purchase_id: undefined,
  });

  if (error) {
    redirect(`/app/stock?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/stock?success=movimiento_creado");
}
