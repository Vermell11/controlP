# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.0–V1.3.1 are closed, tagged, pushed and in Notion. The 3D core has three formations (`orbit` sphere, `grid` auto-sized by health, `health` vertical diagnostic with fisheye lens and per-orb data panel), CameraDirector brings the camera home and locks controls in reading formations, vitals have progress bars, and Schedule and System Feed live as Command Deck views. Data contract is at `SCHEMA_VERSION 2`.

Quality gates (V1.2.2): `npm run check` (typecheck + explicit ESLint) is the official contract; registry enforces id/slug uniqueness. Note: `next build` hangs in the iCloud folder (`.next` indexing); it builds in ~5 s in a clean local copy — known environmental debt, recommendation is moving the repo out of iCloud.

Reto actual: Sprint 3 — Voice I (V1.4), moved ahead of the agenda by decision (2026-07-13): voice is the product's key feature and will be the agenda's capture interface. Scope: `useMicLevel` (mic → `vaultSignals.level`), "listening" nodes, push-to-talk, Web Speech transcription (es-CO), rule-based commands → intent queue. Afterwards V1.4.1 — operational agenda (formerly V1.3.2). Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `app/(core)/page.tsx`, `app/components/panels/registry.ts`, `lib/schema.ts`, `lib/registry.ts`, `lib/adapters/`, `lib/intents.ts`, `lib/schedule.ts`, `app/queue/`, `graphify-out/GRAPH_REPORT.md`.
