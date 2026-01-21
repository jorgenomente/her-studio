Actuá como **Lead Full-Stack Engineer + UX Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar el módulo de **Dashboard + Reportes** (MVP), mobile-first, basado en contratos de lectura.

Pantallas:
- /app/dashboard
- /app/reportes

ALINEACIÓN
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- AGENTS.md

REGLAS
- Mobile-first estricto.
- Read-only en este ticket (NO writes).
- Si faltan datos para reportes, crear SOLO views nuevas (no RPC).
- Estados completos (loading/empty/error/success).
- No inventar “ganancia” (no hay costos aún).
- Evitar charts complejos; preferir cards + tablas simples (shadcn).

DATA CONTRACT EXISTENTE
- Dashboard hoy: v_app_dashboard_day (ya existe)
- Para reportes: si no hay views, crear nuevas.

REPORTES MVP REQUERIDOS (por sucursal y global para superadmin)
1) Ingresos por período (día/semana/mes, rango simple)
   - total
   - breakdown por método (cash/transfer/card/other)

2) Ingresos por fuente (payment_source.source)
   - conteo + total amount

3) Nuevos vs recurrentes (payment_source.is_recurrent)
   - conteo + total amount

4) Top servicios por cantidad y por ingreso
   - Solo si se puede derivar (si payment asociado a appointment y appointment tiene service)
   - Si no es posible con contrato actual, documentar limitación y dejarlo fuera.

PERMISOS / SCOPE
- Admin: solo su branch
- Seller: lectura parcial (si no hay regla explícita, permitir lectura a quien tenga acceso al dashboard; si hay duda, más restrictivo: solo admin/superadmin)
- Superadmin:
  - puede ver:
    A) dashboard de branch activo (igual que admin)
    B) vista global (consolidado de todas las sucursales) en /app/dashboard?scope=global o sección separada
  - Si faltan views globales, crearlas (v_app_dashboard_global_day, v_app_reports_global_*)

VIEWS A CREAR (si hacen falta)
- v_app_reports_income_by_day (branch_id, date, total_amount, counts)
- v_app_reports_income_by_method (branch_id, date_range bucket, method, total_amount, count)
- v_app_reports_income_by_source (branch_id, date_range bucket, source, total_amount, count)
- v_app_reports_income_recurrent_split (branch_id, date_range bucket, is_recurrent, total_amount, count)
- Si se implementa top servicios:
  - v_app_reports_top_services (branch_id, date_range bucket, service_id, service_name, count, total_amount)

Mantenerlo simple:
- Soportar filtro por rango: from/to en la query de la app (no materialized views).
- Las views pueden ser “base” (sin filtro) y la app filtra por paid_at.

UI / UX
A) /app/dashboard
- Cards:
  - ingresos hoy
  - citas hoy
  - no-shows
  - pendientes de cobro
  - stock bajo (si existe)
- Si superadmin:
  - toggle “Sucursal actual / Global” (solo si hay datos)
- Empty state si no hay datos.

B) /app/reportes
- Selector de rango:
  - hoy / últimos 7 días / mes actual / custom (from-to)
- Secciones:
  - Total ingresos + breakdown por método
  - Fuentes (tabla)
  - Recurrente vs nuevo (cards)
  - Top servicios (si aplica)

IMPLEMENTACIÓN
- Queries:
  - lib/queries/dashboard.ts
  - lib/queries/reports.ts
- Componentes:
  - components/app/dashboard/*
  - components/app/reports/*
- Rutas:
  - app/app/dashboard/page.tsx + loading.tsx
  - app/app/reportes/page.tsx + loading.tsx
- Usar search params para rango (?from=...&to=... o preset=7d)

ACTIVITY LOG
- Agregar entrada:
  “Dashboard + Reportes MVP implementado”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Si hay nuevas views:
  - commit 1: feat(db): reports read views
- UI:
  - commit 2: feat(app): dashboard and reports MVP
- Push
- NO mergear

VALIDACIÓN
- npx supabase db push (si hay views nuevas)
- npm run dev
- dashboard renderiza métricas
- reportes cambian con rango
- superadmin ve opción global si existe

EJECUTÁ.
