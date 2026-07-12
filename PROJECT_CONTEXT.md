# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.1 adds interactive HUD panels over the V1.0 base (read-only interface, Obsidian discovery, Git/Graphify adapters, 3D particle core with orbiting clickable nodes and `vaultSignals` prepared for voice): inverted hover on all panels, Documents deep-linking to Obsidian, a local intent queue (`/api/intents`), and an interactive Schedule. Architecture rule: core closed to modification, open to extension via self-contained modules.

Reto actual: register V1.1 close (Notion, tag, push) and start Sprint 1 — scalable foundations (V1.2): route/module restructure, live clock, `/p/[project]` pages, panel registry. Full roadmap in Obsidian `Proyectos/ControlP/Roadmap`.

Pointers: `app/page.tsx`, `app/components/CenterStage.tsx`, `app/components/vault-core/`, `app/api/intents/route.ts`, `lib/controlp.ts`, `graphify-out/GRAPH_REPORT.md`.
