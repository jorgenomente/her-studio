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
