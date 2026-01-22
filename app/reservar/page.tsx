import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function BookingStartPage() {
  return (
    <section className="space-y-8">
      <div className="space-y-4">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Reservas online
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Elegí tu próximo momento Her Studio
        </h1>
        <p className="text-base text-muted-foreground">
          Reservá en minutos. Seleccioná sucursal, servicio y horario con la
          mejor disponibilidad del equipo.
        </p>
      </div>

      <div className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">¿Cómo funciona?</h2>
        <div className="mt-4 grid gap-4 text-sm text-muted-foreground">
          <div className="rounded-2xl border border-dashed border-black/10 p-4">
            Elegí la sucursal más cercana y el servicio que querés.
          </div>
          <div className="rounded-2xl border border-dashed border-black/10 p-4">
            Seleccioná fecha, horario y profesional (o cualquiera disponible).
          </div>
          <div className="rounded-2xl border border-dashed border-black/10 p-4">
            Confirmá tus datos y, si querés, subí un comprobante de seña.
          </div>
        </div>
        <Button asChild className="mt-6 w-full">
          <Link href="/reservar/sucursal">Empezar reserva</Link>
        </Button>
      </div>
    </section>
  );
}
