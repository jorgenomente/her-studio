## 2026-01-21 — RLS base implementado

**Tipo:** feature  
**Alcance:** rls

**Resumen**
Se habilitó RLS en las tablas operativas y se agregaron helpers de permisos por rol/sucursal con policies base de lectura y escritura.

**Impacto**

- Habilita control de acceso por rol y sucursal en el MVP.
- Define permisos de escritura por flags (agenda/pagos/stock).
- No incluye views ni RPCs todavía.

## 2026-01-21 — Views base MVP (contracts de lectura)

**Tipo:** feature  
**Alcance:** db

**Resumen**
Se agregaron views base para contratos de lectura del MVP (agenda, POS, dashboard, stock, compras y clientes).

**Impacto**

- Habilita lecturas consistentes para pantallas clave.
- Mantiene RLS intacto al depender de tablas protegidas.
- No incluye lógica compleja de disponibilidad ni reportes avanzados.

## 2026-01-21 — RPCs MVP (writes)

**Tipo:** feature  
**Alcance:** db

**Resumen**
Se agregaron RPCs mínimas de escritura para reservas públicas, agenda, señas, cobros, stock y compras.

**Impacto**

- Habilita operaciones críticas del MVP con validaciones internas.
- Mantiene RLS como capa principal; solo el RPC público usa SECURITY DEFINER.
- No incluye lógica avanzada ni automatización de stock al recibir compras.

## 2026-01-21 — App shell + Auth staff + branch context (base)

**Tipo:** feature  
**Alcance:** frontend

**Resumen**
Se agregó el shell interno con autenticación de staff, navegación por módulos y selector de sucursal.

**Impacto**

- Protege rutas /app con middleware.
- Prepara permisos por rol y flags para ocultar acciones.
- Entrega placeholders de módulos para el MVP.

## 2026-01-21 — Agenda MVP (read-only) implementada

**Tipo:** feature  
**Alcance:** frontend

**Resumen**
Se implementó la pantalla de agenda con lectura desde `v_app_agenda_day`, filtros básicos y navegación al detalle.

**Impacto**

- Permite visualizar citas por día con estados y señales (seña/pago).
- Respeta RLS y el contexto de sucursal activo.
- Aún no incluye acciones de escritura.

## 2026-01-21 — Detalle de cita MVP (lectura + acciones básicas)

**Tipo:** feature  
**Alcance:** frontend

**Resumen**
Se implementó el detalle de cita con lectura completa y acciones de estado/seña según permisos.

**Impacto**

- Permite operar cambios de estado básicos sin cobro.
- Habilita registro y verificación de señas para staff autorizado.
- Mantiene UI mobile-first con estados completos.

## 2026-01-21 — POS MVP (cobros + venta sin cita) implementado

**Tipo:** feature  
**Alcance:** frontend

**Resumen**
Se agregó la pantalla POS con cobro de citas, venta sin cita y lista de pagos del día.

**Impacto**

- Permite registrar cobros con método y analytics básicos.
- Respeta permisos de pagos y contexto de sucursal.
- No incluye procesamiento de pagos online ni stock automático.

## 2026-01-21 — Views clientes (detalle + historial)

**Tipo:** feature  
**Alcance:** db

**Resumen**
Se agregaron views de lectura para perfil de cliente, historial de citas y pagos.

**Impacto**

- Habilita contratos de lectura para el módulo Clientes.
- Mantiene RLS y evita lógica de escritura.
