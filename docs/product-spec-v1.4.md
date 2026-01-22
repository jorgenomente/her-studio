# Product Spec v1.4 — Her Studio

**Archivo:** `docs/product-spec-v1.4.md`  
**Estado:** DEFINITIVO (Source of Truth para MVP)

---

## 1) Resumen Ejecutivo

**Her Studio** es una plataforma web de gestión integral para salones de belleza, diseñada como **mono-organización y multi-sucursal**, con foco en:

- Reservas online sin fricción.
- Operación diaria simple (agenda, cobros, stock).
- Control centralizado para la dueña.
- Experiencia **mobile-first** y UX profesional.

El sistema prioriza **operabilidad real**, evita complejidad innecesaria y está preparado para escalar sin rehacer arquitectura.

---

## 2) Alcance MVP

### IN (incluido)

- Landing pública visualmente impactante.
- Selección de sucursal antes de reservar.
- Catálogo de servicios con duración fija.
- Reservas online sin login obligatorio (guest-first).
- Selección de staff y horario.
- Seña opcional con comprobante adjunto.
- Auth interno (Superadmin / Admin / Vendedor).
- Agenda con estados claros.
- POS:
  - Cobro de cita.
  - Venta sin cita.
  - Comprobante interno.
- Clientes (perfil interno + estadísticas).
- Stock simple:
  - Insumos.
  - Recetas por servicio.
  - Consumo automático (opcional).
  - Desperdicio / ajustes.
  - Compras simples + recepción editable.
- Dashboard (paneo general).
- Reportes (control y análisis).
- Analytics MVP (fuente, recurrente, referido).

### OUT (explícitamente fuera)

- Pasarela de pagos.
- Facturación legal.
- Costos y rentabilidad por servicio.
- Proveedores complejos.
- Staff payroll / comisiones.
- Fidelización avanzada.
- Multi-organización.

---

## 3) Roles y Permisos

### Superadmin

- Acceso total a todas las sucursales.
- Selector global de sucursal.
- Ve la **misma operación que un Admin**, más:
  - Configuración de sucursales.
  - Catálogo global de servicios.
  - Dashboard global agregado.

### Admin de Sucursal

- Acceso solo a sucursales asignadas.
- Puede operar y administrar:
  - Agenda
  - POS
  - Clientes
  - Stock
  - Reportes locales
  - Staff
  - Usuarios de su sucursal

### Vendedor/a

- Acceso solo a su sucursal.
- Opera:
  - Agenda (según permisos)
  - POS
  - Clientes (lectura/edición mínima)
- Stock: lectura (escritura solo si se habilita).

---

## 4) Navegación (UX Definitivo)

### Desktop

- Sidebar izquierda (módulos).
- Header superior con:
  - Selector de sucursal (solo si aplica).
  - Perfil de usuario.

### Mobile

- Bottom navigation (módulos principales).
- Header compacto con selector de sucursal.

### Orden de módulos (uso real)

1. Agenda
2. Cobros (POS)
3. Clientes
4. Stock
5. Reportes
6. Configuración (admin / superadmin)

---

## 5) Entidades y Definiciones (Glosario)

- **Sucursal:** Ubicación física con agenda, staff, stock e ingresos propios.
- **Staff:** Profesional que realiza servicios. Puede no tener login.
- **Servicio:** Prestación ofrecida (duración fija).
- **Receta:** Insumos y cantidades estimadas por servicio.
- **Cliente:** Persona identificada internamente (celular + email).
- **Cita:** Reserva asociada a sucursal, servicio, staff y horario.
- **Seña:** Pago parcial con comprobante adjunto.
- **Cobro:** Registro de ingreso.
- **Venta sin cita:** Cobro directo sin cita asociada.
- **Insumo:** Producto de stock.
- **Movimiento de stock:** Entrada o salida con motivo.
- **Compra:** Registro interno de insumos a adquirir/recibir.

---

## 6) Reglas de Negocio por Módulo

### 6.1 Landing + Reservas Públicas

**Flujo**

1. Landing (branding, servicios destacados).
2. CTA “Reservar”.
3. Seleccionar sucursal.
4. Seleccionar servicio.
5. Seleccionar fecha.
6. Seleccionar staff (o “cualquiera disponible”).
7. Seleccionar horario.
8. Ingresar nombre, celular y email.
9. Confirmar reserva.
10. Opción de seña (si está habilitada).

**Reglas**

- No requiere login.
- El celular identifica al cliente.
- La seña no bloquea la reserva.

---

### 6.2 Agenda

**Estados**

- Agendada
- Agendada (seña pendiente)
- Agendada (seña verificada)
- En curso
- Completada
- Cancelada
- No-show

**Reglas**

- Una cita siempre tiene staff asignado.
- No se permiten solapamientos por staff.
- Al completarse, habilita cobro y consumo.

---

### 6.3 POS / Cobros

**Cobro de cita**

- Seleccionar cita.
- Marcar como completada.
- Registrar método de pago.
- Registrar datos analytics.
- Emitir comprobante interno.

**Venta sin cita**

- No se selecciona cita.
- Datos mínimos del cliente (opcional).
- Monto + método de pago.
- Servicio opcional (para estadísticas).

---

### 6.4 Clientes (Guest-First)

**Identidad**

- Identificador primario: celular.
- Email secundario y editable.

**Reglas**

- Si el celular existe → se reutiliza el cliente.
- Si cambia email/celular → se actualiza el perfil interno.
- No se fuerza login al cliente.

**Panel de cliente**

- Historial de visitas.
- Frecuencia.
- Servicios usados.
- Staff preferido.
- Gasto total/aproximado.
- Fuente de adquisición.

---

### 6.5 Staff

- Alta / baja por sucursal.
- Activar / desactivar.
- Disponibilidad semanal simple.
- Asociación opcional a servicios.
- No maneja salarios ni comisiones.

---

### 6.6 Stock (Simple y Funcional)

**Insumos**

- Stock actual por sucursal.
- Stock mínimo opcional.

**Recetas**

- Opcionales por servicio.
- Cantidades estimadas.

**Consumo**

- Al completar cita:
  - Si hay receta y consumo activo → se descuenta.
- El consumo automático se puede desactivar por sucursal.

**Desperdicio / Ajustes**

- Movimiento manual con motivo libre.

**Compras**

- Crear compra (insumos + cantidades).
- Estado: pendiente / recibida.
- Al recibir:
  - cantidades editables.
  - el stock cambia solo según lo confirmado.

---

### 6.7 Analytics MVP

Registrados en el cobro:

- Fuente:
  - recomendación
  - instagram
  - google maps
  - walk-in
  - cliente recurrente
  - otro
- Referido por (opcional).

Objetivo:

- Nuevos vs recurrentes.
- Canales de adquisición.
- Baseline de crecimiento.

---

## 7) Dashboard vs Reportes

### Dashboard

- Paneo rápido:
  - ingresos hoy
  - citas hoy
  - no-shows
  - stock crítico
  - top servicios

### Reportes

- Vista detallada:
  - ingresos por período
  - por sucursal
  - por servicio
  - por fuente
- Filtros y comparaciones.

---

## 8) Contratos de Datos (Conceptuales)

### Reads

- Agenda por staff y fecha.
- Disponibilidad por staff.
- Clientes y métricas.
- Stock actual.
- Compras pendientes/recibidas.
- Ingresos del día.
- Reportes agregados.

### Writes

- Crear reserva.
- Cambiar estado de cita.
- Registrar cobro.
- Registrar seña + adjunto.
- Verificar seña.
- Registrar venta sin cita.
- Movimientos de stock.
- Crear / recibir compra.
- Alta/baja staff.

---

## 9) Invitación y Usuarios Internos

- Invitación por email.
- Soporta:
  - Magic link.
  - Set password.
- Roles y sucursales se asignan antes de aceptar.
- No se crean usuarios con contraseña predefinida.

---

## 10) Criterios de Aceptación (MVP)

### UX

- Usable 100% en mobile.
- Navegación clara por rol.
- Estados completos (loading / empty / error / success).

### Operación

- Se puede operar un día completo sin sistemas externos.
- Todo cobro queda registrado.
- Stock refleja consumo aproximado.

### Técnica

- No hay suposiciones implícitas.
- Todos los flujos están definidos.
- Listo para DB + RLS sin reinterpretar.

---

## 11) Futuro (Fuera de MVP)

- Login opcional de clientes.
- Facturación legal.
- Costos y rentabilidad.
- Recetas avanzadas.
- Staff scheduling complejo.
- Fidelización y campañas.
- Reportes financieros avanzados.

---

**Estado final:**  
✅ Documento definitivo para iniciar modelado de datos, RLS y desarrollo con IA sin adivinanzas.
