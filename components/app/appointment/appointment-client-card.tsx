export function AppointmentClientCard({
  name,
  phone,
  email,
}: {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Cliente</h2>
      <p className="text-lg font-medium">{name ?? "Cliente sin nombre"}</p>
      <p className="text-muted-foreground text-sm">{phone ?? "Sin teléfono"}</p>
      {email ? <p className="text-muted-foreground text-sm">{email}</p> : null}
    </div>
  );
}
