Actuá como **Lead Frontend Engineer + UX Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar el módulo **Stock** (MVP):
- /app/stock (lista snapshot + búsqueda)
- registrar movimientos manuales desde UI (modal/drawer)
usando:
- View: v_app_stock_snapshot
- RPC: rpc_create_stock_movement

ALINEACIÓN
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- AGENTS.md

REGLAS
- Mobile-first estricto.
- NO implementar compras en este ticket.
- NO automatizar recetas/consumo en este ticket.
- Acciones visibles SOLO con permiso de stock (can_manage_stock).
- Estados completos (loading/empty/error/success).

DATA CONTRACT (READ)
- v_app_stock_snapshot filtrado por branch activo
Campos UI:
- product_name, unit, qty_on_hand, stock_min, is_low_stock

DATA CONTRACT (WRITE)
- rpc_create_stock_movement(
    p_branch_id,
    p_product_id,
    p_movement_type,
    p_quantity,
    p_reason,
    p_appointment_id,
    p_purchase_id
  )
En UI: appointment_id y purchase_id quedan null (por ahora).

UI / UX
A) /app/stock
- Search sticky (q=) por nombre de insumo
- Lista en cards:
  - nombre + unidad
  - qty_on_hand grande
  - badge “Bajo” si is_low_stock
- CTA primario (si permiso): “Movimiento”
  - abre modal/drawer

B) Modal de movimiento
- Seleccionar producto (si abrís desde card, ya viene seleccionado)
- Tipo: segmented control (in/out/waste/adjustment)
- Cantidad (numeric)
- Motivo (opcional)
- Confirmar:
  - llama RPC
  - success toast
  - refresh snapshot

C) Guardrails UX
- Si qty_on_hand está bajo, resaltar.
- Confirmación solo para waste (opcional) y out de cantidad alta (no bloquear MVP).

IMPLEMENTACIÓN
- Ruta: app/app/stock/page.tsx + loading.tsx
- Query: lib/queries/stock.ts
- Mutations: server actions llamando RPC (lib/actions/stock.ts)
- Componentes: components/app/stock/*

ACTIVITY LOG
- Agregar entrada:
  “Stock MVP (snapshot + movimientos manuales) implementado”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Commit: feat(app): stock MVP
- Push

VALIDACIÓN
- npm run dev
- /app/stock renderiza snapshot
- movimiento manual crea stock_movement y snapshot cambia
- UI oculta acciones si no hay can_manage_stock

EJECUTÁ.
