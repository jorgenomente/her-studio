import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardCards } from "@/components/app/dashboard/dashboard-cards";
import {
  fetchDashboardDay,
  fetchDashboardGlobalDay,
} from "@/lib/queries/dashboard";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type SearchParams = {
  scope?: string;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  is_active: boolean;
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver el dashboard.
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
    .select("branch_id, role, is_active")
    .eq("user_id", user.id)
    .eq("is_active", true);

  const branchRoles = (branchRolesRaw ?? []) as BranchRole[];
  const isSuperadmin = branchRoles.some((role) => role.role === "superadmin");
  const isAdmin = branchRoles.some((role) => role.role === "admin");

  if (!isSuperadmin && !isAdmin) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
        Sin permisos para ver el dashboard.
      </div>
    );
  }

  const scope =
    isSuperadmin && searchParams.scope === "global" ? "global" : "branch";
  const data =
    scope === "global" && isSuperadmin
      ? await fetchDashboardGlobalDay()
      : await fetchDashboardDay({ branchId: activeBranchId });

  if (!data) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        No hay datos disponibles para hoy.
      </div>
    );
  }

  const rawData = data as unknown as {
    total_income_day: number | null;
    count_appointments_day: number | null;
    count_no_show_day: number | null;
    count_cancelled_day: number | null;
    count_completed_day: number | null;
    unpaid_count: number | null;
    low_stock_count: number | null;
  };

  const normalizedData = {
    total_income_day: rawData.total_income_day ?? 0,
    count_appointments_day: rawData.count_appointments_day ?? 0,
    count_no_show_day: rawData.count_no_show_day ?? 0,
    count_cancelled_day: rawData.count_cancelled_day ?? 0,
    count_completed_day: rawData.count_completed_day ?? 0,
    unpaid_count: rawData.unpaid_count ?? 0,
    low_stock_count: rawData.low_stock_count ?? 0,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Dashboard
          </p>
          <h1 className="text-xl font-semibold">
            {scope === "global" ? "Global" : "Sucursal actual"}
          </h1>
        </div>
        {isSuperadmin ? (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={scope === "branch" ? "default" : "outline"}
              asChild
            >
              <a href="/app/dashboard">Sucursal</a>
            </Button>
            <Button
              size="sm"
              variant={scope === "global" ? "default" : "outline"}
              asChild
            >
              <a href="/app/dashboard?scope=global">Global</a>
            </Button>
          </div>
        ) : null}
      </div>

      <DashboardCards data={normalizedData} />
    </div>
  );
}
