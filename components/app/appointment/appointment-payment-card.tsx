export function AppointmentPaymentCard({
  amount,
  method,
}: {
  amount?: number | null;
  method?: string | null;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Pago</h2>
      {amount ? (
        <div className="text-muted-foreground text-sm">
          {`Monto: $${amount} · Método: ${method ?? "—"}`}
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">
          Sin pago registrado.
        </div>
      )}
    </div>
  );
}
