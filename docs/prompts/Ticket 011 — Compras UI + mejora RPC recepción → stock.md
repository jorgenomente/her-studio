Actuá como **Lead Full-Stack Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar el módulo **Compras** (MVP):
- UI /app/compras (lista + detalle)
- Crear compra con items
- Recibir compra con cantidades editables
y cerrar el ciclo de stock:
- Al recibir compra, crear automáticamente stock_movement tipo 'in' por cada item recibido.

ALINEACIÓN
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- AGENTS.md

REGLAS
- Mobile-first estricto.
- No usar triggers.
- Usar RPCs existentes, pero se permite mejorarlas.
- Mantener RLS.
- Estados completos (loading/empty/error/success).
- Acciones visibles SOLO con permiso stock (can_manage_stock).

DATA CONTRACT (READ)
Usar views existentes:
- v_app_purchases_list
- v_app_purchase_detail

DATA CONTRACT (WRITE)
- rpc_create_purchase (ya existe)
- rpc_receive_purchase (ya existe) → MODIFICAR para que:
  - para cada purchase_item con quantity_received > 0:
    - inserte stock_movement:
      - branch_id = purchase.branch_id
      - product_id
      - movement_type = 'in'
      - quantity = quantity_received
      - reason = 'purchase_received'
      - purchase_id = p_purchase_id
  - Debe ser idempotente:
    - si ya se recibió (status=received), NO duplicar movimientos (devolver error o no-op)
  - Debe setear purchase.status='received' y received_at=now()

UI / UX
A) /app/compras (lista)
- Lista de compras (pendiente/recibida) con:
  - fecha ordered_at
  - status badge
  - items_count (si existe)
- CTA: “Nueva compra” (drawer/modal)
  - seleccionar productos de la sucursal (product)
  - items: product + qty ordered + unit_cost opcional
  - submit → rpc_create_purchase

B) /app/compras/[purchaseId] (detalle)
- Mostrar:
  - status + ordered_at + received_at
  - lista de items: product, qty ordered, qty received
- Si status = pending:
  - CTA “Recibir compra”
  - UI editable para qty received por item (default = qty ordered)
  - submit → rpc_receive_purchase
  - success → refrescar y ahora status received

C) Guardrails
- Si qty_received = 0 para todos, no tocar stock (pero permitir marcar received solo si confirmás al menos 1 item recibido; si todo 0, mostrar error UX).
- Confirmación simple antes de “Recibir compra” (1 modal).

IMPLEMENTACIÓN
1) DB
- Crear nueva migración:
  supabase/migrations/<timestamp>_006_receive_purchase_stock.sql
  que ALTER/REPLACE rpc_receive_purchase con comportamiento de stock_movement.
- Agregar smoke checks al final.

2) UI
- Rutas:
  - app/app/compras/page.tsx + loading.tsx
  - app/app/compras/[purchaseId]/page.tsx + loading.tsx
- Queries:
  - lib/queries/purchases.ts
- Actions:
  - lib/actions/purchases.ts (createPurchaseAction, receivePurchaseAction)
- Componentes:
  - components/app/purchases/*

ACTIVITY LOG
- Agregar entrada:
  “Compras MVP (crear + recibir + stock automático) implementado”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Commits:
  1) feat(db): receive purchase creates stock movements
  2) feat(app): purchases MVP
- Push
- NO mergear

VALIDACIÓN
- npx supabase db push
- npm run dev
- Crear compra pendiente
- Recibir compra con cantidades editadas
- Ver que /app/stock snapshot sube automáticamente

EJECUTÁ.
