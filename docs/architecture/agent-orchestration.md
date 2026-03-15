# Sistema de Orquestación de Agentes — kontrola-app

> Metodología de desarrollo asistido por AI para el frontend SPA.
> Emula el sistema de kontrola-net adaptado a Vue 3 + TypeScript.

---

## Visión General

El desarrollo se organiza en **fases** (ver `docs/ROADMAP.md`). Cada fase contiene **tareas** que siguen un flujo de 5 checkpoints. Agentes especializados manejan cada checkpoint.

```
Usuario → /build next | /feature {desc}
              ↓
         @coordinator
              ↓
    ┌─────────┼─────────┐
    ↓         ↓         ↓
@analyst  @architect  @tester → @implementer → @reviewer
 (Ch.1)    (Ch.2)    (Ch.2.5)    (Ch.3)       (Ch.4)
```

---

## Agentes

| Agente | Modelo | Responsabilidad |
|--------|--------|----------------|
| `@coordinator` | Opus | Orquesta workflow, gestiona estado, decide siguiente paso |
| `@analyst` | Sonnet | Clasifica feature, define scope, identifica riesgos |
| `@architect` | Opus | Diseña plan detallado, estructura de archivos, decisiones |
| `@tester` | Sonnet | Diseña tests TDD antes de implementar |
| `@implementer` | Sonnet | Implementa código por capas siguiendo el plan |
| `@reviewer` | Sonnet | Valida convenciones, cobertura, prepara PR |
| `@maintainer` | Sonnet | Refactoring, deuda técnica, actualización de deps |

---

## Checkpoints por Feature

### Checkpoint 1 — Análisis (@analyst)

**Input**: Descripción de la feature
**Output**: Documento de análisis

- Clasificar tipo: Page, Feature component, Composable, Store, Shared component, Route
- Definir scope: archivos afectados, dependencias
- Identificar riesgos: breaking changes, performance, seguridad
- Listar restricciones aplicables (de `architecture-constraints.md`)
- Verificar dependencia de backend (¿endpoint disponible?)

### Checkpoint 2 — Diseño (@architect)

**Input**: Análisis del Ch.1
**Output**: Plan de implementación

- Estructura de archivos (nuevos y modificados)
- Interfaces/tipos necesarios
- Composables a crear o reutilizar
- Componentes PrimeVue a usar
- Semantic tokens aplicables
- Decisiones de diseño con justificación

### Checkpoint 2.5 — Diseño de Tests (@tester)

**Input**: Plan del Ch.2
**Output**: Especificación de tests

- Tests unitarios (composables, utils, stores)
- Tests de componente (render, events, props)
- Tests de integración (flujos con MSW)
- Factories de datos necesarias
- Convención de nombres: `{Component}.spec.ts`

### Checkpoint 3 — Implementación (@implementer)

**Input**: Plan + Tests del Ch.2/2.5
**Output**: Código implementado

**Orden de implementación:**
1. Tipos (`src/types/`)
2. Composables API (`src/composables/api/`)
3. Store (si aplica, `src/stores/`)
4. Shared components (`src/components/shared/`)
5. Feature components (`src/pages/{Module}/_components/`)
6. Page component (`src/pages/{Module}/`)
7. Rutas (`src/router/`)
8. Tests

### Checkpoint 4 — Review (@reviewer)

**Input**: Código implementado
**Output**: PR ready o lista de correcciones

**Checklist binario:**
- [ ] `bun run type-check` pasa
- [ ] `bun run lint` pasa sin warnings
- [ ] `bun run test` pasa
- [ ] `bun run build` genera bundle sin errores
- [ ] Sin `any` types
- [ ] Sin colores Tailwind directos
- [ ] Sin imports de axios/fetch en componentes
- [ ] Sin componentes >300 líneas
- [ ] Sin `bg-surface-N` sin `dark:` counterpart
- [ ] Todos los componentes PrimeVue importados directamente
- [ ] Props y emits tipados
- [ ] Errores manejados (toast + Sentry, no console.error)

---

## Modos de Operación

### Modo Orquestado (Recomendado)

```
/build next     → @coordinator detecta fase actual → ejecuta siguiente tarea
/build {phase}  → @coordinator ejecuta fase específica
/build gate     → @coordinator verifica criterios de salida de la fase
```

### Modo Manual

```
/feature {descripción}  → Workflow completo de 5 checkpoints para una feature
/review                 → Solo Ch.4 review del código actual
/test                   → Solo Ch.2.5 diseño de tests
```

### Modo Mantenimiento

```
/refactor {scope}  → @maintainer analiza y refactoriza
/deps              → @maintainer actualiza dependencias
/debt              → @maintainer identifica deuda técnica
```

---

## Estado del Workflow

El archivo `.claude/workflow/state.json` persiste el estado entre sesiones:

```json
{
  "currentPhase": 0,
  "currentTask": "F0-01",
  "completedTasks": [],
  "activeFeature": null,
  "checkpoint": null,
  "lastUpdated": "2026-03-15T00:00:00Z"
}
```

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `currentPhase` | number | Fase activa del ROADMAP (0-13) |
| `currentTask` | string | ID de la tarea en progreso |
| `completedTasks` | string[] | IDs de tareas completadas |
| `activeFeature` | object \| null | Feature en desarrollo (checkpoints) |
| `checkpoint` | string \| null | Checkpoint activo (analysis, design, tests, implementation, review) |
| `lastUpdated` | string | Timestamp ISO del último cambio |

### Reanudación

Al iniciar una nueva sesión, el comando `/resume` lee `state.json` y:
1. Reporta la fase y tarea actual
2. Verifica el estado del código (git status, tests)
3. Sugiere la siguiente acción
4. Restaura el contexto sin pérdida

---

## Convenciones de Branching

Cada tarea del ROADMAP crea una branch:

```
feat/f0/scaffold-vite           # F0-01
feat/f1/auth-store              # F1-01
feat/f4/candidates-panel-view   # F4-02
fix/f5/kanban-drag-drop         # Bug en F5
```

Formato: `{type}/f{phase}/{description}`

---

## Verificación de Gates

Cada fase tiene criterios binarios en el ROADMAP. El comando `/build gate` verifica:

1. Ejecuta checks automatizados (`type-check`, `lint`, `test`, `build`)
2. Verifica criterios manuales listando cada uno
3. Marca la fase como completa en `state.json` si TODOS pasan
4. Bloquea avance si algún criterio falla

---

## Referencias

| Documento | Contenido |
|-----------|-----------|
| `docs/ROADMAP.md` | Fases, tareas, criterios de salida |
| `docs/FUNCTIONALITY-MAP.md` | Inventario completo de funcionalidad |
| `.claude/rules/architecture-constraints.md` | 15 restricciones binarias |
| `.claude/rules/vue.md` | Convenciones Vue/PrimeVue |
| `CLAUDE.md` | Stack y reglas críticas |
