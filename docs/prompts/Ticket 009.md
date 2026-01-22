Actuá como **Lead Frontend Engineer + UX Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar el módulo **Clientes** (MVP) con:
- /app/clientes (lista + búsqueda)
- /app/clientes/[clientId] (perfil + historial)
usando contratos de lectura existentes y, si falta algo, agregar SOLO views nuevas (no RPCs).

ALINEACIÓN
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- AGENTS.md

REGLAS
- Mobile-first estricto.
- Read-first: NO agregar writes salvo que ya existan y sean necesarios.
- Respetar RLS por branch.
- Estados completos (loading/empty/error/success).
- UX rápida: buscar por teléfono debe ser lo más fácil.
- No mostrar acciones sin permiso.

DATA CONTRACT (READ)
- Preferir usar v_app_clients_list (ya existe).
- Para perfil:
  - Si no existe view adecuada, crear view(s) nuevas:
    - v_app_client_detail (cliente + métricas)
    - v_app_client_appointments (historial citas)
    - v_app_client_payments (historial pagos)
    - incluir source/recurrente/referido desde payment_source donde aplique

BÚSQUEDA / FILTROS
- Campo search (client_name o phone) via query param `q=`
- Paginación NO es necesaria en MVP; pero el query debe limitar resultados razonablemente (ej 50) y ordenar:
  - últimos visitados primero si posible; si no, created_at desc

UI REQUISITOS
A) /app/clientes
- Search input sticky arriba
- Lista en cards:
  - nombre (o “Sin nombre”)
  - teléfono
  - last_visit_at (si existe)
  - visits_count
  - total_spent
- Empty:
  - “No encontramos clientes” + tip
- Tap card → /app/clientes/[clientId]

B) /app/clientes/[clientId]
- Header: nombre + teléfono + badge (nuevo/recurrente derivado)
- Secciones:
  - “Resumen” (visitas, gasto total, última visita)
  - “Historial de citas” (fecha, servicio, estado)
  - “Pagos” (fecha, monto, método, cita/walk-in)
  - “Marketing” (top sources, referido_by más común si aplica)
- Todo read-only por ahora.

IMPLEMENTACIÓN
- Queries en lib/queries/clients.ts y lib/queries/client-detail.ts
- Componentes en components/app/clients/*
- Usar server components para fetch; client components solo para search input (que actualice query params).

SI FALTAN VIEWS
- Crear una nueva migración:
  supabase/migrations/<timestamp>_005_client_views.sql
  SOLO con views necesarias (no índices, no RPC).
- Mantener prefijo v_app_*

ACTIVITY LOG
- Agregar entrada:
  “Clientes MVP (lista + perfil + métricas) implementado”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Si agregás views:
  - commit 1: feat(db): client read views
- UI:
  - commit 2: feat(app): clients MVP
- Push
- NO mergear

VALIDACIÓN
- npm run dev
- /app/clientes lista según branch activo
- búsqueda por teléfono funciona
- perfil muestra historial y métricas

EJECUTÁ.
