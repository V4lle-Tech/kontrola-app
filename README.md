# Kontrola App

> Frontend Vue 3 SPA para Kontrola ERP.

## Stack

| Tecnologia   | Version | Uso                        |
| ------------ | ------- | -------------------------- |
| Vue          | 3       | Framework                  |
| TypeScript   | 5       | Lenguaje                   |
| PrimeVue     | 4       | UI Components (Aura)       |
| Tailwind CSS | 4       | Utility CSS                |
| Pinia        | 2       | State Management           |
| Vue Router   | 4       | Client-side Routing        |
| Axios        | 1       | HTTP Client                |
| Vite         | 6       | Build Tool                 |
| Bun          | 1       | Package Manager / Runtime  |

## Requisitos

- Bun >= 1.0
- kontrola-net API corriendo (para desarrollo)

## Setup

```bash
bun install
bun dev
```

## Desarrollo

```bash
# Dev server
bun dev

# Build produccion
bun run build

# Lint
bun run lint

# Type check
bun run type-check

# Generar API client
bun run api:generate
```

## Relacion con Backend

Este SPA consume la API REST de [kontrola-net](https://github.com/V4lle-Tech/kontrola-net).

- Autenticacion: JWT Bearer token
- API Contract: OpenAPI spec generado por .NET
- Portal publico (SEO): servido por Razor Pages en kontrola-net

## Documentacion

| Archivo | Contenido |
| --- | --- |
| `CLAUDE.md` | Instrucciones de proyecto para Claude Code |
| `.claude/rules/vue.md` | Convenciones Vue/PrimeVue |
