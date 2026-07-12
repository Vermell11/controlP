# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.2 (Sprint 1 foundations) is committed: core reduced to `app/(core)` with the panel registry as extension point, six panels as self-contained modules with co-located per-component CSS (route-split), project records on `/p/[project]` routes reachable from the 3D nodes, live clock, and a correct mobile experience (minimal header, 3D map first, responsive camera framing). V1.0 and V1.1 are closed, tagged and in Notion.

Reto actual: register V1.2 close (tag, Notion, push) and start Sprint 2 — operational panels (V1.3): `/queue` view, Schedule write-back, System Feed, record editing. Full roadmap in Obsidian `Proyectos/ControlP/Roadmap`; frontend architecture in `Proyectos/ControlP/Arquitectura/Frontend`.

Pointers: `app/(core)/page.tsx`, `app/components/panels/registry.ts`, `app/components/vault-core/`, `app/api/intents/route.ts`, `lib/controlp.ts`, `graphify-out/GRAPH_REPORT.md`.
