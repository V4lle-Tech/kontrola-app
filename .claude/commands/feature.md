# /feature {descripción} — Desarrollo completo de feature

Ejecuta el workflow completo de 5 checkpoints para implementar una feature.

## Argumento

`{descripción}` — Descripción breve de la feature a implementar.

## Flujo

### 1. Análisis (Checkpoint 1)
- Clasificar el tipo de feature
- Definir scope y archivos afectados
- Identificar restricciones aplicables
- Verificar dependencia de backend

### 2. Diseño (Checkpoint 2)
- Estructura de archivos
- Interfaces/tipos
- Componentes PrimeVue a usar
- Semantic tokens
- Decisiones de diseño

### 3. Tests (Checkpoint 2.5)
- Definir tests unitarios
- Definir tests de componente
- Crear factories de datos
- Listar data-testid necesarios

### 4. Implementación (Checkpoint 3)
Orden estricto:
1. Types → 2. Composables → 3. Stores → 4. Shared → 5. Features → 6. Pages → 7. Routes → 8. Tests

### 5. Review (Checkpoint 4)
- Ejecutar checks automatizados
- Verificar restricciones binarias
- Preparar para PR si todo pasa

## Estado

Actualizar `.claude/workflow/state.json` en cada checkpoint:
```json
{
  "activeFeature": {
    "description": "{descripción}",
    "checkpoint": "analysis | design | tests | implementation | review",
    "startedAt": "ISO timestamp"
  }
}
```

## Reglas

- Presentar el plan al usuario ANTES de implementar — esperar confirmación
- Si el usuario tiene preguntas o cambios, ajustar ANTES de continuar
- NUNCA saltar checkpoints
- Si un checkpoint falla, NO avanzar al siguiente
