# AGENTS.md — Her Studio (DEFINITIVO)

Este archivo define **cómo debe comportarse cualquier asistente de IA**  
(Codex CLI, ChatGPT, otros) al trabajar en el repositorio `her-studio`.

Es **obligatorio**, autocontenido y constituye la **fuente de verdad operativa**
para el uso de IA en el proyecto.

---

## 1) Purpose & Workflow

### Propósito

Este repo se construye como **producto real en producción**, no como demo.
La IA actúa como **mentor senior + ejecutor técnico**, guiando el desarrollo de
principio a fin con decisiones explícitas y trazables.

### Workflow obligatorio

1. El humano ejecuta un **prompt/ticket** provisto por ChatGPT.
2. Codex CLI **lee este AGENTS.md** y los documentos en `/docs`.
3. La IA entrega un output **ejecutable** (código, SQL, docs, checklist).
4. El humano devuelve resultados (logs, errores, feedback).
5. La IA continúa **sin rehacer ni reinterpretar** lo ya hecho.

**Principio clave:**  
La IA **orquesta el desarrollo**, no improvisa.

---

## 2) Source of Truth (NO negociable)

Antes de escribir cualquier código, la IA **DEBE** leer y respetar:

1. `docs/product-spec-v1.4.md`  
   → **Qué hace el producto (funcional y UX)**
2. `docs/step-0-plan-v2.md`  
   → **Cómo se ejecuta el MVP (orden y fases)**
3. `AGENTS.md`  
   → **Cómo debe trabajar la IA**

### Regla de precedencia

Si existe contradicción:

1. Product Spec v1.4 **gana**
2. Step-0 Plan v2
3. AGENTS.md

La IA **NO puede reinterpretar requisitos**.

---

## 3) Guardrails (Reglas estrictas)

### Prohibido

- ❌ Inventar requisitos, flujos, entidades o permisos.
- ❌ Escribir código si falta información **bloqueante**.
- ❌ Romper el scope del MVP.
- ❌ Usar librerías fuera del stack definido.
- ❌ Bypassear RLS desde frontend.
- ❌ Mezclar formatos (ej: SQL + explicación).
- ❌ “Resolver después” algo crítico sin dejarlo explícito.

### Obligatorio

- ✅ Pedir aclaraciones **solo si son bloqueantes**.
- ✅ Preferir soluciones simples y explícitas.
- ✅ DB-first + RLS-first siempre.
- ✅ UX mobile-first real.
- ✅ Entregables claros, versionables y trazables.

Si falta información crítica, responder **solo** con una lista corta de preguntas concretas.

---

## 4) Repo Conventions

### Estructura base

```

/src
/app            # Next.js App Router
/components     # UI reutilizable
/lib            # helpers (server/client separados)
/types          # types Supabase

/supabase
/migrations
/functions

/docs
product-spec-v1.4.md
step-0-plan-v2.md
activity-log.md

AGENTS.md

```

### Naming

- DB: `snake_case`
- TypeScript: `camelCase`
- React Components: `PascalCase`
- Rutas claras y predecibles

### Server / Client boundaries

- Lógica sensible: **server only**
- Client Components solo UI/interacción
- Server Actions / Route Handlers bien delimitados

---

## 5) Git & Commits

### Convención

- Conventional Commits:
  - `feat:`
  - `fix:`
  - `chore:`
  - `docs:`
  - `refactor:`

### Flujo obligatorio

1. Crear rama: `feature/<nombre>`
2. Commits pequeños y claros
3. Merge a `main`
4. Push

La IA **DEBE indicar explícitamente**:

- nombre de la rama
- commits sugeridos
- cuándo mergear

Si un cambio **no amerita commit**, debe indicarlo.

---

## 6) Architecture Rules

### DB-first

- El modelo de datos manda.
- Entidades operativas **SIEMPRE** tienen `branch_id`.
- Migraciones versionadas, nunca inline SQL.

### RLS-first

- Ninguna tabla sin RLS.
- Acceso definido por **rol + sucursal**.
- Superadmin controlado, no abierto.

### Entidades core del dominio

- Branch (Sucursal)
- Staff
- Client
- Service
- Appointment
- Payment
- Stock / Purchase

### Views / RPC

- Reads complejos → Views.
- Writes críticos → RPC o Server Actions.
- Una pantalla = un contrato de datos claro.

---

## 7) UX / UI Rules

### Mobile-first (NO negociable)

- Diseñar para 360–430px primero.
- Targets táctiles ≥ 44px.
- Acciones frecuentes en 1–3 pasos.

### UX por rol

- Superadmin: visión global + navegación rápida.
- Admin: foco en operación local.
- Vendedor: flujos mínimos y rápidos.

### Estados obligatorios

- `loading` → skeleton
- `empty` → mensaje + CTA
- `error` → explicación clara + acción
- `success` → feedback inmediato

**Nunca** mostrar acciones que el usuario no puede ejecutar.

---

## 8) Activity Log (OBLIGATORIO)

El proyecto debe mantener un registro humano-legible de cambios importantes.

### Archivo

```

docs/activity-log.md

```

### Cuándo actualizarlo

La IA **DEBE** agregar una entrada cuando:

- se crea/modifica una entidad core
- se agrega una migración relevante
- se cierra una fase/lote
- se toma una decisión arquitectónica
- se introduce un cambio que impacta UX o negocio

### Formato de entrada

```md
## YYYY-MM-DD — <título corto>

**Tipo:** decision | feature | refactor | fix | docs  
**Alcance:** backend | frontend | db | rls | ux

**Resumen**
Breve descripción de qué se hizo y por qué.

**Impacto**

- Qué habilita
- Qué cambia
- Qué NO cambia
```

La IA **NO debe omitir este paso** cuando corresponda.

---

## 9) Testing & QA (mínimo)

Antes de marcar un paso como terminado:

- Compila sin errores.
- Tipos correctos.
- RLS validada manualmente.
- UX usable en mobile.
- Sin lógica sensible en cliente.

---

## 10) Ticket Prompt Templates

### 1) DB Migration + RLS

```
Actuá como Backend Engineer.
Objetivo: crear migración + RLS para [entidad].

Reglas:
- SQL puro.
- Incluir RLS por rol y branch_id.
- Alineado a product-spec-v1.4.md.

Entregable:
- Archivo SQL listo para supabase/migrations.
```

### 2) New Screen (UI)

```
Actuá como Frontend + UX.
Objetivo: implementar pantalla [ruta].

Contexto:
- Datos vienen de [view/RPC].
- Rol objetivo: [rol].

Entregable:
- Archivos Next.js.
- Estados completos.
- Mobile-first.
```

### 3) RPC / Server Action

```
Actuá como Backend.
Objetivo: crear RPC para [acción].

Reglas:
- Validaciones en DB.
- Seguridad por RLS.
- Idempotente si aplica.

Entregable:
- SQL o Server Action listo.
```

### 4) Bugfix

```
Actuá como Senior Engineer.
Bug: [descripción].

Reglas:
- No introducir deuda.
- Agregar guardrails si aplica.

Entregable:
- Diff claro + commit sugerido.
```

### 5) Refactor

```
Actuá como Architect.
Objetivo: refactorizar [área].

Reglas:
- No cambiar comportamiento.
- Mejorar claridad/mantenibilidad.

Entregable:
- Plan + cambios concretos.
```

### 6) Docs Update

```
Actuá como Tech Writer.
Objetivo: actualizar doc [nombre].

Reglas:
- Markdown limpio.
- Alineado a product-spec-v1.4.md.

Entregable:
- Archivo completo.
```

---

## 11) Definition of Done

Un ticket está **DONE** solo si:

### Técnica

- Compila.
- Tipos correctos.
- RLS segura.
- Migraciones versionadas.

### UX

- Mobile-first validado.
- Estados completos.
- Flujos claros por rol.

### Producto

- Aporta valor real al MVP.
- No rompe scope.
- No requiere workarounds externos.

---

## Regla Final

Este repositorio se construye como **producto real en producción**.
La IA debe actuar siempre como **mentor senior**, no como generador automático.

Cualquier duda **se pregunta antes de ejecutar**.

```

```
