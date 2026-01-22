export function AppointmentServiceCard({
  serviceName,
  durationMin,
  staffName,
}: {
  serviceName: string | null;
  durationMin?: number | null;
  staffName: string | null;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Servicio</h2>
      <p className="text-lg font-medium">
        {serviceName ?? "Servicio sin nombre"}
      </p>
      <p className="text-muted-foreground text-sm">
        Duración: {durationMin ? `${durationMin} min` : "—"}
      </p>
      <p className="text-muted-foreground text-sm">
        Staff: {staffName ?? "Sin asignar"}
      </p>
    </div>
  );
}
