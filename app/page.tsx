import Link from "next/link";
import { Playfair_Display } from "next/font/google";

import { Button } from "@/components/ui/button";

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
});

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffe1e8,_transparent_45%),radial-gradient(circle_at_top_right,_#fff0d2,_transparent_45%),linear-gradient(180deg,_#fff6f2,_#ffffff_45%)]">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-semibold tracking-tight">Her Studio</span>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost">
            <Link href="/login">Ingresar</Link>
          </Button>
          <Button asChild>
            <Link href="/reservar">Reservar</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-16 pt-4 lg:flex-row lg:items-start">
        <section className="flex-1 space-y-8">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Beauty studio experience
          </p>
          <h1
            className={`${display.variable} text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            La belleza que se siente desde la primera reserva.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
            Her Studio es una experiencia integral: agenda ágil, equipo experto y
            resultados impecables. Reservá en minutos, elegí tu sucursal y
            confirmá tu turno sin complicaciones.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/reservar">Reservar ahora</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-black/10 bg-white/80 sm:w-auto"
            >
              <Link href="#servicios">Ver servicios</Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                title: "Equipo especializado",
                description:
                  "Profesionales certificados en color, corte y tratamientos.",
              },
              {
                title: "Agenda inteligente",
                description:
                  "Disponibilidad real por sucursal y profesionales.",
              },
              {
                title: "Experiencia premium",
                description:
                  "Atención personalizada y espacios pensados para vos.",
              },
              {
                title: "Seña opcional",
                description:
                  "Reservá con comprobante y confirmamos manualmente.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm"
              >
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <aside className="flex-1 space-y-6">
          <div className="rounded-[32px] border border-black/10 bg-white p-6 shadow-xl">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Próximas aperturas
              </p>
              <h2 className="text-2xl font-semibold">
                Reservá en la sucursal que mejor te quede.
              </h2>
              <p className="text-sm text-muted-foreground">
                Elegí tu sede al momento de reservar y encontrá horarios reales
                disponibles.
              </p>
            </div>
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-dashed border-black/10 p-4 text-sm">
                <p className="font-medium">Sucursales activas</p>
                <p className="text-muted-foreground">
                  Consultá disponibilidad real en el flujo de reserva.
                </p>
              </div>
              <div className="rounded-2xl border border-dashed border-black/10 p-4 text-sm">
                <p className="font-medium">Horarios en tiempo real</p>
                <p className="text-muted-foreground">
                  Disponibilidad actualizada por profesional y servicio.
                </p>
              </div>
            </div>
          </div>

          <div
            id="servicios"
            className="rounded-[32px] border border-black/10 bg-white/70 p-6 shadow-sm"
          >
            <h3 className="text-lg font-semibold">Servicios destacados</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center justify-between">
                <span>Color & Gloss</span>
                <span>90 min</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tratamiento reparador</span>
                <span>60 min</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Brushing & Styling</span>
                <span>45 min</span>
              </li>
            </ul>
            <Button asChild className="mt-6 w-full">
              <Link href="/reservar">Reservar un servicio</Link>
            </Button>
          </div>
        </aside>
      </main>
    </div>
  );
}
