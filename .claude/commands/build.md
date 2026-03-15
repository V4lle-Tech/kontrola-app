# /build {subcommand} — Gestión de fases del ROADMAP

Ejecuta operaciones a nivel de fase del ROADMAP.

## Subcomandos

### /build next
Detecta la siguiente tarea pendiente y la ejecuta con el workflow completo.

1. Lee `state.json` → fase actual + tareas completadas
2. Busca la siguiente tarea no completada en `docs/ROADMAP.md`
3. Ejecuta `/feature` con la descripción de esa tarea
4. Actualiza `state.json` al completar

### /build gate
Verifica los criterios de salida de la fase actual.

1. Lee los criterios del gate de la fase en `docs/ROADMAP.md`
2. Ejecuta checks automatizados (`type-check`, `lint`, `test`, `build`)
3. Para cada criterio manual, verifica inspeccionando el código
4. Reporta resultado: PASS (todos) o FAIL (lista de criterios faltantes)
5. Si PASS: marca fase como completa, avanza `currentPhase` en `state.json`

### /build {N}
Ejecuta todas las tareas de la fase N.

1. Lista todas las tareas de la fase N del ROADMAP
2. Para cada tarea: ejecuta el workflow completo
3. Al terminar todas: ejecuta gate de la fase

### /build status
Muestra estado actual del progreso.

```
📊 Progreso del ROADMAP:
- Fases completadas: {N}/13
- Fase actual: {N} — {nombre}
- Tareas completadas: {N}/{total de la fase}
- Próxima tarea: {ID} — {descripción}
```

## Reglas

- `/build gate` es OBLIGATORIO antes de avanzar de fase
- Si un gate falla, listar EXACTAMENTE qué criterios faltan
- NUNCA marcar una fase como completa si algún criterio del gate falla
- Actualizar `state.json` después de cada operación
