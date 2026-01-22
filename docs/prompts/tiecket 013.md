Actuá como **Lead Full-Stack Engineer + UX Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar el módulo **Configuración** (MVP) para que el sistema sea operable sin devs.
Incluye 3 secciones:
1) Staff + Disponibilidad
2) Servicios por sucursal (branch_service)
3) Usuarios (invitación + roles/flags + asignación a sucursales)

ALINEACIÓN
- docs/core-system-contract.md (source of truth)
- docs/product-spec-v1.4.md
- AGENTS.md

REGLAS
- Mobile-first estricto.
- UX simple (formularios cortos, modales/drawers).
- Acceso:
  - Admin: solo su(s) sucursal(es)
  - Superadmin: todas + gestión de sucursales (placeholder o mínimo)
  - Seller: sin acceso
- Si faltan RPCs, crearlas (SQL) con validaciones y RLS.
- No procesar email real todavía si no está Resend configurado:
  - Implementar “invite token” + email placeholder o mostrar “copiar link de invitación”.

SECCIÓN 1 — Staff + Disponibilidad
Pantallas dentro de /app/configuracion:
- Tab “Staff”
  - lista de staff (branch activo)
  - crear/editar/desactivar staff
  - detalle staff con disponibilidad semanal

DATA
- staff, staff_availability
VIEWS
- Si falta, crear:
  - v_app_staff_list
  - v_app_staff_detail
  - v_app_staff_availability

RPCs (si faltan)
- rpc_create_staff(branch_id, full_name, email?, phone?)
- rpc_update_staff(staff_id, branch_id, fields...)
- rpc_set_staff_availability(staff_id, branch_id, availability jsonb)
  availability: [{weekday, start_time, end_time, is_active}]
Validaciones:
- no rangos solapados por staff + weekday
- start_time < end_time
Permisos:
- admin/superadmin write, seller no

SECCIÓN 2 — Servicios por sucursal (habilitar/availability)
Tab “Servicios”
- mostrar catálogo global (service) con estado por sucursal (branch_service)
- toggles:
  - is_enabled
  - is_available
- search por nombre

DATA
- service, branch_service
VIEW (si falta):
- v_app_branch_services (join service + branch_service para branch activo)
RPC (si falta):
- rpc_set_branch_service_state(branch_id, service_id, is_enabled, is_available)
Validaciones:
- service.is_active=true
- branch match
Permisos:
- admin/superadmin

SECCIÓN 3 — Usuarios (invitar y asignar)
Tab “Usuarios”
- listar usuarios asignados a la(s) sucursal(es) visibles
- invitar usuario:
  - email obligatorio
  - full_name opcional
  - asignación de branch + role (admin/seller) + flags (agenda/payments/stock)
- editar:
  - activar/desactivar asignación
  - flags
  - role (dentro de su scope)

INVITACIÓN (MVP)
Implementar invitación segura SIN password compartida:
- Crear tabla invites (si no existe) con:
  - id uuid
  - email
  - branch_id
  - role + flags
  - token (random)
  - expires_at
  - used_at
- RPC:
  - rpc_create_invite(branch_id, email, role, flags) returns {invite_id, token}
  - rpc_accept_invite(token, password? | magiclink?) -> crear auth user y profiles + user_branch_role
Para MVP UI:
- al crear invite mostrar “link de invitación” para copiar:
  /invite/<token>
- Implementar route pública /invite/[token] con flujo:
  - validar token
  - set password (o magic link si ya está)
  - crear cuenta
  - redirect a /login
Si auth password no está habilitado, documentar y usar magic link.

Permisos:
- superadmin: invita a cualquier branch
- admin: invita solo a sus branches
- seller: no

NOTAS
- Si implementar invite completo en Auth es demasiado, alternativa MVP aceptable:
  - solo generar token + link
  - y en /invite, usar supabase.auth.signUp con email+password
  - luego en server action, asignar roles según invite.

ENTREGABLES
A) DB (si hace falta)
- Migración nueva:
  supabase/migrations/<timestamp>_008_settings_staff_services_users.sql
  - nuevas views + nuevas RPCs + tabla invites (si aplica)
B) UI
- /app/configuracion/page.tsx con tabs (Staff/Servicios/Usuarios/Sucursales[solo superadmin placeholder])
- componentes en components/app/settings/*
- queries en lib/queries/settings.ts
- actions en lib/actions/settings.ts

ACTIVITY LOG
- Agregar entrada:
  “Configuración MVP (staff, servicios por sucursal, usuarios/invites) implementado”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Commits:
  1) feat(db): settings views and RPCs (and invites)
  2) feat(app): settings module MVP
- Push
- NO mergear a main

VALIDACIÓN
- npx supabase db push
- npm run dev
- admin puede gestionar staff + disponibilidad en su branch
- admin puede toggle servicios
- admin puede invitar seller/admin a su branch y copiar link
- seller no ve configuración

EJECUTÁ.


fix

Actuá como **Senior Backend Engineer (Postgres/Supabase) + Release Engineer** para el repo **her-studio**.

OBJETIVO DEL TICKET
Desbloquear `npx supabase db push` arreglando el error Postgres **42P13** en la migración existente
`20260121210947_008_settings_staff_services_users.sql` (rpc_create_invite con DEFAULT antes de no-default),
y luego aplicar/pushear el hardening de depósitos (migración 010) + commits correspondientes.

CONTEXTO
- `npx supabase db push` está fallando porque en la migración 008 la función `rpc_create_invite` tiene una firma inválida:
  “default parameter cannot precede non-default parameter”.
- La migración 010 (deposit hardening) ya está creada pero no puede aplicarse hasta que 008 se arregle.
- Estamos en la rama: `feature/app-shell-auth`.

REGLAS
- NO crear una nueva migración para este fix: como la 008 aún no se aplicó (bloquea el push), se permite corregirla in-place.
- No cambiar lógica de negocio de invites; solo corregir el orden de parámetros para cumplir Postgres.
- Mantener compatibilidad con el código existente que llama la RPC:
  - Preferir que la firma final siga aceptando los mismos datos (si es necesario, ajustar llamadas para usar argumentos nombrados).
- Al finalizar: `npx supabase db push` debe correr sin errores.

TAREAS (PASO A PASO)
1) Abrir y editar:
   `supabase/migrations/20260121210947_008_settings_staff_services_users.sql`
   - Encontrar `create or replace function rpc_create_invite(...)`
   - Corregir la firma para que:
     - Todos los parámetros SIN DEFAULT estén primero
     - Los parámetros CON DEFAULT estén al final
   - Ejemplo de regla:
     rpc_create_invite(
       p_branch_id uuid,
       p_email text,
       p_role public.user_role,
       p_can_manage_agenda boolean,
       p_can_manage_payments boolean,
       p_can_manage_stock boolean,
       p_expires_at timestamptz DEFAULT (now() + interval '7 days')
     )
   - NO cambiar el cuerpo salvo que sea estrictamente necesario para compilar.

2) Buscar en el repo cualquier referencia a `rpc_create_invite`:
   - Si se llama por posición y el orden cambió, actualizar esas llamadas para usar argumentos por nombre
     o ajustarlas al nuevo orden.
   - Preferir argumentos por nombre para evitar futuros errores.

3) Ejecutar:
   - `npx supabase db push`
   - Confirmar que aplica migraciones pendientes incluyendo la 010:
     `20260121223000_010_deposit_proofs_hardening.sql`

4) Git (AUTÓNOMO, sin preguntar)
   - Stage + commit del fix de migración 008:
     - Commit: `fix(db): reorder rpc_create_invite params`
   - Stage + commit de la migración 010 + types/activity-log si quedaron sin commitear:
     - Commit: `feat(db): harden deposit proof handling`
   - Stage + commit de los cambios app del upload privado si quedaron sin commitear:
     - Commit: `feat(app): private deposit proof upload flow`
   - Push de la rama:
     - `git push origin feature/app-shell-auth`

SALIDA ESPERADA
- Un resumen corto con:
  - archivos tocados
  - comandos ejecutados
  - resultado de `npx supabase db push`
  - lista de commits creados (hash + mensaje)

EJECUTÁ TODO.
