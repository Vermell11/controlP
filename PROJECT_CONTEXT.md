# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.0–V1.3 are closed, tagged, pushed and in Notion; V1.3.1 (interactive 3D formations) is committed: Project Health opens a vertical health diagnostic with fisheye lens (centered item dominates, others shrink and recede), orb left + aligned data panel (name, tag · graph metric, health bar), scrollable; Vault Projects is an auto-sized grid; CameraDirector lerps the camera home and locks controls in reading formations; smooth CSS morph between label modes; vitals with progress bars; Schedule and System Feed consolidated as Command Deck views.

Quality gates (V1.2.2): `npm run check` (typecheck + explicit ESLint) is the official contract; registry enforces id/slug uniqueness.

Reto actual: register V1.3.1 close, then V1.3.2 — Schedule as an operational daily agenda (manual tasks with project, target date, id/status, recorded in project memory on confirm). Afterwards Sprint 3 — Voice I (V1.4). Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `app/(core)/page.tsx`, `app/components/panels/registry.ts`, `lib/schema.ts`, `lib/registry.ts`, `lib/adapters/`, `lib/intents.ts`, `lib/schedule.ts`, `app/queue/`, `graphify-out/GRAPH_REPORT.md`.
