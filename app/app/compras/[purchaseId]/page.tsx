import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { PurchaseDetailClient } from "@/components/app/purchases/purchase-detail-client";
import { fetchPurchaseDetail } from "@/lib/queries/purchases";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { receivePurchaseAction } from "@/lib/actions/purchases";

type PageProps = {
  params: { purchaseId: string };
  searchParams?: { success?: string; error?: string };
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  can_manage_stock: boolean;
  is_active: boolean;
};

export default async function PurchaseDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { purchaseId } = params;
  const cookieStore = cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver la compra.
      </div>
    );
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: branchRolesRaw } = await supabase
    .from("user_branch_role")
    .select("branch_id, role, can_manage_stock, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const branchRoles = (branchRolesRaw ?? []) as BranchRole[];
  const isSuperadmin = branchRoles.some((role) => role.role === "superadmin");
  const activeRole = branchRoles.find(
    (role) => role.branch_id === activeBranchId,
  );
  const canManageStock =
    isSuperadmin ||
    activeRole?.role === "admin" ||
    activeRole?.can_manage_stock;

  let detail = [];
  let error: string | null = null;

  try {
    detail = await fetchPurchaseDetail({
      branchId: activeBranchId,
      purchaseId,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando la compra.";
  }

  if (error) {
    return (
      <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-6 text-sm">
        {error}
      </div>
    );
  }

  if (detail.length === 0) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Compra no encontrada.
      </div>
    );
  }

  const header = detail[0];

  const items = detail.map((row) => ({
    product_id: row.product_id,
    product_name: row.product_name,
    quantity_ordered: row.quantity_ordered,
    quantity_received: row.quantity_received,
  }));

  return (
    <div className="space-y-4">
      {searchParams?.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Compra recibida correctamente.
        </div>
      ) : null}
      {searchParams?.error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm">
          {searchParams.error}
        </div>
      ) : null}

      <PurchaseDetailClient
        purchaseId={header.purchase_id}
        status={header.status}
        orderedAt={header.ordered_at}
        receivedAt={header.received_at}
        items={items}
        canManageStock={Boolean(canManageStock)}
        onReceivePurchase={receivePurchaseAction}
      />
    </div>
  );
}
