# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.5.1 quality-reviewed. Voice has a shared visible/spoken/evidenced response contract, native TTS, structured read-only project/`Skills.md` queries, confirmed auditable aliases, and navigation from the dashboard or project records. The local model has no filesystem or credential access. The async `routeCommand` seam remains ready for the semantic router. Data contract `SCHEMA_VERSION 2`.

Navigation for new sessions: `CONTEXT_MAP.md` (repo root) maps every module — purpose, files, extension points, invariants, and a "to change X touch only Y" table; it is kept current at every session close. Architecture recipes live in Obsidian (`Proyectos/ControlP/Arquitectura/Routers y extensión`); a brief schematic manual with the Obsidian/Notion migration plan is in `docs/manual.md` (deliberately not in `public/`).

Quality gates: `npm run check`, `npm test`, Gitleaks and a production Webpack build; registry enforces id/slug uniqueness. Turbopack hangs in the iCloud folder, while Webpack completes — known environmental debt; move the repo out of iCloud. Mic requires localhost/https.
Reto actual: V1.5.2 — add the local semantic router/RAG behind `routeCommand`, after deterministic rules and aliases, with read-only evidence from memory, `Skills.md`, capsules and Graphify. Known commands must not require an LLM and failures must remain closed. V1.5.3 later adds authorized actions behind enforced preview and confirmation. Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `CONTEXT_MAP.md`, `app/components/voice/commands.ts`, `lib/assistant.ts`, `app/api/assistant/`, `lib/schema.ts`, `lib/adapters/`, `docs/manual.md`, `graphify-out/GRAPH_REPORT.md`.
