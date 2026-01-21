import Link from "next/link";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe7e2,_transparent_45%),radial-gradient(circle_at_top_right,_#ffd9f2,_transparent_40%),linear-gradient(180deg,_#fff6f2,_#ffffff_45%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Her Studio
        </Link>
        <Link
          href="/reservar"
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium shadow-sm"
        >
          Reservar
        </Link>
      </header>
      <main className="mx-auto w-full max-w-6xl px-5 pb-16">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">{children}</div>
          <aside className="hidden lg:block">
            <div className="sticky top-10 rounded-3xl border border-black/5 bg-white/80 p-8 shadow-sm">
              <h3 className="text-lg font-semibold">Tu reserva, sin fricción</h3>
              <p className="mt-3 text-sm text-muted-foreground">
                Elegí sucursal, servicio y horario. Si dejás seña, validamos
                manualmente y te confirmamos por WhatsApp.
              </p>
              <div className="mt-6 space-y-4 text-sm text-muted-foreground">
                <div className="rounded-2xl border border-dashed border-black/10 p-4">
                  Confirmación inmediata y recordatorios del turno.
                </div>
                <div className="rounded-2xl border border-dashed border-black/10 p-4">
                  Profesionales especializados y disponibilidad real.
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
