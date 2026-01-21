import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardData = {
  total_income_day: number;
  count_appointments_day: number;
  count_no_show_day: number;
  count_cancelled_day: number;
  count_completed_day: number;
  unpaid_count: number;
  low_stock_count: number;
};

export function DashboardCards({ data }: { data: DashboardData }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Ingresos hoy</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">{`$${data.total_income_day ?? 0}`}</CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Citas hoy</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {data.count_appointments_day ?? 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Completadas</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {data.count_completed_day ?? 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>No-shows</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {data.count_no_show_day ?? 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Canceladas</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {data.count_cancelled_day ?? 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Pendientes de cobro</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {data.unpaid_count ?? 0}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Stock bajo</CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-semibold">
          {data.low_stock_count ?? 0}
        </CardContent>
      </Card>
    </div>
  );
}
