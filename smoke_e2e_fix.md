# Smoke E2E — errores detectados

Fecha: 2026-01-22
Script: `scripts/smoke_e2e.sql`

## Error 1 — JWT context no aplicado (auth.uid() null)

**Salida relevante**

```
--- Set JWT context (admin) ---
set_config
{"sub" : "76731344-51c6-4077-9cf2-ba991bb87bc1", "role" : "authenticated"}
ERROR:  ASSERT FAIL: auth.uid() is null (JWT context not applied)
CONTEXT:  PL/pgSQL function inline_code_block line 4 at RAISE
```

**Ubicación en script**

- `scripts/smoke_e2e.sql`: bloque “sanity” (después de `set_config('request.jwt.claims', ...)`).

**Diagnóstico probable**
Los `set_config(..., true)` son **locales a la transacción**. En psql cada statement autocommit crea una transacción nueva, así que los GUC no sobreviven al siguiente statement y `auth.uid()` queda `NULL`.

**Fix sugerido**

- Usar `set_config(..., false)` para que el setting persista en la sesión, **o**
- Envolver el script completo en `BEGIN; ... COMMIT;` y mantener `true`.

**Impacto**
El smoke test se detiene en el primer assert y no ejecuta el resto del flujo.

---

## Error 2 — Variables psql dentro de DO $$ no se expanden

**Salida relevante**

```
--- Step 1: public services ---
ERROR:  syntax error at or near ":"
LINE 5:   from rpc_public_list_branch_services(:'branch_id'::uuid);
```

**Ubicación en script**

- `scripts/smoke_e2e.sql`: primer bloque `DO $$` (Step 1).

**Diagnóstico probable**
`psql` **no expande variables** dentro de `$$ ... $$` (dollar-quoted). Entonces `:'branch_id'` llega literal a Postgres y rompe el parsing.

**Fix sugerido**
Mover valores a GUCs y leerlos dentro del DO con `current_setting()`:

- Antes del DO: `select set_config('smoke.branch_id', :'branch_id', false);`
- Dentro del DO: `current_setting('smoke.branch_id')::uuid`

**Impacto**
El script falla antes de crear la reserva y no avanza el flujo.

---

## Error 3 — Firma inválida en rpc_create_payment_for_appointment

**Salida relevante**

```
--- Step 5: create payment ---
ERROR:  function rpc_create_payment_for_appointment(p_branch_id => uuid, p_appointment_id => uuid, p_amount => integer, p_method => unknown, p_source => unknown, p_is_recurrent => boolean, p_referred_by => unknown, p_paid_at => timestamp with time zone, p_notes => unknown) does not exist
HINT:  No function matches the given name and argument types. You might need to add explicit type casts.
```

**Ubicación en script**

- `scripts/smoke_e2e.sql`: Step 5 (create payment).

**Diagnóstico probable**
La función definida en DB **no tiene** `p_notes` y **sí** incluye `p_client_id`. Además `p_amount`, `p_method` y `p_source` deben castear a `numeric` y enums `public.payment_method` / `public.payment_source_type`.

**Fix sugerido**
Actualizar el llamado:

- Remover `p_notes`
- Agregar `p_client_id => null`
- Casts explícitos:
  - `p_amount => 30000::numeric`
  - `p_method => 'cash'::public.payment_method`
  - `p_source => 'walk_in'::public.payment_source_type`

**Impacto**
El flujo se corta antes de crear el pago y receipt.

---

## Error 4 — Firma inválida en rpc_create_stock_movement

**Salida relevante**

```
--- Step 6: stock movement OUT ---
ERROR:  function rpc_create_stock_movement(p_branch_id => uuid, p_product_id => uuid, p_direction => unknown, p_qty => integer, p_reason => unknown, p_appointment_id => uuid, p_notes => unknown) does not exist
HINT:  No function matches the given name and argument types. You might need to add explicit type casts.
```

**Ubicación en script**

- `scripts/smoke_e2e.sql`: Step 6 (stock movement OUT).

**Diagnóstico probable**
La firma real usa:

- `p_movement_type` (enum `public.stock_movement_type`)
- `p_quantity` (numeric)
- **No** existe `p_direction`, `p_qty` ni `p_notes`.

**Fix sugerido**
Actualizar el llamado:

- `p_movement_type => 'out'::public.stock_movement_type`
- `p_quantity => 2::numeric`
- Remover `p_notes`

**Impacto**
El flujo se corta antes de registrar el egreso de stock.

---

## Error 5 — Firma inválida en rpc_update_appointment_status

**Salida relevante**

```
--- Step 7: close appointment ---
ERROR:  function rpc_update_appointment_status(p_branch_id => uuid, p_appointment_id => uuid, p_status => unknown) does not exist
HINT:  No function matches the given name and argument types. You might need to add explicit type casts.
```

**Ubicación en script**

- `scripts/smoke_e2e.sql`: Step 7 (close appointment).

**Diagnóstico probable**
La firma real usa `p_new_status` con enum `public.appointment_status`. El script usa `p_status` sin cast.

**Fix sugerido**
Actualizar el llamado:

- `p_new_status => 'completed'::public.appointment_status`

**Impacto**
El flujo no llega a cerrar la cita.
