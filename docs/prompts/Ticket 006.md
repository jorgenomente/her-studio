Actuá como **Lead Frontend Engineer + UX Engineer** para Her Studio.

OBJETIVO DEL TICKET
Implementar la pantalla real **/app/agenda** (MVP) usando el contrato:
- View: v_app_agenda_day
y cumpliendo:
- mobile-first UX excelente
- estados completos
- filtros básicos (día + staff opcional + status opcional)
- navegación a detalle de cita (/app/agenda/[appointmentId])

REGLAS
- NO implementar POS todavía.
- NO implementar writes (crear/mover/cambiar estado) en este ticket.
- Solo READ + UI/UX.
- No romper el shell existente.
- Usar server components para fetch y client components solo para interacciones (cambio de fecha/filtros).
- Respetar RLS (usar session del usuario).

DATA CONTRACT (READ)
- Fuente: view v_app_agenda_day
- La query debe filtrar por:
  - branch_id = branch activo (cookie/source of truth)
  - fecha seleccionada (start/end del día en timezone de branch si posible; si no, usar UTC por ahora y documentar TODO)
- Campos esperados en UI:
  - start_at, end_at, status
  - staff_name
  - service_name
  - client_name + client_phone
  - has_deposit, has_payment

UX REQUISITOS
- Layout mobile-first:
  - header con fecha + botón “Hoy”
  - selector día (prev/next)
  - chips de filtros (Staff / Estado)
  - lista de citas en cards (tap targets grandes)
- Estados:
  - loading skeleton
  - empty state: “No hay citas para este día” + CTA (pero CTA deshabilitado por ahora: “Crear cita (próximamente)”)
  - error state legible
- Visual status:
  - badge por estado (scheduled/in_progress/completed/cancelled/no_show)
  - icon/indicador si tiene seña / si está pago
- Accesibilidad:
  - labels
  - contrast correcto
  - navegación táctil

IMPLEMENTACIÓN (sugerida)
1) Ruta:
- app/app/agenda/page.tsx (server) renderiza shell + pasa datos iniciales
- component client para controles (date/filtros) que actualice search params
2) Query:
- lib/queries/agenda.ts con función fetchAgendaDay({branchId, date, staffId?, status?})
3) UI:
- components/app/agenda/* (AgendaHeader, AgendaFilters, AppointmentCard, etc.)
4) Routing:
- cada card link a /app/agenda/[appointmentId]
- crear placeholder /app/agenda/[appointmentId]/page.tsx que muestre “Detalle (próximo ticket)”

ACTIVITY LOG
- Agregar entrada: “Agenda MVP (read-only) implementada”

GIT (AUTÓNOMO)
- Mantener rama feature/app-shell-auth
- Commit: feat(app): agenda read-only MVP
- Push

VALIDACIÓN
- npm run dev
- /app/agenda renderiza lista según branch activo
- filtros cambian query via search params
- click en cita abre detalle placeholder

EJECUTÁ.
