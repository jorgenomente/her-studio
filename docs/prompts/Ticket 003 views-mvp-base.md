Actuá como **Lead Database Engineer + Data Contract Architect** para Her Studio.

OBJETIVO DEL TICKET
Crear las **views base (READ contracts)** para el MVP, alineadas con:
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- RLS ya implementado (migración 002)

Estas views serán el contrato de datos para pantallas:
- Agenda
- Detalle de cita
- Reservar (disponibilidad)
- POS
- Dashboard
- Stock
- Compras
- Clientes (lista + métricas básicas)

REGLAS
- SQL puro.
- SOLO VIEWS (no RPC, no triggers).
- No romper RLS: las views deben depender de tablas con RLS (seguras por defecto).
- Todas las views operativas deben incluir `branch_id`.
- Usar nombres prefijados con `v_`.
- Mantener las views simples y estables.
- Donde aplique, incluir campos derivados útiles (ej: appointment_duration_min).
- No agregues lógica compleja de disponibilidad todavía (solo lo mínimo para iterar).

VIEWS A CREAR (mínimo)
1) Agenda
- v_app_agenda_day: citas por branch_id + rango de fecha
  Campos: appointment_id, branch_id, start_at, end_at, status, staff_id, staff_name,
          service_id, service_name, client_id, client_name, client_phone, has_deposit,
          has_payment

2) Detalle de cita
- v_app_appointment_detail: una cita con joins necesarios
  Campos: cita + deposit + payment + receipt (si existen), staff, service, client

3) POS
- v_app_pos_unpaid_appointments: citas completadas o listas para cobro sin pago
- v_app_pos_payments_day: pagos del día por sucursal (incluye method, amount, paid_at)
- v_app_pos_payment_detail: payment + receipt + payment_source

4) Dashboard día
- v_app_dashboard_day: métricas del día por sucursal
  - total_income_day
  - count_appointments_day
  - count_no_show_day
  - count_cancelled_day
  - count_completed_day
  - unpaid_count
  - low_stock_count (si posible simple)

5) Stock
- v_app_stock_snapshot: stock actual calculado = sum(in) - sum(out/waste/adjustment)
  Campos: branch_id, product_id, product_name, unit, stock_min, qty_on_hand, is_low_stock

6) Compras
- v_app_purchases_list: compras con totales (items_count, ordered_total_qty)
- v_app_purchase_detail: compra + items (ordered/received)

7) Clientes
- v_app_clients_list: lista por sucursal con métricas básicas
  Campos: client_id, full_name, phone, email, last_visit_at, visits_count, total_spent

NOTA SOBRE STOCK
Como no hay columna stock_actual persistida, calculalo con stock_movement agregando por product_id.
Mantenerlo eficiente: agregar índices si realmente necesarios, pero preferir dejarlos para un ticket de performance.

ENTREGABLE
- Nueva migración:
  supabase/migrations/<timestamp>_003_views_base.sql
- Actualizar docs/activity-log.md con la entrada:
  “Views base MVP (contracts de lectura)”

GIT (AUTÓNOMO)
- Rama: mantener feature/db-init-schema
- Commit:
  feat(db): base read views for MVP
- Push al finalizar
- NO mergear a main

VALIDACIÓN
- npx supabase db push debe aplicar sin errores.

EJECUTÁ.
