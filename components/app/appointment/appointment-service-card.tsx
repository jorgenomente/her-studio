export function AppointmentServiceCard({
  serviceName,
  durationMin,
  staffName,
}: {
  serviceName: string;
  durationMin?: number | null;
  staffName: string;
}) {
  return (
    <div className="bg-card rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Servicio</h2>
      <p className="text-lg font-medium">{serviceName}</p>
      <p className="text-muted-foreground text-sm">
        Duración: {durationMin ? `${durationMin} min` : "—"}
      </p>
      <p className="text-muted-foreground text-sm">Staff: {staffName}</p>
    </div>
  );
}
