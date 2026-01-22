import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { StockClient } from "@/components/app/stock/stock-client";
import { StockSearch } from "@/components/app/stock/stock-search";
import { createStockMovementAction } from "@/lib/actions/stock";
import { fetchStockSnapshot } from "@/lib/queries/stock";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type SearchParams = {
  q?: string;
  success?: string;
  error?: string;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  can_manage_stock: boolean;
  is_active: boolean;
};

export default async function StockPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;
  const query = searchParams.q?.trim() ?? "";

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver stock.
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

  let items: Awaited<ReturnType<typeof fetchStockSnapshot>> = [];
  let error: string | null = null;

  try {
    items = await fetchStockSnapshot({ branchId: activeBranchId, query });
  } catch (err) {
    error = err instanceof Error ? err.message : "Error cargando stock.";
  }

  return (
    <div className="space-y-4">
      {searchParams.success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Movimiento registrado.
        </div>
      ) : null}
      {searchParams.error || error ? (
        <div className="border-destructive/40 bg-destructive/10 text-destructive rounded-xl border p-4 text-sm">
          {searchParams.error ?? error}
        </div>
      ) : null}

      <StockSearch initialQuery={query} />

      <StockClient
        items={(() => {
          const typedItems = items as {
            product_id: string | null;
            product_name: string | null;
            unit: string | null;
            qty_on_hand: number | null;
            stock_min: number | null;
            is_low_stock: boolean | null;
          }[];

          return typedItems
            .filter((item) => item.product_id && item.product_name && item.unit)
            .map((item) => ({
              product_id: item.product_id as string,
              product_name: item.product_name as string,
              unit: item.unit as string,
              qty_on_hand: item.qty_on_hand ?? 0,
              stock_min: item.stock_min ?? 0,
              is_low_stock: item.is_low_stock ?? false,
            }));
        })()}
        canManageStock={Boolean(canManageStock)}
        onCreateMovement={createStockMovementAction}
      />
    </div>
  );
}
