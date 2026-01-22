# Core System Contract — Her Studio

**Documento:** `docs/core-system-contract.md`
**Estado:** ACTIVO — Source of Truth para diseño de datos + RLS + contratos

---

## 1) Principios del sistema

- **DB-first:** el modelo de datos define el producto. La UI solo refleja contratos de datos.
- **RLS-first:** toda seguridad se resuelve en base de datos; el cliente nunca decide permisos.
- **Contratos por pantalla:** cada vista tiene Reads (views/queries) y Writes (RPC/actions) explícitos.
- **Mono-organización:** una sola organización; todo dato operativo siempre se asocia a sucursal.
- **Branch-bound:** cualquier entidad operativa incluye `branch_id` y se filtra por contexto.

---

## 2) Tenancy & Context (mono-org, branch context, selector)

- **Organización única:** no existe multi-org; los usuarios internos pueden ver 1 o N sucursales.
- **Contexto de sucursal:**
  - El usuario debe tener sucursal activa en UI.
  - Superadmin puede alternar sucursal globalmente.
  - Admin/Vendedor solo pueden seleccionar sucursales asignadas.
- **Regla clave:** ninguna operación crítica puede ejecutarse sin `branch_id` explícito.
- **Público (reserva):** la sucursal se elige **antes** de mostrar disponibilidad.

---

## 3) Entidades core (definición + campos clave + invariantes)

### Organization

- **Definición:** entidad raíz única.
- **Campos clave:** nombre, estado.
- **Invariantes:** solo un registro activo.

### Branch (Sucursal)

- **Definición:** unidad operativa con staff, agenda, stock e ingresos.
- **Campos clave:** nombre, dirección, timezone, estado.
- **Invariantes:** todas las operaciones operativas pertenecen a una sucursal.

### User (usuario interno)

- **Definición:** login interno (Superadmin/Admin/Vendedor).
- **Campos clave:** email, nombre, estado.
- **Invariantes:** todo usuario debe tener al menos un rol por sucursal.

### UserBranchRole

- **Definición:** relación N–N user–branch con rol y permisos finos.
- **Campos clave:** user_id, branch_id, rol, flags de permisos (ej: stock_write).
- **Invariantes:** rol define acceso mínimo; flags solo amplían dentro de su sucursal.

### Staff

- **Definición:** profesional que realiza servicios; puede no tener login.
- **Campos clave:** branch_id, nombre, estado, servicios_habilitados.
- **Invariantes:** staff activo debe tener disponibilidad base.

### StaffAvailability

- **Definición:** disponibilidad semanal simple (día de semana + rangos horarios).
- **Campos clave:** staff_id, weekday, start_time, end_time, activo.
- **Invariantes:** no se permiten rangos solapados para el mismo staff.

### Service

- **Definición:** servicio ofrecido con duración fija.
- **Campos clave:** nombre, duración_min, precio_base, activo.
- **Invariantes:** duración fija; se usa para slots y agenda.

### Client

- **Definición:** identidad interna del cliente (guest-first).
- **Campos clave:** celular (principal), email (secundario), nombre, estado.
- **Invariantes:** celular es el identificador primario único por organización.

### Appointment (Cita)

- **Definición:** reserva asociada a sucursal, servicio, staff y horario.
- **Campos clave:** branch_id, staff_id, service_id, start_at, end_at, estado.
- **Invariantes:**
  - siempre tiene staff asignado (directo o por “cualquiera disponible”).
  - no solapa por staff.

### Deposit (Seña)

- **Definición:** pago parcial opcional con comprobante adjunto.
- **Campos clave:** appointment_id, monto, comprobante_url, estado_verificacion.
- **Invariantes:** la seña **no bloquea** la reserva.

### Payment (Cobro)

- **Definición:** registro de ingreso asociado a cita o venta sin cita.
- **Campos clave:** branch_id, appointment_id (opcional), monto, método, fecha.
- **Invariantes:** todo cobro pertenece a una sucursal.

### Receipt (Comprobante interno)

- **Definición:** comprobante generado al cobrar.
- **Campos clave:** payment_id, número, datos mínimos.
- **Invariantes:** 1–1 con pago.

### Product (Insumo)

- **Definición:** item de stock simple por sucursal.
- **Campos clave:** branch_id, nombre, unidad, stock_min, activo.
- **Invariantes:** stock es local por sucursal.

### StockMovement

- **Definición:** entrada o salida con motivo.
- **Campos clave:** branch_id, product_id, tipo (in/out), cantidad, motivo.
- **Invariantes:** cada movimiento impacta stock de sucursal.

### Recipe / RecipeItem

- **Definición:** consumo estimado de insumos por servicio.
- **Campos clave:** service_id, product_id, cantidad.
- **Invariantes:** la receta es opcional; puede existir por servicio.

### Purchase / PurchaseItem

- **Definición:** compra interna simple y su recepción.
- **Campos clave:** branch_id, estado (pendiente/recibida), fechas.
- **Invariantes:** el stock cambia **solo** al recibir y confirmar cantidades.

---

## 4) Relaciones & cardinalidades

- Organization 1–N Branch
- Branch 1–N UserBranchRole
- User 1–N UserBranchRole
- Branch 1–N Staff
- Staff 1–N StaffAvailability
- Branch 1–N Appointment
- Staff 1–N Appointment
- Service 1–N Appointment
- Client 1–N Appointment
- Appointment 0–1 Deposit
- Appointment 0–1 Payment
- Payment 1–1 Receipt
- Branch 1–N Product
- Service 0–N RecipeItem
- Product 0–N RecipeItem
- Branch 1–N StockMovement
- Branch 1–N Purchase
- Purchase 1–N PurchaseItem

---

## 5) Identidad de cliente (guest-first)

- **Identificador principal:** celular (único por organización).
- **Email:** secundario, editable.
- **Dedupe:**
  - Si el celular existe, se reutiliza el cliente.
  - Si llega email nuevo, se actualiza en el perfil existente.
- **Cambios de datos:**
  - El cambio de celular requiere validación manual por staff (no auto-merge).
  - Se mantiene historial de cambios simples (prev_cell/prev_email) para auditoría.
- **Merge:**
  - Merge manual permitido por Superadmin/Admin con trazabilidad.
  - Las citas/pagos se re-asignan al cliente master.

---

## 6) Staff & disponibilidad (modelo de horarios, slots, no solapamiento)

- **Disponibilidad semanal simple:** rangos por día de semana (sin reglas complejas).
- **Slots por duración:**
  - El slot disponible se calcula por `duración del servicio`.
  - El slot es válido si el rango completo cabe en la disponibilidad del staff.
- **No solapamiento:**
  - Un staff no puede tener citas solapadas.
  - Bloqueos manuales pueden representarse como “citas internas” sin cliente.
- **Asignación “cualquiera disponible”:**
  - El sistema selecciona un staff disponible en el rango solicitado.
  - La selección debe ser determinística (regla clara, ej. primero disponible).

---

## 7) Citas & estados (transiciones + reglas de negocio)

### Estados

- Agendada
- Agendada (seña pendiente)
- Agendada (seña verificada)
- En curso
- Completada
- Cancelada
- No-show

### Transiciones permitidas

- Agendada → En curso → Completada
- Agendada → Cancelada
- Agendada → No-show
- Agendada (seña pendiente/verificada) → En curso → Completada
- Cualquier estado “Agendada\*” puede pasar a Cancelada o No-show

### Reglas clave

- Una cita siempre tiene staff asignado.
- La seña es opcional y su verificación es manual.
- Al completar:
  - habilita el cobro (si no existe).
  - dispara consumo de stock **si** toggle activo y hay receta.

---

## 8) Cobros, señas y comprobantes (flujos + reglas)

- **Cobro de cita:**
  - se ejecuta luego de completar.
  - requiere método de pago y datos de analytics.
- **Venta sin cita:**
  - crea pago directo sin `appointment_id`.
  - puede asociarse opcionalmente a cliente.
- **Seña:**
  - se registra con comprobante adjunto.
  - verificación manual en sucursal.
  - no bloquea reserva ni cambia estado de agenda automáticamente.
- **Comprobante interno:**
  - se genera al registrar cobro.
  - 1–1 con pago.

---

## 9) Stock & compras (recetas, consumo automático, waste, recepción editable)

- **Stock por sucursal:** cada insumo es local a una sucursal.
- **Recetas:** definidas por servicio; opcionales.
- **Consumo automático:**
  - toggle por sucursal.
  - dispara al completar cita si hay receta.
- **Desperdicio/ajuste:**
  - movimiento manual con motivo libre.
- **Compras:**
  - estado pendiente/recibida.
  - al recibir se pueden editar cantidades.
  - el stock se actualiza solo con cantidades confirmadas.

---

## 10) Analytics MVP (fuentes, recurrente, referido) + captura

- **Captura obligatoria en cobro:**
  - fuente de adquisición (lista fija)
  - cliente nuevo vs recurrente
  - referido por (opcional)
- **Fuentes permitidas:** recomendación, instagram, google maps, walk-in, cliente recurrente, otro.
- **Ubicación de captura:** en POS al confirmar el cobro (cita o venta sin cita).

---

## 11) Seguridad RLS-first (matriz por entidad: read/write por rol y branch)

### Principios

- RLS en todas las tablas.
- Acceso siempre filtrado por sucursal asignada.
- Superadmin puede acceder a todas las sucursales.

### Matriz (resumen)

**Branch**

- Superadmin: read/write
- Admin: read (solo sucursales asignadas)
- Vendedor: read (solo su sucursal)

**User + UserBranchRole**

- Superadmin: read/write
- Admin: read/write dentro de su sucursal
- Vendedor: read propio

**Staff + StaffAvailability**

- Superadmin: read/write
- Admin: read/write (su sucursal)
- Vendedor: read (su sucursal)

**Service + Recipe/RecipeItem**

- Superadmin: read/write
- Admin: read (catálogo global) + write en habilitaciones locales
- Vendedor: read

**Client**

- Superadmin: read/write
- Admin: read/write (su sucursal)
- Vendedor: read + update mínimo (contacto)

**Appointment**

- Superadmin: read/write
- Admin: read/write (su sucursal)
- Vendedor: read/write (según permisos de agenda)

**Deposit**

- Superadmin: read/write
- Admin: read/write (su sucursal)
- Vendedor: read (write solo si permiso de cobros)

**Payment + Receipt**

- Superadmin: read/write
- Admin: read/write (su sucursal)
- Vendedor: read/write (si permiso de cobros)

**Product + StockMovement**

- Superadmin: read/write
- Admin: read/write (su sucursal)
- Vendedor: read (write solo si stock_write)

**Purchase + PurchaseItem**

- Superadmin: read/write
- Admin: read/write (su sucursal)
- Vendedor: read (write solo si stock_write)

---

## 12) Contratos de datos por pantalla (MVP)

### Público

**Landing**

- Reads: servicios destacados, sucursales activas.
- Writes: ninguno.
- Permisos: público.

**Reservar**

- Reads: sucursales activas; servicios; disponibilidad por staff; slots.
- Writes: crear cita (guest-first), registrar datos de cliente.
- Permisos: público.

**Confirmación**

- Reads: resumen de cita, datos de sucursal.
- Writes: registro opcional de seña + comprobante.
- Permisos: público.

### Interno

**Agenda**

- Reads: citas por fecha/staff, estado, cliente, servicio.
- Writes: crear/editar/reagendar/cancelar/no-show, iniciar/completar.
- Permisos: Superadmin/Admin; Vendedor según permisos.

**Detalle cita**

- Reads: cita + historial cliente + seña + cobro.
- Writes: cambiar estado, registrar seña, completar y cobrar.
- Permisos: Superadmin/Admin; Vendedor según permisos.

**POS**

- Reads: citas pendientes de cobro; servicios; clientes.
- Writes: registrar cobro; venta sin cita; generar comprobante.
- Permisos: Superadmin/Admin; Vendedor con permiso de cobros.

**Clientes**

- Reads: listado + métricas básicas + historial.
- Writes: editar datos mínimos; merge manual (solo admin).
- Permisos: Superadmin/Admin; Vendedor lectura + edición mínima.

**Stock**

- Reads: insumos + stock actual + movimientos recientes.
- Writes: movimientos manuales (entrada/salida/desperdicio).
- Permisos: Superadmin/Admin; Vendedor según stock_write.

**Compras**

- Reads: compras pendientes/recibidas + detalle.
- Writes: crear compra; recibir compra con cantidades editables.
- Permisos: Superadmin/Admin; Vendedor según stock_write.

**Dashboard**

- Reads: ingresos hoy, citas hoy, no-shows, stock crítico, top servicios.
- Writes: ninguno.
- Permisos: Superadmin/Admin; Vendedor lectura parcial.

**Reportes**

- Reads: ingresos por período, por servicio, por fuente, por sucursal.
- Writes: ninguno.
- Permisos: Superadmin/Admin; Vendedor lectura parcial.

**Configuración**

- Staff: reads/writes staff + disponibilidad (Admin/Superadmin).
- Usuarios: invitación por email, roles y sucursales (Admin/Superadmin).
- Servicios: habilitar/deshabilitar por sucursal (Admin/Superadmin).
- Sucursales: CRUD solo Superadmin.

---

## 13) Definition of Done (DB + RLS)

### Checklist verificable

- Todas las entidades operativas tienen `branch_id`.
- RLS activo en todas las tablas.
- Políticas probadas para Superadmin/Admin/Vendedor.
- No existe ruta de escritura sin RPC/Action definida.
- No hay lectura cross-branch para Admin/Vendedor.
- Señas no bloquean reservas ni cambian estados automáticamente.
- Consumo de stock se dispara al completar cita si toggle activo y receta existe.
- Compras actualizan stock solo en recepción confirmada.
- Contratos por pantalla mapeados a Reads/Writes concretos.

---

**Estado final:** Documento listo para modelado SQL, políticas RLS, views/RPC y construcción de pantallas.
