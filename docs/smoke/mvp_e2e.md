# Smoke Test — MVP E2E (Public booking → agenda → deposit → verify → payment → stock → complete)

## Objetivo

Validar el “happy path” completo:

1. Reserva pública
2. Reflejo en agenda backoffice
3. Depósito + proof_path
4. Verificación de depósito (requires payments permission)
5. Pago y receipt
6. Stock: purchase+receive y egreso ligado a appointment
7. Cierre de turno (completed)

## Precondiciones

- DB local reseteada y migraciones aplicadas.
- Seed MVP ejecutado.
- Buckets:
  - public-deposits (private)
  - deposit-proofs (private)
- Usuario admin con permisos para `payments` (y stock si aplica).
- Tenés acceso a `psql` contra la DB local de Supabase.

## Identificadores (seed actual)

- branch_id: 22222222-2222-2222-2222-222222222222
- service_id_1: 33333333-3333-3333-3333-333333333331
- staff_ids:
  - 55555555-5555-5555-5555-555555555551
  - 55555555-5555-5555-5555-555555555552
- admin user (ejemplo): pulidop21@gmail.com
  - user_id: 76731344-51c6-4077-9cf2-ba991bb87bc1
- product_id (stock):
  - 66666666-6666-6666-6666-666666666661 (Shampoo nutritivo)

## Paso 1 — Validar catálogo público

### RPCs

- rpc_public_list_branch_services
- rpc_public_availability_day

### Checks esperados

- 2 servicios activos
- availability_day devuelve slots con start_at/end_at y staff_name

## Paso 2 — Crear reserva pública

RPC:

- rpc_public_create_reservation

Check:

- appointment_id creado
- aparece en v_app_agenda_day con status = scheduled

## Paso 3 — Crear depósito y adjuntar proof_path

- Crear depósito (pending)
- Adjuntar proof_path con prefijo:
  branch/<branch_id>/appointment/<appointment_id>/proof/<archivo>

Checks:

- v_app_appointment_detail muestra deposit_id y proof_path
- v_app_agenda_day: has_deposit = true

## Paso 4 — Verificar depósito (payments permission)

RPC:

- rpc_verify_deposit

Checks:

- deposit.status = verified
- verified_at NOT NULL
- v_app_appointment_detail refleja deposit_status = verified

## Paso 5 — Crear pago (payments permission)

RPC:

- rpc_create_payment_for_appointment

Checks:

- payment_id y receipt_id presentes
- v_app_agenda_day: has_payment = true
- no dupes (count(payment) = 1 para ese appointment)

## Paso 6 — Stock (purchase + receive) + egreso ligado al appointment

RPCs:

- rpc_create_purchase
- rpc_receive_purchase
- rpc_create_stock_movement (out, ligado a appointment_id)

Checks:

- v_app_stock_snapshot qty_on_hand aumenta con receive y baja con out
- stock_movement tiene appointment_id correcto

## Paso 7 — Cerrar turno

RPC:

- rpc_update_appointment_status (completed)

Checks:

- appointment.status = completed
- vistas reflejan estado actualizado

## Ejecución recomendada

1. Correr el script: scripts/smoke_e2e.sql
2. Si falla, el script debe cortar con error indicando el assert.

## Sub-paso opcional — Upload real del proof (bucket privado)

Si querés validar el upload real a storage (bypasseando RLS via service role):

- Usar el endpoint server `/api/public/deposit/upload` con un archivo real (curl).
- Verificar que el path subido coincide con el proof_path guardado en DB.
