Actuá como **Lead Full-Stack Engineer + Security Engineer** para Her Studio.

OBJETIVO DEL TICKET
Harden el flujo de “seña con comprobante”:
- Los comprobantes NO pueden quedar en bucket público.
- Registrar comprobante en tabla deposit (proof_url) y NO en appointment.notes.
- Mantener reserva pública funcionando.

ALINEACIÓN
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- AGENTS.md

REGLAS
- Mobile-first UX se mantiene.
- No romper rpc_public_create_reservation.
- No exponer SUPABASE_SERVICE_ROLE_KEY al cliente.
- Minimizar cambios: arreglar seguridad + consistencia de datos.

CAMBIOS REQUERIDOS (DB)
1) Storage bucket
- Crear bucket privado: deposit-proofs (NO public)
- Eliminar uso de bucket public-deposits si existe o dejarlo pero no usarlo (documentar deprecado).

2) Deposits
- En lugar de “append proof info en notes”, usar:
  - deposit.amount (si se captura)
  - deposit.proof_url (path en storage)
  - deposit.status (pending por defecto)

3) RPC pública para asociar comprobante (bypass controlado)
Crear:
- rpc_public_attach_deposit_proof(
    p_appointment_id uuid,
    p_amount numeric,
    p_proof_path text
  ) returns void
SECURITY DEFINER + row_security off, con validaciones estrictas:
- appointment existe
- appointment.status es scheduled* (no permitir si completed/cancelled/no_show)
- proof_path no vacío y comienza con prefijo esperado (ej: 'branch/<branch_id>/...')
- upsert en deposit por appointment_id
- status = 'pending'
- NO tocar appointment.notes

CAMBIOS REQUERIDOS (APP)
4) Upload server-side
Reemplazar upload directo al bucket público por un endpoint server:
- app/api/public/deposit/upload/route.ts
  - recibe: appointmentId + file (multipart) o base64 (preferir multipart)
  - usa SUPABASE_SERVICE_ROLE_KEY en server para subir a bucket privado deposit-proofs
  - path recomendado:
    branch/<branch_id>/appointment/<appointment_id>/<random>.<ext>
  - retorna proof_path

5) UI
- components/public/deposit-upload.tsx:
  - al subir:
    a) POST a /api/public/deposit/upload (obtiene proof_path)
    b) llamar rpc_public_attach_deposit_proof con appointment_id + amount + proof_path
  - mostrar success/error claros
- NO escribir nada en notes.

MIGRACIONES
- Crear migración:
  supabase/migrations/<timestamp>_010_deposit_proofs_hardening.sql
  que:
  - crea bucket privado (si lo haces en SQL, usar storage schema apropiado)
  - crea/replace rpc_public_attach_deposit_proof
  - (opcional) comentario deprecando public-deposits

ACTIVITY LOG
- “Hardening depósitos: bucket privado + attach RPC + upload server”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Commits:
  1) feat(db): harden deposit proof handling
  2) feat(app): private deposit proof upload flow
- Push

VALIDACIÓN
- npx supabase db push
- npm run dev
- Crear reserva pública
- Subir comprobante: queda en bucket privado + deposit.proof_url seteado + status pending
- Verificar que no hay URL pública directa expuesta

EJECUTÁ.
