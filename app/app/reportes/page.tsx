import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { format, subDays, startOfMonth } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  fetchIncomeByMethod,
  fetchIncomeBySource,
  fetchIncomeRecurrentSplit,
  fetchTopServices,
  type DateRange,
} from "@/lib/queries/reports";

type SearchParams = {
  preset?: string;
  from?: string;
  to?: string;
};

type BranchRole = {
  branch_id: string;
  role: "superadmin" | "admin" | "seller";
  is_active: boolean;
};

const PRESETS = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "Últimos 7 días" },
  { value: "month", label: "Mes actual" },
  { value: "custom", label: "Personalizado" },
];

function resolveRange(params: SearchParams): {
  range: DateRange;
  preset: string;
} {
  const today = new Date();
  const preset = params.preset ?? "7d";

  if (preset === "today") {
    const date = format(today, "yyyy-MM-dd");
    return { range: { from: date, to: date }, preset };
  }

  if (preset === "month") {
    return {
      range: {
        from: format(startOfMonth(today), "yyyy-MM-dd"),
        to: format(today, "yyyy-MM-dd"),
      },
      preset,
    };
  }

  if (preset === "custom" && params.from && params.to) {
    return { range: { from: params.from, to: params.to }, preset };
  }

  return {
    range: {
      from: format(subDays(today, 6), "yyyy-MM-dd"),
      to: format(today, "yyyy-MM-dd"),
    },
    preset: "7d",
  };
}

export default async function ReportesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const cookieStore = await cookies();
  const activeBranchId = cookieStore.get("hs_branch_id")?.value ?? null;

  if (!activeBranchId) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
        Selecciona una sucursal para ver reportes.
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
        Sin permisos para ver reportes.
      </div>
    );
  }

  const { range, preset } = resolveRange(searchParams);

  const [byMethod, bySource, recurrentSplit, topServices] = (await Promise.all([
    fetchIncomeByMethod({ branchId: activeBranchId, range }),
    fetchIncomeBySource({ branchId: activeBranchId, range }),
    fetchIncomeRecurrentSplit({ branchId: activeBranchId, range }),
    fetchTopServices({ branchId: activeBranchId, range }),
  ])) as [
    { method: string; total_amount: number; count: number }[],
    { source: string | null; total_amount: number; count: number }[],
    { is_recurrent: boolean | null; total_amount: number; count: number }[],
    { service_id: string; service_name: string; total_amount: number; count: number }[],
  ];

  const totalIncome = byMethod.reduce(
    (sum: number, row) => sum + (row.total_amount ?? 0),
    0,
  );

  const methodRows = Object.values(
    byMethod.reduce<
      Record<string, { method: string; total: number; count: number }>
    >((acc, row) => {
      const key = row.method ?? "other";
      if (!acc[key]) {
        acc[key] = { method: key, total: 0, count: 0 };
      }
      acc[key].total += row.total_amount ?? 0;
      acc[key].count += row.count ?? 0;
      return acc;
    }, {}),
  );

  const sourceRows = Object.values(
    bySource.reduce<
      Record<string, { source: string; total: number; count: number }>
    >((acc, row) => {
      const key = row.source ?? "unknown";
      if (!acc[key]) {
        acc[key] = { source: key, total: 0, count: 0 };
      }
      acc[key].total += row.total_amount ?? 0;
      acc[key].count += row.count ?? 0;
      return acc;
    }, {}),
  );

  const recurrentRows = Object.values(
    recurrentSplit.reduce<
      Record<string, { label: string; total: number; count: number }>
    >((acc, row) => {
      const key = row.is_recurrent ? "recurrente" : "nuevo";
      if (!acc[key]) {
        acc[key] = { label: key, total: 0, count: 0 };
      }
      acc[key].total += row.total_amount ?? 0;
      acc[key].count += row.count ?? 0;
      return acc;
    }, {}),
  );

  const topServicesRows = Object.values(
    topServices.reduce<
      Record<string, { service: string; total: number; count: number }>
    >((acc, row) => {
      const key = row.service_id;
      if (!acc[key]) {
        acc[key] = { service: row.service_name, total: 0, count: 0 };
      }
      acc[key].total += row.total_amount ?? 0;
      acc[key].count += row.count ?? 0;
      return acc;
    }, {}),
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            Reportes
          </p>
          <h1 className="text-xl font-semibold">Ingresos por período</h1>
          <p className="text-muted-foreground text-sm">{`${range.from} → ${range.to}`}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((option) => (
            <a
              key={option.value}
              href={`/app/reportes?preset=${option.value}`}
              className={`rounded-full border px-3 py-1 text-sm ${
                preset === option.value
                  ? "border-foreground text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {option.label}
            </a>
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total ingresos</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{`$${totalIncome.toFixed(2)}`}</CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {methodRows.length === 0 ? (
              <p className="text-muted-foreground">Sin datos</p>
            ) : (
              methodRows.map((row) => (
                <div
                  key={row.method}
                  className="flex items-center justify-between"
                >
                  <span>{row.method}</span>
                  <Badge variant="outline">{`$${row.total.toFixed(2)} · ${row.count}`}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recurrente vs nuevo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {recurrentRows.length === 0 ? (
              <p className="text-muted-foreground">Sin datos</p>
            ) : (
              recurrentRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between"
                >
                  <span>{row.label}</span>
                  <Badge variant="outline">{`$${row.total.toFixed(2)} · ${row.count}`}</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fuentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {sourceRows.length === 0 ? (
            <p className="text-muted-foreground">Sin datos</p>
          ) : (
            sourceRows.map((row) => (
              <div
                key={row.source}
                className="flex items-center justify-between"
              >
                <span>{row.source}</span>
                <Badge variant="outline">{`$${row.total.toFixed(2)} · ${row.count}`}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top servicios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {topServicesRows.length === 0 ? (
            <p className="text-muted-foreground">Sin datos</p>
          ) : (
            topServicesRows.map((row) => (
              <div
                key={row.service}
                className="flex items-center justify-between"
              >
                <span>{row.service}</span>
                <Badge variant="outline">{`$${row.total.toFixed(2)} · ${row.count}`}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
