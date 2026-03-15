# /resume — Detectar estado y reanudar trabajo

Detecta el estado actual del proyecto y sugiere la siguiente acción.

## Instrucciones

1. Lee `.claude/workflow/state.json` para obtener el estado persistido
2. Ejecuta `git status` para ver cambios pendientes
3. Ejecuta `bun run type-check && bun run lint && bun run test` para verificar salud
4. Lee `docs/ROADMAP.md` para contexto de la fase actual

## Reporta al usuario

```
📍 Estado actual:
- Fase: {n} — {nombre}
- Tarea: {ID} — {descripción}
- Checkpoint: {analysis | design | tests | implementation | review | none}
- Última actualización: {fecha}

🔍 Estado del código:
- Git: {clean | N archivos modificados}
- Type-check: {pass | fail}
- Lint: {pass | fail}
- Tests: {pass | fail | N passing, M failing}

➡️ Siguiente acción sugerida:
{descripción de qué hacer a continuación}
```

## Reglas

- Si state.json no existe, asumir que el proyecto está en Fase 0, Tarea F0-01
- Si hay un feature activo con checkpoint pendiente, sugerir continuar ahí
- Si hay archivos modificados sin commit, advertir al usuario
- NUNCA hacer cambios automáticos — solo reportar y sugerir
