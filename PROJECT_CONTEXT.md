# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: the dashboard listens (V1.4, Voice I). Audio I/O panel with push-to-talk (hold button or V key), live Web Speech transcription (es-CO) and granular mic diagnostics; the particle sphere renders the voice as a spherical equalizer (16-band FFT via `vaultSignals.spectrum`, bass bottom → treble top); project orbs glow with voice level (halo + warm color, no motion) and will glow the same for future assistant TTS; rule-based command router (formations, open project by name, queue, anota/tarea dictation → intent queue with source voice). All on the V1.3.1 base: three 3D formations, CameraDirector, operational HUD panels, editable records, `/queue`. Data contract `SCHEMA_VERSION 2`.

Quality gates (V1.2.2): `npm run check` (typecheck + explicit ESLint) is the official contract; registry enforces id/slug uniqueness. Note: `next build` hangs in the iCloud folder (`.next` indexing); it builds in ~5 s in a clean local copy — known environmental debt, recommendation is moving the repo out of iCloud. Mic requires secure context (localhost/https).

Reto actual: V1.4.1 — Schedule as operational daily agenda with voice as the capture interface (task with project slug, target date, stable id, open/done status, recorded in project memory on confirm, memory-first transaction). Afterwards Sprint 4 — LLM assistant (V1.5), which replaces the rule router behind the same `routeCommand` signature. Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `app/(core)/page.tsx`, `app/components/panels/registry.ts`, `app/components/voice/`, `lib/schema.ts`, `lib/registry.ts`, `lib/adapters/`, `lib/intents.ts`, `lib/schedule.ts`, `app/queue/`, `graphify-out/GRAPH_REPORT.md`.
