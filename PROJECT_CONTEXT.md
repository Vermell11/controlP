# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: quality-reviewed, responsive and motion-accessible (V1.4.5). On desktop the core is a fixed-height cockpit; secondary routes retain normal page scroll. Voice runs on-device (`stt/` sidecar behind `/api/stt`, swappable whisper.local ↔ web.speech, 16-band PTT synthesizer) and exposes visible states for listening, transcription, processing, success and error. CSS and R3F honor reduced-motion; manual GPU resources dispose on unmount. The async `routeCommand` seam remains ready for the LLM. Data contract `SCHEMA_VERSION 2`.

Navigation for new sessions: `CONTEXT_MAP.md` (repo root) maps every module — purpose, files, extension points, invariants, and a "to change X touch only Y" table; it is kept current at every session close. Architecture recipes live in Obsidian (`Proyectos/ControlP/Arquitectura/Routers y extensión`); a brief schematic manual with the Obsidian/Notion migration plan is in `docs/manual.md` (deliberately not in `public/`).

Quality gates: `npm run check`, `npm test`, Gitleaks and a production Webpack build; registry enforces id/slug uniqueness. Turbopack hangs in the iCloud folder, while Webpack completes — known environmental debt; move the repo out of iCloud. Mic requires localhost/https.
Reto actual: Sprint 4A — voice and read-only knowledge (V1.5): a visible/spoken response contract, TTS, structured project/`Skills.md` queries, navigation, and confirmed alias memory such as `maria` → `MA-IA`. Then Sprint 4B adds the semantic local router/RAG and 4C adds authorized actions behind enforced preview and confirmation. The local model never writes directly to Obsidian or Notion. Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `CONTEXT_MAP.md`, `app/(core)/page.tsx`, `app/components/panels/registry.ts`, `app/components/voice/commands.ts`, `lib/schema.ts`, `lib/adapters/`, `lib/intents.ts`, `docs/manual.md`, `graphify-out/GRAPH_REPORT.md`.
