Actuá como **Lead Frontend Engineer + UX Engineer** para Her Studio (Next.js 16 App Router).

OBJETIVO DEL TICKET
Implementar la base de la app interna (MVP) con:
- Auth staff (Supabase)
- Layout global mobile-first (shadcn/ui)
- Navegación por módulos
- Contexto de sucursal (branch selector cuando aplique)
- Guards por rol/permisos (no mostrar acciones sin permiso)

ALINEACIÓN OBLIGATORIA
- docs/product-spec-v1.4.md
- docs/core-system-contract.md
- AGENTS.md

REGLAS
- NO implementar pantallas completas de negocio aún (agenda/pos/etc). Solo Shell + placeholders.
- NO usar service role key en el cliente.
- Usar @supabase/ssr para auth en server.
- Mobile-first real (bottom nav en mobile o sidebar colapsable).
- Estados completos (loading/empty/error).
- UX: no mostrar acciones sin permiso.
- Preparar estructura para pantallas:
  /app/agenda
  /app/pos
  /app/clientes
  /app/stock
  /app/compras
  /app/reportes
  /app/configuracion

DATOS / CONTRATOS
- Para branch context, usar tabla branch + user_branch_role para listar sucursales asignadas.
- Superadmin ve todas las sucursales.
- Admin/seller ven solo asignadas.
- El selector se muestra si el usuario tiene 2+ branches asignadas O si es superadmin.
- Persistir branch activo en:
  - cookie (server-readable) y
  - localStorage (client convenience)
  preferir cookie como source of truth para SSR.

IMPLEMENTACIÓN ESPERADA (estructura)
1) Auth plumbing:
- lib/supabase/server.ts (createServerClient)
- lib/supabase/client.ts (createBrowserClient)
- middleware.ts para proteger rutas /app/*
- /login page con formulario simple (email + magic link o password si ya existe)

2) App Shell:
- /app/layout.tsx con:
  - Topbar: título + branch selector (si aplica) + user menu
  - Nav: módulos (condicional por permiso)
  - Main content slot

3) Permisos:
- Resolver permisos en server:
  - role, flags (can_manage_agenda/payments/stock)
- Exponer un hook/useSessionContext para UI.

4) Placeholders:
- Cada ruta de módulo debe renderizar:
  - título
  - breve descripción
  - “Under construction”
  - (no lógica)

ACTIVITY LOG
- Actualizar docs/activity-log.md:
  “App shell + Auth staff + branch context (base)”

GIT (AUTÓNOMO)
- Crear rama nueva: feature/app-shell-auth
- Commits sugeridos:
  1) feat(app): auth + middleware
  2) feat(app): app shell + navigation + branch context
- Push al finalizar
- NO mergear a main

VALIDACIÓN
- npm run dev
- navegar a /login
- login exitoso
- /app protegido (redirige si no hay sesión)
- branch selector aparece cuando corresponde

EJECUTÁ.

