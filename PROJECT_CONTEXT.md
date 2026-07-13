# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.0–V1.2.2 are closed, tagged, pushed and in Notion. Sprint 2 (V1.3, operational panels) is implemented and uncommitted: `/queue` view, Schedule with server-side day plan and transactional write-back to project Bitácora (Obsidian first, then plan state), System Feed with live commits and broken-source alerts, record editing on `/p/[slug]` via server actions → memory adapter, Command Deck with display views (metrics, trends, inbox, plan) plus honest queue commands, 3D node formations (orbit ↔ health ranking), and `SCHEMA_VERSION` in the data contract.

Quality gates (V1.2.2): `npm run check` (typecheck + explicit ESLint) is the official contract; registry enforces id/slug uniqueness.

Reto actual: register V1.3 close (tag, Notion, push, post-close reconciliation). Then the priority story V1.3.1 — Schedule as an operational daily agenda (manual tasks with project, target date, id/status, recorded in project memory on confirm), and afterwards Sprint 3 — Voice I. Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `app/(core)/page.tsx`, `app/components/panels/registry.ts`, `lib/schema.ts`, `lib/registry.ts`, `lib/adapters/`, `lib/intents.ts`, `lib/schedule.ts`, `app/queue/`, `graphify-out/GRAPH_REPORT.md`.
