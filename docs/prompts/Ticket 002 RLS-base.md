2Actuá como **Lead Backend Engineer + Security Architect** para el proyecto **Her Studio**.

OBJETIVO DEL TICKET
Implementar la **capa base de Row Level Security (RLS)** para el esquema ya aplicado,
alineada 1:1 con:
- docs/core-system-contract.md (SOURCE OF TRUTH)
- docs/product-spec-v1.4.md
- AGENTS.md

Este ticket define:
- enable RLS en todas las tablas operativas
- helpers de rol y sucursal (patrón consistente)
- policies base de READ / WRITE por rol
- smoke checks manuales documentados

REGLAS ESTRICTAS
- SQL puro (Supabase / PostgreSQL).
- NO crear views todavía.
- NO crear RPC/functions todavía.
- NO lógica en triggers.
- NO bypass de RLS.
- Toda policy debe filtrar por:
  - branch_id
  - rol (superadmin / admin / seller)
- Usar auth.uid() como identidad base.
- profiles + user_branch_role son la fuente de permisos.

TABLAS A CUBRIR (MVP)
CORE
- organization
- branch
- profiles
- user_branch_role
- staff
- staff_availability
- service
- branch_service
- client
- appointment
- deposit
- payment
- receipt

STOCK
- product
- recipe
- recipe_item
- stock_movement
- purchase
- purchase_item

ANALYTICS
- payment_source

PATRÓN DE SEGURIDAD (OBLIGATORIO)
- Superadmin:
  - acceso total (controlado, no abierto)
- Admin:
  - solo registros con branch_id asignado
- Seller:
  - solo branch_id asignado
  - escritura limitada por flags:
    - can_manage_agenda
    - can_manage_payments
    - can_manage_stock

IMPLEMENTACIÓN ESPERADA
1) Enable RLS en todas las tablas listadas.
2) Crear helpers SQL reutilizables (ej):
   - is_superadmin()
   - has_branch_access(branch_id)
   - has_permission(branch_id, permission_flag)
3) Policies claras:
   - SELECT (lectura)
   - INSERT / UPDATE / DELETE (según rol)
4) Comentarios SQL breves explicando cada grupo de policies.

ENTREGABLE
- Nueva migración:
  supabase/migrations/<timestamp>_002_rls_base.sql
- El archivo debe:
  - ser ejecutable con `npx supabase db push`
  - NO romper accesos legítimos
- Actualizar docs/activity-log.md con:
  - “RLS base implementado”
  - fecha
  - alcance

GIT (AUTÓNOMO)
- Rama: mantener `feature/db-init-schema`
- Commit:
  feat(security): base RLS policies
- Push al finalizar
- NO mergear a main todavía

NOTAS
- Si una policy es ambigua, elegir la opción MÁS restrictiva.
- Si algo no está claro, seguir estrictamente core-system-contract.md.
- No pedir confirmación salvo bloqueo real.

EJECUTÁ.
