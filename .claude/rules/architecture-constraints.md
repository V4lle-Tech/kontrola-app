# Restricciones de Arquitectura (Frontend)

Restricciones binarias que el AI NUNCA debe violar. Cada una existe por incidentes o anti-patrones detectados en el codebase Laravel/Vue actual.

## Restricciones Absolutas

| #   | Restricción                                                    | Verificación                                        |
| --- | -------------------------------------------------------------- | --------------------------------------------------- |
| F01 | NUNCA importar `axios` o `fetch` directamente en componentes   | Solo composables y api/client.ts importan axios      |
| F02 | NUNCA usar `any` — usar `unknown` con type guards              | `strict: true` en tsconfig, ESLint `no-explicit-any` |
| F03 | NUNCA hardcodear URLs de API en componentes                    | Solo usar funciones del cliente generado (OpenAPI)   |
| F04 | NUNCA manipular el DOM directamente (createElement, appendChild)| Usar composables (useFileDownload, etc.)            |
| F05 | NUNCA exponer state interno con `defineExpose({ form })`       | Usar emits para comunicación child → parent         |
| F06 | NUNCA almacenar access token en localStorage                   | Token en memoria (Pinia ref), refresh via HttpOnly   |
| F07 | NUNCA usar colores Tailwind directos (text-gray, bg-blue)      | Solo semantic tokens de PrimeVue (text-color, etc.)  |
| F08 | NUNCA crear wrappers de componentes PrimeVue                   | Importar directamente desde `primevue/*`            |
| F09 | NUNCA silenciar errores con `catch (e) { console.error(e) }`  | Propagar, mostrar toast, o reportar a Sentry        |
| F10 | NUNCA tener componentes >300 líneas (Feature) o >150 (Page)   | Extraer sub-componentes y composables               |
| F11 | NUNCA usar `v-html` con datos de usuario sin sanitizar         | Usar sanitize-html o texto plano                    |
| F12 | NUNCA crear stores Pinia por página                            | Stores por dominio compartido, state local en refs  |
| F13 | NUNCA importar librerías UI fuera de PrimeVue                  | NO shadcn, reka-ui, radix-vue, lucide               |
| F14 | NUNCA usar `bg-surface-N` sin `dark:` counterpart             | `bg-surface-0 dark:bg-surface-900`                  |
| F15 | NUNCA hacer watchers profundos en objetos grandes              | Usar `watchEffect` o watch específico de propiedades |

## Cómo Verificar

Antes de cada PR, verificar:

```bash
# Sin any types
bun run type-check

# Sin imports directos de axios en pages/components
grep -r "import.*from.*'axios'" src/pages/ src/components/ --include="*.ts" --include="*.vue"

# Sin localStorage para tokens
grep -r "localStorage.*token" src/ --include="*.ts" --include="*.vue"

# Sin URLs hardcoded
grep -rn "fetch\s*(" src/pages/ src/components/ --include="*.ts" --include="*.vue"

# Sin colores Tailwind directos
grep -rn "text-gray\|bg-gray\|bg-blue\|bg-green\|text-white\|bg-white" src/ --include="*.vue"
```

## Guías Relacionadas

| Restricción | Guía detallada                          |
| ----------- | --------------------------------------- |
| F01, F03    | `docs/guides/api-client.md`             |
| F02         | `docs/guides/vue3-best-practices.md` §6 |
| F04, F05    | `docs/guides/component-patterns.md`     |
| F06         | `docs/guides/pinia-stores.md` §2        |
| F07, F08    | `.claude/rules/vue.md`                  |
| F10         | `docs/guides/component-patterns.md` §1  |
| F12         | `docs/guides/pinia-stores.md` §6        |
