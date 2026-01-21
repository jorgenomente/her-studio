# Release Checklist — Her Studio

**Fecha:** 2026-01-21  
**Source of truth:** `docs/core-system-contract.md`, `docs/product-spec-v1.4.md`

## Estado
**FAIL** — Lint con errores y `supabase db diff` no pudo ejecutarse.

## Checks técnicos
- **npm run lint:** ❌ FAIL
  - Errores `@typescript-eslint/no-explicit-any` en varios archivos `/app` y `/lib/queries/*`.
  - Errores `react-hooks/set-state-in-effect` en `components/public/booking-date-selector.tsx`.
- **npm run typecheck:** N/A (no existe script)
- **npm run build:** ✅ PASS
  - Warnings: workspace root detectado por lockfiles; middleware deprecated.
- **npx supabase db diff:** ❌ FAIL
  - Error: puerto 54320 en uso al crear shadow DB.
  - Requiere `supabase stop --project-id her-studio` o cambiar puerto en `supabase/config.toml`.
- **Migraciones pendientes:** ⚠️ No verificado (db diff falló).
- **types/supabase.ts:** ⚠️ No verificado contra schema remoto. Recomendar `supabase gen types` antes de merge.

## Smoke tests manuales
> No ejecutados en este entorno (requiere entorno local + datos reales). Marcar como pendientes.

### A) Staff (internal)
- Login /login → /app redirect: ⏳
- Branch context (1 vs N): ⏳
- Agenda carga + cambiar estado: ⏳
- Registrar/verificar seña (permisos): ⏳
- POS cobrar cita / venta sin cita / pagos del día: ⏳
- Stock movimiento manual y snapshot: ⏳
- Compras crear/recibir + stock sube: ⏳
- Clientes búsqueda + perfil con métricas: ⏳
- Configuración staff + disponibilidad: ⏳
- Servicios por sucursal toggles: ⏳
- Usuarios invitar y generar link: ⏳
- Seller NO ve /app/configuracion: ⏳

### B) Público (booking)
- Landing / render mobile: ⏳
- /reservar flow completo crea appointment: ⏳
- Disponibilidad sin solapados: ⏳
- Depósito: upload proof, no URL pública, proof_path guardado, bucket privado: ⏳

## Seguridad rápida (high-level)
- Bucket proofs privado: ⚠️ No verificado (migración aplicada, falta check en consola).
- /api/public/deposit/upload usa service role solo server-side: ✅ (por código).
- rpc_public_* validaciones mínimas: ✅ (por migraciones; requiere verificación en DB).

## Issues encontrados
- **Blocker:** Lint falla (35 errores). Requiere corrección o aprobación explícita para ignorar.
- **High:** `supabase db diff` no corre por puerto ocupado (no confirma drift).
- **Medium:** types/supabase.ts no verificado contra schema remoto.

## Acciones tomadas
- Se ejecutó `npm run lint` (falló) y `npm run build` (pass con warnings).
- Se intentó `npx supabase db diff` (falló por puerto 54320 ocupado).

## Recomendación de merge
**NO** por ahora.
- Resolver lint o aprobar excepción.
- Ejecutar `supabase db diff` exitoso y completar smoke tests manuales.

