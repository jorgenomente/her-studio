# Paso 0 — Plan Inicial Profesional (v2)

**Proyecto:** Her Studio (`her-studio`)  
**Documento:** `docs/step-0-plan-v2.md`  
**Estado:** ACTIVO — Plan de Ejecución  
**Nota:** La **especificación funcional oficial** del producto es  
`docs/product-spec-v1.4.md`.  
Este documento define **cómo ejecutar** el MVP de forma profesional.

---

## 1) North Star del MVP

### Problema que resuelve

Her Studio necesita un sistema **único, confiable y mobile-first** para operar el día a día del salón (agenda, cobros, stock y clientes), con control por sucursal y visibilidad global para la dueña, eliminando el caos de WhatsApp, cuadernos y planillas.

### Para quién

- **Superadmin (dueña / equipo):** control total y visión global.
- **Admin de sucursal:** operación diaria ordenada.
- **Vendedor/a / Staff:** ejecución rápida sin fricción.
- **Cliente final:** reserva simple, clara y sin llamadas.

### Cómo se mide el éxito (MVP)

- ≥ 80% de las citas gestionadas desde la app.
- 100% de los cobros del día registrados.
- Stock aproximado confiable (sin quiebres críticos).
- Operación diaria completa desde **mobile/tablet**.
- Capacidad de analizar recurrencia y canales de adquisición básicos.

---

## 2) Alcance MVP (alineado a Product Spec v1.4)

### IN (incluido)

- Landing pública + flujo de reserva.
- Selección de sucursal antes de reservar.
- Catálogo de servicios con duración fija.
- Selección de staff y horario.
- Reservas **guest-first** (sin login obligatorio).
- Seña opcional con comprobante adjunto.
- Auth interno (Superadmin / Admin / Vendedor).
- Agenda por staff con estados definidos.
- POS:
  - Cobro de cita.
  - Venta sin cita.
  - Comprobante interno.
- Clientes:
  - perfil interno automático
  - historial y métricas básicas.
- Stock simple:
  - insumos por sucursal,
  - recetas por servicio (opcionales),
  - consumo automático (toggle),
  - desperdicio / ajustes,
  - compras simples + recepción editable.
- Dashboard (paneo general).
- Reportes (control y análisis).
- Analytics MVP:
  - fuente,
  - nuevo vs recurrente,
  - referido.

### OUT (explícitamente fuera)

- Pasarela de pagos.
- Facturación legal.
- Costos y rentabilidad por servicio.
- Proveedores complejos.
- Payroll / comisiones staff.
- Fidelización avanzada.
- Multi-organización.

---

## 3) Roles y Permisos (Ejecución + UX)

### Superadmin

- Acceso a **todas** las sucursales.
- Selector global de sucursal.
- Ve y opera igual que un Admin +:
  - configuración de sucursales,
  - catálogo global,
  - dashboard global agregado.

### Admin de Sucursal

- Acceso solo a sucursales asignadas.
- Opera:
  - agenda,
  - POS,
  - clientes,
  - stock,
  - reportes locales.
- Administra:
  - staff,
  - usuarios de su sucursal,
  - disponibilidad y habilitaciones.

### Vendedor/a

- Acceso solo a su sucursal.
- Opera:
  - agenda (según permisos),
  - POS,
  - clientes (lectura/edición mínima).
- Stock:
  - lectura por defecto,
  - escritura solo si se habilita.

**Regla UX clave:**  
La UI **no muestra acciones** que el usuario no puede ejecutar.

---

## 4) UX Mobile-First (Reglas de Ejecución)

### Principios

- Diseño primero para 360–430px.
- Targets táctiles ≥ 44px.
- Tareas frecuentes en ≤ 3 acciones.
- Prioridad visual en “qué pasa hoy”.

### Patrones UI

- Sidebar en desktop / bottom nav en mobile.
- Selector de sucursal en header (solo si aplica).
- Modales cortos para acciones rápidas.
- Confirmaciones solo para acciones destructivas.

### Estados obligatorios

- **Loading:** skeletons.
- **Empty:** mensaje claro + CTA.
- **Error:** explicación simple + acción.
- **Success:** feedback inmediato (toast + update UI).

---

## 5) Mapa de Pantallas MVP (Ejecución)

### Público

- `/` — Landing
- `/reservar`
- `/reservar/confirmacion`

### App Interna

- `/login`
- `/app/agenda`
- `/app/agenda/[appointmentId]`
- `/app/pos`
- `/app/clientes`
- `/app/stock`
- `/app/compras`
- `/app/reportes`
- `/app/configuracion`
  - staff
  - usuarios
  - servicios (habilitación)
  - sucursales (solo superadmin)

---

## 6) Data Model — Alto Nivel (Alineado v1.4)

**Entidades clave**

- Organization (única)
- Branch (Sucursal)
- User
- UserBranchRole
- Staff
- StaffAvailability
- Client
- Appointment
- Service
- Recipe / RecipeItem
- Payment
- Receipt
- Product (Insumo)
- StockMovement
- Purchase / PurchaseItem

**Relaciones críticas**

- Branch 1–N Staff
- Staff 1–N Appointments
- Service 0–N RecipeItems
- Appointment 0–1 Payment
- Branch 1–N StockMovements
- Branch 1–N Purchases
- User N–N Branch (con rol)

---

## 7) Estrategia de Seguridad (RLS-first)

### Reglas base

- RLS en **todas** las tablas.
- `branch_id` obligatorio en entidades operativas.
- Rol y sucursal se validan en DB.

### Por rol

- Superadmin: acceso total controlado.
- Admin: solo sucursales asignadas.
- Vendedor: sucursal asignada + permisos explícitos.

### Operaciones críticas

- Citas, cobros, stock y compras vía RPC / Server Actions.
- Nunca lógica sensible en cliente.

---

## 8) Contratos de Datos (Resumen Ejecutivo)

### Reads

- Agenda por staff y fecha.
- Disponibilidad por staff.
- Clientes + métricas.
- Stock actual.
- Compras pendientes / recibidas.
- Dashboard y reportes.

### Writes

- Crear reserva.
- Cambiar estado de cita.
- Registrar cobro.
- Registrar / verificar seña.
- Registrar venta sin cita.
- Movimientos de stock.
- Crear / recibir compra.
- Alta / baja staff.

---

## 9) Plan de Ejecución (Orden Realista)

### Fase 0 — Fundaciones

1. Core System Contract (modelo mental DB + RLS).
2. Modelo de datos SQL.
3. RLS base por rol y sucursal.
4. Auth staff + profiles.

### Fase 1 — Operación

5. Staff + disponibilidad.
6. Reservas públicas.
7. Agenda interna.
8. POS (cobros + recibo).

### Fase 2 — Control

9. Clientes + analytics.
10. Stock (recetas, consumo, waste).
11. Compras + recepción.
12. Dashboard + reportes.

---

## 10) Definición de “Hecho”

### Técnica

- Compila sin errores.
- Tipos correctos.
- RLS verificada manualmente.
- Sin lógica sensible en cliente.

### UX

- Usable 100% en mobile.
- Estados completos en todas las pantallas.
- Navegación clara por rol.

### Negocio

- Se puede operar un día completo solo con la app.
- Datos confiables para decisiones básicas.

---

## 11) Riesgos y Seguimiento

- Complejidad futura de horarios avanzados.
- Evolución a facturación legal.
- Escalado de reportes históricos.
- Adopción del consumo automático de stock.

---

**Estado final:**  
✅ Documento alineado con `product-spec-v1.4.md`.  
✅ Listo para iniciar Core System Contract, modelo de datos y RLS sin contradicciones.
