Actuá como **Lead Frontend Engineer + UX Lead** para Her Studio.

OBJETIVO DEL TICKET
Implementar el flujo público de reservas (MVP):
- Landing hermosa (home)
- Selección de sucursal
- Selección de servicio
- Selección de fecha/hora + staff (explícito o “cualquiera disponible”)
- Confirmación
- (Opcional MVP) Seña: mostrar instrucciones + subir comprobante (solo UI + storage), sin verificación automática

ALINEACIÓN
- docs/product-spec-v1.4.md
- docs/core-system-contract.md
- AGENTS.md

REGLAS
- Mobile-first estricto, diseño pro (shadcn + Tailwind).
- NO procesar pagos online.
- Usar rpc_public_create_reservation para crear la cita.
- Sucursal se elige antes de mostrar disponibilidad.
- Datos mínimos: nombre, celular, email.
- Evitar complejidad: disponibilidad inicial simple.

RUTAS
- / (landing)
- /reservar
- /reservar/sucursal
- /reservar/servicio
- /reservar/fecha
- /reservar/confirmacion

DATA (READ)
- branches activas
- servicios disponibles por sucursal:
  - v_app_branch_services (public: si no es accesible por RLS, crear view pública read-only o endpoint server-side)

DISPONIBILIDAD (MVP SIMPLE)
- Mostrar slots por día:
  - Basado en staff_availability del día seleccionado
  - Excluir horarios ocupados por citas (appointment)
- Si esto requiere nuevas views:
  - crear v_public_availability_day(branch_id, service_id, date) o equivalentes en DB
  - si se complica, fallback MVP: seleccionar hora manual y validar con RPC (si choca, mostrar error)

WRITE
- rpc_public_create_reservation con strategy:
  - explicit: staff seleccionado
  - any: “cualquiera disponible”

UX
- Landing: hero + CTA “Reservar”
- Steps claros, barra de progreso
- Estados completos y feedback claro
- Confirmación final con resumen y “Agregar al calendario” (solo link/ics más adelante)

ACTIVITY LOG
- “Reservas públicas MVP implementadas”

GIT (AUTÓNOMO)
- Mantener rama feature/app-shell-auth
- Commits:
  1) feat(app): public landing
  2) feat(app): public booking flow MVP
- Push
- NO mergear

VALIDACIÓN
- npm run dev
- reserva completa crea appointment
- errores de solapamiento/invalidación se muestran bien

EJECUTÁ.
