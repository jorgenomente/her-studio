"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type UnpaidAppointment = {
  appointment_id: string;
  start_at: string;
  end_at: string;
  status: string;
  service_name: string;
  staff_name: string;
  client_name?: string | null;
  client_phone?: string | null;
  client_id?: string | null;
};

type PaymentDay = {
  payment_id: string;
  appointment_id?: string | null;
  amount: number;
  method: string;
  paid_at: string;
};

type PosClientProps = {
  unpaidAppointments: UnpaidAppointment[];
  paymentsDay: PaymentDay[];
  canManagePayments: boolean;
  onPayAppointment: (formData: FormData) => Promise<void>;
  onWalkInPayment: (formData: FormData) => Promise<void>;
};

const SOURCES = [
  { value: "recommendation", label: "Recomendación" },
  { value: "instagram", label: "Instagram" },
  { value: "google_maps", label: "Google Maps" },
  { value: "walk_in", label: "Walk-in" },
  { value: "other", label: "Otro" },
];

export function PosClient({
  unpaidAppointments,
  paymentsDay,
  canManagePayments,
  onPayAppointment,
  onWalkInPayment,
}: PosClientProps) {
  const [selectedAppointment, setSelectedAppointment] =
    useState<UnpaidAppointment | null>(null);

  const paymentsTotal = useMemo(() => {
    return paymentsDay.reduce((sum, payment) => sum + (payment.amount ?? 0), 0);
  }, [paymentsDay]);

  if (!canManagePayments) {
    return (
      <div className="bg-card text-muted-foreground rounded-xl border border-dashed p-6 text-sm">
        No tienes permisos para registrar cobros.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="appointments">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="appointments">Cobrar cita</TabsTrigger>
          <TabsTrigger value="walkin">Venta sin cita</TabsTrigger>
          <TabsTrigger value="payments">Pagos del día</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          {unpaidAppointments.length === 0 ? (
            <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
              No hay citas pendientes de cobro.
            </div>
          ) : (
            unpaidAppointments.map((appointment) => (
              <div
                key={appointment.appointment_id}
                className="bg-card rounded-xl border p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(appointment.start_at), "HH:mm")} ·{" "}
                      {appointment.staff_name}
                    </p>
                    <h3 className="text-base font-semibold">
                      {appointment.service_name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {appointment.client_name ?? "Cliente sin nombre"} ·{" "}
                      {appointment.client_phone ?? "Sin teléfono"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    Cobrar
                  </Button>
                </div>
                <div className="text-muted-foreground mt-3 text-xs">
                  Monto sugerido: —
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="walkin" className="space-y-4">
          <div className="bg-card space-y-4 rounded-xl border p-4">
            <div>
              <h3 className="text-base font-semibold">Venta sin cita</h3>
              <p className="text-muted-foreground text-sm">
                Registro rápido de cobro directo.
              </p>
            </div>
            <form action={onWalkInPayment} className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="walkin_amount">Monto</Label>
                  <Input
                    id="walkin_amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walkin_method">Método</Label>
                  <select
                    id="walkin_method"
                    name="method"
                    className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                    defaultValue="cash"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="card">Tarjeta</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walkin_phone">Teléfono</Label>
                  <Input
                    id="walkin_phone"
                    name="client_phone"
                    type="tel"
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walkin_name">Nombre</Label>
                  <Input
                    id="walkin_name"
                    name="client_full_name"
                    type="text"
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walkin_email">Email</Label>
                  <Input
                    id="walkin_email"
                    name="client_email"
                    type="email"
                    placeholder="Opcional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walkin_source">Fuente</Label>
                  <select
                    id="walkin_source"
                    name="source"
                    className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                    defaultValue="walk_in"
                  >
                    {SOURCES.map((source) => (
                      <option key={source.value} value={source.value}>
                        {source.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="walkin_recurrent"
                    name="is_recurrent"
                    type="checkbox"
                    className="h-4 w-4"
                  />
                  <Label htmlFor="walkin_recurrent">Cliente recurrente</Label>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="walkin_referred">Referido por</Label>
                  <Input
                    id="walkin_referred"
                    name="referred_by"
                    type="text"
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <Button type="submit">Registrar cobro</Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="bg-card rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Pagos del día</h3>
              <Badge variant="outline">{`Total: $${paymentsTotal.toFixed(2)}`}</Badge>
            </div>
          </div>
          {paymentsDay.length === 0 ? (
            <div className="bg-card text-muted-foreground rounded-xl border p-6 text-sm">
              No hay pagos registrados hoy.
            </div>
          ) : (
            paymentsDay.map((payment) => (
              <div
                key={payment.payment_id}
                className="bg-card rounded-xl border p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">
                      {format(new Date(payment.paid_at), "HH:mm")} ·{" "}
                      {payment.method}
                    </p>
                    <p className="text-base font-semibold">{`$${payment.amount}`}</p>
                  </div>
                  <Badge variant="outline">
                    {payment.appointment_id ? "Cita" : "Walk-in"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Dialog
        open={Boolean(selectedAppointment)}
        onOpenChange={() => setSelectedAppointment(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cobrar cita</DialogTitle>
          </DialogHeader>

          {selectedAppointment ? (
            <form action={onPayAppointment} className="space-y-4">
              <input
                type="hidden"
                name="appointment_id"
                value={selectedAppointment.appointment_id}
              />
              <input
                type="hidden"
                name="client_id"
                value={selectedAppointment.client_id ?? ""}
              />
              <div className="space-y-2">
                <Label>Monto</Label>
                <Input
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Método</Label>
                <select
                  name="method"
                  className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                  defaultValue="cash"
                >
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="card">Tarjeta</option>
                  <option value="other">Otro</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fuente</Label>
                <select
                  name="source"
                  className="bg-background h-10 w-full rounded-md border px-3 text-sm"
                  defaultValue="walk_in"
                >
                  {SOURCES.map((source) => (
                    <option key={source.value} value={source.value}>
                      {source.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  name="is_recurrent"
                  type="checkbox"
                  className="h-4 w-4"
                />
                <Label>Cliente recurrente</Label>
              </div>
              <div className="space-y-2">
                <Label>Referido por</Label>
                <Input name="referred_by" type="text" placeholder="Opcional" />
              </div>
              <Button type="submit" className="w-full">
                Confirmar cobro
              </Button>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
