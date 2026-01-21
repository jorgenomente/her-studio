Actuá como **Lead Frontend Engineer + Product Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar la pantalla **/app/agenda/[appointmentId]** (detalle de cita real),
con lectura completa y acciones mínimas de operación diaria.

ALINEACIÓN
- docs/core-system-contract.md
- docs/product-spec-v1.4.md
- AGENTS.md
- Views existentes + RPCs ya implementadas

REGLAS
- Mobile-first estricto.
- NO implementar cobro todavía.
- Usar RPCs existentes (no crear nuevas).
- Acciones visibles SOLO si el usuario tiene permiso.
- Estados completos (loading/empty/error/success).
- UX clara para staff no técnico.

DATA CONTRACT (READ)
- Fuente: view v_app_appointment_detail
- Datos a mostrar:
  - Fecha y horario (start_at / end_at)
  - Estado actual (badge)
  - Servicio (nombre + duración)
  - Staff asignado
  - Cliente:
    - nombre
    - teléfono
    - email (si existe)
  - Seña:
    - existe / no existe
    - monto
    - estado (pending / verified / rejected)
    - comprobante (link si existe)
  - Pago:
    - existe / no existe
    - monto y método (solo lectura)

ACCIONES (WRITE)
1) Cambio de estado (según permisos y transición válida):
   - scheduled → in_progress
   - in_progress → completed
   - scheduled* → cancelled
   - scheduled* → no_show

   → Usar rpc_update_appointment_status

2) Seña (si existe o no):
   - Crear / editar seña (monto + proof_url)
     → rpc_create_or_update_deposit
   - Verificar / rechazar seña
     → rpc_verify_deposit

   Reglas UX:
   - Si no hay seña: CTA “Registrar seña”
   - Si pending: CTAs “Verificar” / “Rechazar”
   - Si verified/rejected: solo lectura

PERMISOS
- Superadmin / Admin:
  - Todas las acciones
- Seller:
  - Solo si flags lo permiten:
    - can_manage_agenda
    - can_manage_payments (para señas)

IMPLEMENTACIÓN (sugerida)
1) Ruta:
- app/app/agenda/[appointmentId]/page.tsx (server)
  - fetch por ID usando v_app_appointment_detail
2) Componentes:
- AppointmentHeader (fecha + estado)
- AppointmentClientCard
- AppointmentServiceCard
- AppointmentDepositCard
- AppointmentActions (botones de estado)
3) Mutaciones:
- Usar server actions que llamen a las RPCs
- Manejar optimistic UI simple o refetch tras acción

ACTIVITY LOG
- Agregar entrada:
  “Detalle de cita MVP (lectura + acciones básicas)”

GIT (AUTÓNOMO)
- Mantener rama: feature/app-shell-auth
- Commit: feat(app): appointment detail with actions
- Push

VALIDACIÓN
- npm run dev
- Abrir una cita desde agenda
- Cambiar estado correctamente
- Registrar y verificar seña
- Acciones ocultas si no hay permiso

EJECUTÁ.
