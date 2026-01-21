Actuá como **Lead Backend Engineer (Supabase) + Product Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar las **RPCs (writes) mínimas del MVP** alineadas con:
- docs/core-system-contract.md (contrato)
- docs/product-spec-v1.4.md
- RLS ya aplicado (002)
- views base ya creadas (003)

REGLAS
- SQL puro (PostgreSQL) en una migración.
- SOLO funciones/RPC (no views nuevas).
- NO triggers.
- Validar branch + permisos SIEMPRE.
- Todas las operaciones deben ser seguras con RLS:
  - superadmin: todo
  - admin: branch asignada
  - seller: branch asignada + flags (agenda/payments/stock)
- Evitar lógica compleja: mantener funciones pequeñas.
- Idempotencia donde aplique (upserts).
- Retornar registros mínimos útiles (ids + campos clave).

RPCs A CREAR (MVP)

A) Reservas públicas (guest-first)
1) rpc_public_create_reservation(
     p_branch_id uuid,
     p_service_id uuid,
     p_staff_id uuid null,
     p_start_at timestamptz,
     p_full_name text,
     p_phone text,
     p_email text null,
     p_notes text null,
     p_staff_strategy text default 'any'  -- 'any' | 'explicit'
   ) returns uuid (appointment_id)

Reglas:
- branch_id es obligatorio.
- service debe estar habilitado y disponible en branch_service.
- staff:
  - si strategy = 'explicit' requiere p_staff_id
  - si strategy = 'any' elige un staff disponible (determinístico: menor cantidad de citas del día o primero por nombre/id).
- Validar no solapamiento por staff (verificar rango start/end usando duración del servicio).
- Upsert client por organization_id + phone:
  - si existe, actualizar email/nombre si llegan
  - si no existe, crear
- Crear appointment en status 'scheduled' (o 'scheduled_deposit_pending' si branch requiere seña — por ahora NO agregar esa regla automática; siempre 'scheduled')
- Calcular end_at = start_at + duration_min

Nota: este RPC debe ser callable sin auth (anon) para reservas públicas.
Dejar preparado para restringir por rate limit más adelante (no implementar ahora).

B) Agenda (interno)
2) rpc_update_appointment_status(
     p_appointment_id uuid,
     p_branch_id uuid,
     p_new_status public.appointment_status
   ) returns void

Reglas:
- Requiere permiso agenda (admin o seller con can_manage_agenda).
- Validar que appointment.branch_id = p_branch_id.
- Validar transición permitida según contrato (scheduled* -> in_progress/completed/cancelled/no_show, etc).

C) Seña
3) rpc_create_or_update_deposit(
     p_appointment_id uuid,
     p_branch_id uuid,
     p_amount numeric,
     p_proof_url text null
   ) returns uuid (deposit_id)

Reglas:
- Permiso payments (admin o seller con can_manage_payments) para editar internamente.
- Para público: NO usar esta RPC. (Solo staff por ahora.)
- Upsert deposit 1–1 por appointment_id.
- status default 'pending', verified_at null.

4) rpc_verify_deposit(
     p_deposit_id uuid,
     p_branch_id uuid,
     p_status public.deposit_status -- verified|rejected
   ) returns void

Reglas:
- Permiso payments.
- Si verified -> set verified_at = now().

D) POS (cobros)
5) rpc_create_payment_for_appointment(
     p_branch_id uuid,
     p_appointment_id uuid,
     p_client_id uuid null,
     p_amount numeric,
     p_method public.payment_method,
     p_paid_at timestamptz default now(),
     p_source public.payment_source_type,
     p_is_recurrent boolean,
     p_referred_by text null
   ) returns uuid (payment_id)

Reglas:
- Permiso payments.
- Validar que no exista ya un payment para esa appointment (idempotencia).
- Crear payment, crear receipt (1–1), crear payment_source (1–1).
- Opcional: si appointment no está completed, NO cambiar estado (lo hace rpc_update_appointment_status).
- Validar branch match.

6) rpc_create_walkin_payment(
     p_branch_id uuid,
     p_client_phone text null,
     p_client_full_name text null,
     p_client_email text null,
     p_amount numeric,
     p_method public.payment_method,
     p_paid_at timestamptz default now(),
     p_source public.payment_source_type,
     p_is_recurrent boolean,
     p_referred_by text null,
     p_service_id uuid null
   ) returns uuid (payment_id)

Reglas:
- Permiso payments.
- Si viene phone -> upsert client igual que reservas.
- Crear payment (appointment_id null).
- Crear receipt + payment_source.
- p_service_id solo para analytics futuro (si no existe campo, NO agregarlo; dejalo fuera del schema por ahora).

E) Stock (manual)
7) rpc_create_stock_movement(
     p_branch_id uuid,
     p_product_id uuid,
     p_movement_type public.stock_movement_type,
     p_quantity numeric,
     p_reason text null,
     p_appointment_id uuid null,
     p_purchase_id uuid null
   ) returns uuid (movement_id)

Reglas:
- Permiso stock (admin o seller con can_manage_stock).
- Validar branch match producto.
- quantity > 0.

F) Compras
8) rpc_create_purchase(
     p_branch_id uuid,
     p_notes text null,
     p_items jsonb  -- [{product_id, quantity_ordered, unit_cost?}]
   ) returns uuid (purchase_id)

Reglas:
- Permiso stock.
- Crear purchase + purchase_items.
- Validar product.branch_id.

9) rpc_receive_purchase(
     p_branch_id uuid,
     p_purchase_id uuid,
     p_items jsonb -- [{product_id, quantity_received}]
   ) returns void

Reglas:
- Permiso stock.
- Marcar purchase status received y received_at=now().
- Actualizar purchase_item.quantity_received.
- NO crear stock_movement automático aún (eso será otro ticket). (MVP puede registrarse manualmente.)
  -> Dejar TODO listo para un futuro ticket de “receive creates stock movements”.

DOCUMENTACIÓN
- Agregar al final de la migración una sección de “Smoke checks” (queries y llamadas ejemplo).
- Actualizar docs/activity-log.md: “RPCs MVP (writes)”.

ENTREGABLE
- Nueva migración:
  supabase/migrations/<timestamp>_004_rpcs_mvp.sql

GIT (AUTÓNOMO)
- Rama: mantener feature/db-init-schema
- Commit: feat(db): MVP write RPCs
- Push
- NO mergear a main

EJECUTÁ.


prompt de continuacion

Elegimos la OPCIÓN 1: bypass controlado para el RPC público.

Implementá rpc_public_create_reservation como SECURITY DEFINER para permitir reservas sin auth,
sin abrir policies anon.

REQUISITOS OBLIGATORIOS (seguridad)
- CREATE FUNCTION ... SECURITY DEFINER
- SET search_path = public, auth
- Row security: deshabilitada para esta función (usa el mecanismo correcto compatible con Postgres/Supabase)
- La función debe ser mínima y estricta.

VALIDACIONES INTERNAS (obligatorias)
- branch existe y status='active'
- service existe y is_active=true
- branch_service(branch_id, service_id) existe y is_enabled=true y is_available=true
- obtener organization_id desde branch
- client: upsert por (organization_id, phone)
  - si existe: actualizar full_name/email si vienen
  - si no existe: crear con organization_id, phone, full_name/email
- start_at debe ser >= now() - interval '5 minutes' y <= now() + interval '365 days'
- calcular end_at = start_at + duration_min
- staff:
  - si p_staff_strategy='explicit': p_staff_id requerido y pertenece al branch
  - si 'any': elegir staff ACTIVO del branch determinístico (ORDER BY full_name, id) y que pase disponibilidad
- disponibilidad mínima:
  - validar que staff tenga staff_availability activa que cubra el rango (weekday/time)
- no solapamiento:
  - impedir overlap con citas existentes del staff (start_at/end_at) en estados scheduled*/in_progress
- insertar appointment con status='scheduled' y retornar appointment_id

LIMITACIONES
- NO insertar deposit/payment/receipt/payment_source
- NO permitir status != 'scheduled'
- NO permitir branch_id distinto al del staff elegido
- NO aceptar service no habilitado para la sucursal

RLS
- No crear policies anon.
- Mantener RLS como está.

CONTINUAR TICKET 004
- Implementar el resto de RPCs internas (agenda, payments, stock, purchases) normales (no SECURITY DEFINER),
  que dependan del RLS y permisos actuales.

ENTREGABLE
- supabase/migrations/<timestamp>_004_rpcs_mvp.sql completo
- activity-log.md actualizado: “RPCs MVP (writes)”
- smoke checks al final

GIT
- mantener rama feature/db-init-schema
- commit: feat(db): MVP write RPCs
- push

EJECUTÁ.
