Actuá como **Lead Backend Engineer + Database Architect** para el proyecto **Her Studio**.

OBJETIVO DE ESTE TICKET
Crear la **primera migración SQL (modelo de datos base)** alineada 1:1 con:
- docs/core-system-contract.md (SOURCE OF TRUTH)
- docs/product-spec-v1.4.md
- docs/step-0-plan-v2.md
- AGENTS.md

Esta migración define **SOLO el esquema inicial**:
- tablas
- claves primarias / foráneas
- enums necesarios
- constraints estructurales
NO incluye RLS todavía (eso será el próximo ticket).

REGLAS ESTRICTAS
- SQL puro (PostgreSQL / Supabase compatible).
- NO crear policies RLS aún.
- NO crear views.
- NO crear funciones/RPC.
- NO lógica de negocio en triggers.
- Todas las tablas operativas DEBEN tener `branch_id`.
- Usar `uuid` como PK.
- Usar `timestamptz` para fechas.
- Usar `created_at`, `updated_at` en tablas core.
- Nombrar tablas y columnas en `snake_case`.
- Enums solo si son claros y estables.
- El esquema debe permitir el MVP sin bloqueos, no sobre-ingenierizar.

ALCANCE DE LA MIGRACIÓN
Debés crear las tablas (mínimas pero completas) para:

CORE
- organization (única)
- branch
- user (auth reference, no duplicar auth.users)
- user_branch_role
- staff
- staff_availability
- service
- client
- appointment
- deposit
- payment
- receipt

STOCK
- product
- stock_movement
- recipe
- recipe_item
- purchase
- purchase_item

ANALYTICS BÁSICO
- payment_source (fuente adquisición / referido / recurrente flag)

REQUISITOS CLAVE DEL MODELO
- organization → branch (1–N)
- branch → todo lo operativo
- staff NO depende de user (puede existir sin login)
- client es guest-first, celular único por organización
- appointment NO puede existir sin staff, service y branch
- payment puede existir sin appointment (venta sin cita)
- receipt es 1–1 con payment
- purchase NO afecta stock hasta recepción (campo estado)
- stock_movement siempre impacta stock real
- recipe es opcional por service

ENTREGABLE
- Crear archivo:
  supabase/migrations/<timestamp>_001_init_schema.sql
- El archivo debe:
  - Crear tablas en orden correcto
  - Definir PK, FK, UNIQUE, CHECK básicos
  - Ser ejecutable con `npx supabase db push`

GIT (AUTÓNOMO)
- Crear rama: `feature/db-init-schema`
- Commit:
  - `feat(db): initial core schema`
- Push de la rama cuando el archivo esté completo y consistente
- NO mergear a main todavía

NOTAS
- Si detectás una ambigüedad BLOQUEANTE del contrato, DETENÉ el trabajo y devolvé SOLO una lista corta de preguntas.
- Si no hay bloqueos, implementá sin preguntar.

Ahora ejecutá este ticket.


Fixes

Actuá como Lead Database Architect para Her Studio.

OBJETIVO
Alinear el esquema a docs/core-system-contract.md y product-spec-v1.4.md corrigiendo:
1) `service` debe ser catálogo global (sin branch_id)
2) crear tabla `branch_service` para habilitación/disponibilidad por sucursal
3) reemplazar `public."user"` por `profiles` (referenciando auth.users)
4) ajustar FKs dependientes (user_branch_role, auditables, etc.) para usar profiles.user_id

REGLAS
- SQL puro, Supabase compatible.
- NO agregar RLS todavía.
- NO views.
- NO RPC.
- Mantener uuid PK, created_at/updated_at, timestamptz.
- Mantener cambios mínimos y coherentes.

CONDICIÓN (muy importante)
- Si `npx supabase db push` NO se ejecutó aún en este entorno, EDITAR la migración existente:
  supabase/migrations/20260121180725_001_init_schema.sql
- Si YA fue aplicada en una DB, crear una nueva migración:
  supabase/migrations/<timestamp>_002_schema_fixes.sql
  que haga los cambios con ALTER TABLE / migración segura.

DETAILS (diseño objetivo)
- service: global
  - id, name, duration_min, price_base, is_active, created_at, updated_at
- branch_service:
  - branch_id, service_id, is_enabled, is_available, created_at, updated_at
  - UNIQUE(branch_id, service_id)
- profiles:
  - user_id (PK, FK auth.users.id), email cache opcional, full_name, status, created_at, updated_at
- user_branch_role:
  - user_id -> profiles.user_id
  - branch_id, role, flags

GIT (AUTÓNOMO)
- Mantener la rama existente: feature/db-init-schema
- Commit: `fix(db): align services catalog + profiles`
- Push

ENTREGABLE
- Cambios en migración 001 o nueva migración 002 según corresponda.
- Resumen final de lo modificado y comandos para validar.

EJECUTÁ.

editar la migracion:

Actuá como Database Architect para Her Studio.

OBJETIVO
Ajustar la migración existente:
supabase/migrations/20260121180725_001_init_schema.sql
ANTES de aplicar db push, corrigiendo 3 puntos:

1) recipe: el unique de service_id está mal para multi-sucursal
   - Cambiar a UNIQUE(branch_id, service_id)
   - Quitar UNIQUE(service_id) individual

2) payment_source: evitar redundancia de "recurrent"
   - Remover 'recurrent' del enum payment_source_type
   - Mantener is_recurrent boolean como indicador de recurrente

3) client: evitar atar identidad global a branch obligatorio
   - Cambiar branch_id a nullable (o renombrar a home_branch_id nullable)
   - Mantener unique(organization_id, phone)
   - Si renombrás columna, actualizá FKs de appointment/payment a client sin cambios funcionales.

REGLAS
- SQL puro, Supabase compatible.
- NO RLS todavía.
- NO views ni RPCs.
- Mantener cambios mínimos.

GIT (AUTÓNOMO)
- Rama: feature/db-init-schema (mantener)
- Commit: fix(db): init schema corrections
- Push

ENTREGABLE
- Migración 001 actualizada.
- Resumen breve de los cambios.

EJECUTÁ.
