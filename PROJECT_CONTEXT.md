# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.5.2 delivered. Deterministic voice rules and confirmed aliases run first; unknown read-only questions pass through a local Ollama semantic router with bounded RAG over authorized Obsidian memory, `Skills.md`, project capsules and Graphify. Responses preserve canonical/derived evidence, fail closed, and retain short conversational project context. Voice also supports a continuous Web Speech wake phrase (`oye baúl`/`vault`/`vau`), Command Deck navigation, project-health explanations and a scrollable session log. The local model has no filesystem, write or credential access. Data contract `SCHEMA_VERSION 2`.

Navigation for new sessions: `CONTEXT_MAP.md` (repo root) maps every module — purpose, files, extension points, invariants, and a "to change X touch only Y" table; it is kept current at every session close. Architecture recipes live in Obsidian (`Proyectos/ControlP/Arquitectura/Routers y extensión`); a brief schematic manual with the Obsidian/Notion migration plan is in `docs/manual.md` (deliberately not in `public/`).

Quality gates: `npm run check`, `npm test`, Gitleaks and a production Webpack build; registry enforces id/slug uniqueness. Turbopack hangs in the iCloud folder, while Webpack completes — known environmental debt; move the repo out of iCloud. Mic requires localhost/https.
Reto actual: V1.5.3 — add authorized actions behind the mandatory `propuesta → vista previa → confirmación → ejecución → traza` pipeline, enforced by runners/adapters rather than prompts. Harden `/api/intents` before real execution. Roadmap in `Proyectos/ControlP/Roadmap`; data architecture in `Proyectos/ControlP/Arquitectura/Datos`.

Pointers: `CONTEXT_MAP.md`, `app/components/voice/commands.ts`, `lib/assistant.ts`, `lib/assistant-semantic.ts`, `lib/assistant-rag.ts`, `lib/assistant-knowledge.ts`, `app/api/assistant/`, `lib/schema.ts`, `lib/adapters/`, `docs/manual.md`, `graphify-out/GRAPH_REPORT.md`.
