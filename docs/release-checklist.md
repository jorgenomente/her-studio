# Release Checklist — Her Studio

**Fecha:** 2026-01-21  
**Source of truth:** `docs/core-system-contract.md`, `docs/product-spec-v1.4.md`

## Estado
**PASS** — smoke tests aún pendientes.

## Checks técnicos
- **npm run lint:** ✅ PASS
- **npm run typecheck:** N/A (no existe script)
- **npm run build:** ✅ PASS
  - Warnings: workspace root detectado por lockfiles; middleware deprecated.
- **npx supabase db diff:** ✅ PASS
  - Resultado: "No schema changes found"
- **Migraciones pendientes:** ✅ Verificado (db reset aplicó todas).
- **types/supabase.ts:** ⚠️ No verificado contra schema remoto.
  - Recomendación (no bloqueante):
    - `npx supabase gen types typescript --local > types/supabase.ts`

## Smoke tests manuales (runbook local)
**Setup local:**
- `npx supabase start`
- `npm run dev`

### A) Staff (internal)
- ☐ Login /login → /app redirect
- ☐ Branch context: 1 branch entra directo / N branches selector + data cambia
- ☐ Agenda /app/agenda carga
- ☐ Abrir cita y cambiar estado
- ☐ Registrar/verificar seña (si permisos)
- ☐ POS: cobrar cita + venta sin cita + pagos del día se actualizan
- ☐ Stock: movimiento manual cambia snapshot
- ☐ Compras: crear pendiente + recibir con qty editables → stock sube
- ☐ Clientes: buscar por `q=` + perfil muestra historial/métricas
- ☐ Configuración: staff + disponibilidad
- ☐ Configuración: servicios por sucursal toggles
- ☐ Configuración: usuarios invitar y generar link
- ☐ Seller NO ve /app/configuracion

### B) Público (booking)
- ☐ Landing `/` render OK en mobile
- ☐ `/reservar` flow completo crea appointment
- ☐ Disponibilidad no ofrece slots ocupados
- ☐ Depósito: upload proof; no URL pública; `deposit.proof_url` = path; bucket privado

## Seguridad rápida (high-level)
- Bucket proofs privado: ⚠️ Verificar en consola/storage.
- `/api/public/deposit/upload` usa service role solo server-side: ✅ (por código).
- `rpc_public_*` validaciones mínimas: ✅ (por migraciones; verificar en DB).

## Issues encontrados
- **Medium:** types/supabase.ts no verificado contra schema remoto.

## Acciones tomadas
- `npm run lint` → PASS
- `npm run build` → PASS (con warnings)
- `npx supabase db reset` → OK
- `npx supabase db diff` → PASS ("No schema changes found")

## Recomendación de merge
**SÍ, condicionado a smoke tests PASS**.
