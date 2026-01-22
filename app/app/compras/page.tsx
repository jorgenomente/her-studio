import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { NewPurchaseModal } from "@/components/app/purchases/new-purchase-modal";
import { PurchasesList } from "@/components/app/purchases/purchases-list";
import { Button } from "@/components/ui/button";
import { createPurchaseAction } from "@/lib/actions/purchases";
import { fetchPurchasesList } from "@/lib/queries/purchases";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = {
  success?: string;
  error?: string;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  can_manage_stock: boolean;
  is_active: boolean;
};

export default async function ComprasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver compras.
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();
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

  const { data: products } = await supabase
    .from("product")
    .select("id, name")
    .eq("branch_id", activeBranchId)
    .eq("is_active", true)
    .order("name", { ascending: true });
  const typedProducts = (products ?? []) as { id: string; name: string }[];

  let purchases = [];
  let error: string | null = null;

  try {
    purchases = await fetchPurchasesList({ branchId: activeBranchId });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando compras.";
  }

  return (
    <div className="space-y-4">
      {searchParams.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Operación registrada.
        </div>
      ) : null}
      {searchParams.error || error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm">
          {searchParams.error ?? error}
        </div>
      ) : null}

      {canManageStock ? (
        <NewPurchaseModal
          open={false}
          onOpenChange={() => {}}
          products={typedProducts.map((product) => ({
            id: product.id,
            name: product.name,
          }))}
          onSubmit={createPurchaseAction}
        />
      ) : null}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Compras</h1>
        {canManageStock ? <NewPurchaseModalTrigger /> : null}
      </div>

      {purchases.length === 0 ? (
        <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
          No hay compras registradas.
        </div>
      ) : (
        <PurchasesList items={purchases} />
      )}
    </div>
  );
}

function NewPurchaseModalTrigger() {
  "use client";

  return (
    <Button
      onClick={() => {
        window.dispatchEvent(new Event("hs_open_purchase_modal"));
      }}
    >
      Nueva compra
    </Button>
  );
}
