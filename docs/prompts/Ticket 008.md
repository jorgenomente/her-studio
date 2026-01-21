Actuá como **Lead Frontend Engineer + Product Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar la pantalla **/app/pos** (MVP) para cobros reales:
- Cobro de citas
- Venta sin cita (walk-in)
- Registro de método de pago
- Generación de comprobante interno
- Captura de analytics básicos

ALINEACIÓN
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- AGENTS.md
- RPCs ya implementadas (004)
- Views ya implementadas (003)

REGLAS
- Mobile-first estricto.
- UX rápida (cobrar en ≤3 pasos).
- NO procesar pagos online (solo registrar).
- NO editar stock automático aquí.
- Acciones visibles SOLO con permiso de pagos.
- Estados completos (loading/empty/error/success).

DATA CONTRACT (READ)
- v_app_pos_unpaid_appointments
  → listar citas sin cobro (branch activo)
- v_app_pos_payments_day
  → listado de pagos del día (branch activo)

DATA CONTRACT (WRITE)
- rpc_create_payment_for_appointment
- rpc_create_walkin_payment

UX / FLOWS

A) POS Home
- Tabs:
  1) “Cobrar cita”
  2) “Venta sin cita”
  3) “Pagos del día”
- Default: “Cobrar cita”

B) Cobrar cita
- Lista de citas sin cobro (card grande):
  - hora, servicio, cliente, monto sugerido
- CTA: “Cobrar”
- Modal de cobro con:
  - monto (editable)
  - método de pago (cash / transfer / card / other)
  - fuente (select obligatorio)
  - cliente recurrente (toggle)
  - referido por (input opcional)
- Confirmar → llama rpc_create_payment_for_appointment
- Success:
  - toast/banner
  - refrescar listas

C) Venta sin cita
- Form simple:
  - monto
  - método de pago
  - cliente:
    - teléfono (opcional)
    - nombre (opcional)
    - email (opcional)
  - fuente
  - recurrente toggle
  - referido por (opcional)
- Confirmar → llama rpc_create_walkin_payment

D) Pagos del día
- Lista simple:
  - hora, monto, método
  - indicador si es cita o walk-in
- (detalle completo en próximo ticket)

PERMISOS
- Superadmin / Admin:
  - acceso total
- Seller:
  - solo si can_manage_payments = true

IMPLEMENTACIÓN (sugerida)
1) Ruta:
- app/app/pos/page.tsx
2) Queries:
- lib/queries/pos.ts
3) Componentes:
- PosTabs
- UnpaidAppointmentCard
- PaymentModal
- WalkInForm
- PaymentsDayList
4) Mutaciones:
- Server actions que llamen RPCs
- Refetch tras success

ACTIVITY LOG
- Agregar entrada:
  “POS MVP (cobros + venta sin cita) implementado”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Commit: feat(app): POS MVP
- Push

VALIDACIÓN
- npm run dev
- Cobrar una cita
- Registrar venta sin cita
- Ver pagos reflejados en “Pagos del día”
- Acciones ocultas sin permiso

EJECUTÁ.
