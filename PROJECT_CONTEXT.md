# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.2.1 (Sprint 1.5, truth protocol) is committed over the V1.2 modular foundations: canonical JSON schema with validator (`lib/schema.ts`), explicit project registry with stable ids/slugs and per-provider sources (`config/projects.json`), role adapters for memory/Obsidian, evidence/Git and graph/Graphify (read errors surface as alerts), `/p/[slug]` routes, and a tolerant per-line intent queue. The 8 official premises live in Obsidian `Proyectos/ControlP/Reglas`. V1.0–V1.2 are closed, tagged and in Notion.

Quality gates (V1.2.2): `npm run check` (typecheck + explicit ESLint) is the official contract; registry enforces id/slug uniqueness.

Reto actual: register V1.2.2 close, then start Sprint 2 — operational panels (V1.3): `/queue` view, Schedule write-back via adapters, System Feed with visible errors, record editing, and keep post-close context reconciliation mandatory after every finalize. Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `app/(core)/page.tsx`, `app/components/panels/registry.ts`, `lib/schema.ts`, `lib/registry.ts`, `lib/adapters/`, `app/api/intents/route.ts`, `graphify-out/GRAPH_REPORT.md`.
