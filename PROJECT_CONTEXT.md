# ControlP Context

ControlP is a local-first visual Agentic Project OS for Andres Ortega. It reads the Cerebro Obsidian vault as the project index, resolves local project folders under `/code`, and visualizes Git, Graphify, sessions, health, and next steps in a V.A.U.L.T.-style dashboard.

Current state: V1.0 implements a read-only Next.js interface, Obsidian project discovery, Git/Graphify adapters, an API endpoint, and a 3D particle core (Three.js/React Three Fiber) with orbiting clickable project nodes, mouse orbit/zoom, hover glow, and a mutable signals layer (`vaultSignals`) prepared for the future voice phase.

Reto actual: close and register V1.0 after Git, Obsidian, Graphify, validation, Notion prepare, confirmation, tag, and push.

Pointers: `app/page.tsx`, `app/components/CenterStage.tsx`, `app/components/vault-core/`, `lib/controlp.ts`, `graphify-out/GRAPH_REPORT.md`.
