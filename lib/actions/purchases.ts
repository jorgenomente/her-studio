"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type PurchaseItemInput = {
  product_id: string;
  quantity_ordered: number;
  unit_cost?: number | null;
};

export async function createPurchaseAction(formData: FormData) {
  const branchId = (await cookies()).get("hs_branch_id")?.value ?? null;
  if (!branchId) {
    redirect("/app/compras?error=Selecciona_sucursal");
  }

  const itemsRaw = formData.get("items")?.toString();
  if (!itemsRaw) {
    redirect("/app/compras?error=Datos_incompletos");
  }

  let items: PurchaseItemInput[] = [];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    redirect("/app/compras?error=Items_invalidos");
  }

  if (items.length === 0) {
    redirect("/app/compras?error=Items_invalidos");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_create_purchase", {
    p_branch_id: branchId,
    p_items: items,
    p_notes: undefined,
  });

  if (error) {
    redirect(`/app/compras?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/app/compras?success=compra_creada");
}

type ReceiveItemInput = {
  product_id: string;
  quantity_received: number;
};

export async function receivePurchaseAction(formData: FormData) {
  const branchId = (await cookies()).get("hs_branch_id")?.value ?? null;
  const purchaseId = formData.get("purchase_id")?.toString();

  if (!branchId || !purchaseId) {
    redirect("/app/compras?error=Datos_incompletos");
  }

  const itemsRaw = formData.get("items")?.toString();
  if (!itemsRaw) {
    redirect(`/app/compras/${purchaseId}?error=Datos_incompletos`);
  }

  let items: ReceiveItemInput[] = [];
  try {
    items = JSON.parse(itemsRaw);
  } catch {
    redirect(`/app/compras/${purchaseId}?error=Items_invalidos`);
  }

  if (
    items.length === 0 ||
    items.every((item) => item.quantity_received <= 0)
  ) {
    redirect(`/app/compras/${purchaseId}?error=Debes_recibir_al_menos_un_item`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("rpc_receive_purchase", {
    p_branch_id: branchId,
    p_purchase_id: purchaseId,
    p_items: items,
  });

  if (error) {
    redirect(
      `/app/compras/${purchaseId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/app/compras/${purchaseId}?success=compra_recibida`);
}
