# Graph Report - ControlP  (2026-07-17)

## Corpus Check
- 70 files · ~19,532 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 404 nodes · 660 edges · 39 communities (21 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a8b7e8cb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Vault Core Visual Layer|Vault Core Visual Layer]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Core Dashboard & Panel Registry|Core Dashboard & Panel Registry]]
- [[_COMMUNITY_Memory Adapter & Editable Records|Memory Adapter & Editable Records]]
- [[_COMMUNITY_Package & Dependencies|Package & Dependencies]]
- [[_COMMUNITY_Metrics & Schedule API|Metrics & Schedule API]]
- [[_COMMUNITY_ControlP Architecture Concepts|ControlP Architecture Concepts]]
- [[_COMMUNITY_Panel Modules & Command Deck|Panel Modules & Command Deck]]
- [[_COMMUNITY_Evidence & Git Adapter|Evidence & Git Adapter]]
- [[_COMMUNITY_ControlP Orchestrator|ControlP Orchestrator]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Intents, STT & LLM Extension Points|Intents, STT & LLM Extension Points]]
- [[_COMMUNITY_Intents API & Queue|Intents API & Queue]]
- [[_COMMUNITY_Core Page & Projects API|Core Page & Projects API]]
- [[_COMMUNITY_Voice Command Router|Voice Command Router]]
- [[_COMMUNITY_Web Speech Provider|Web Speech Provider]]
- [[_COMMUNITY_3D Geometry Layer|3D Geometry Layer]]
- [[_COMMUNITY_App Layout|App Layout]]
- [[_COMMUNITY_Architecture Rules|Architecture Rules]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_STT Sidecar Dependencies|STT Sidecar Dependencies]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_Env Declarations|Env Declarations]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_README Concepts|README Concepts]]
- [[_COMMUNITY_STT Run Script|STT Run Script]]
- [[_COMMUNITY_Tailwind Config|Tailwind Config]]
- [[_COMMUNITY_Trazabilidad Contract|Trazabilidad Contract]]
- [[_COMMUNITY_Metrics API Concept|Metrics API Concept]]
- [[_COMMUNITY_Schedule Lib Concept|Schedule Lib Concept]]
- [[_COMMUNITY_UI Lib Concept|UI Lib Concept]]
- [[_COMMUNITY_Vault Core Geometry Concept|Vault Core Geometry Concept]]
- [[_COMMUNITY_Voice Visualizer Concept|Voice Visualizer Concept]]
- [[_COMMUNITY_Community 40|Community 40]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `readMemory()` - 13 edges
3. `getProjects()` - 13 edges
4. `PanelProps` - 12 edges
5. `loadRegistry()` - 12 edges
6. `routeCommand()` - 9 edges
7. `DataIssue` - 9 edges
8. `vaultSignals` - 8 edges
9. `normalizeVoiceText()` - 8 edges
10. `Módulos` - 8 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getProjects()`  [INFERRED]
  app/api/projects/route.ts → lib/controlp.ts
- `Notion Ledger — Session Close Connector` --conceptually_related_to--> `Adapter Pattern — Replace Tool Without Touching Domain/UI`  [INFERRED]
  PROJECT_CONTEXT.md → CONTEXT_MAP.md
- `Home()` --calls--> `getProjects()`  [EXTRACTED]
  app/(core)/page.tsx → lib/controlp.ts
- `GET()` --calls--> `readVoiceAliases()`  [EXTRACTED]
  app/api/assistant/aliases/route.ts → lib/voice-aliases.ts
- `POST()` --calls--> `getProjects()`  [EXTRACTED]
  app/api/assistant/aliases/route.ts → lib/controlp.ts

## Import Cycles
- None detected.

## Communities (39 total, 18 thin omitted)

### Community 0 - "Vault Core Visual Layer"
Cohesion: 0.11
Nodes (31): emptyEvidence(), EvidenceReading, execFileAsync, exists(), git(), readCommitActivity(), readEvidence(), emptyGraph() (+23 more)

### Community 1 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 2 - "Core Dashboard & Panel Registry"
Cohesion: 0.07
Nodes (29): dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three, @types/three (+21 more)

### Community 3 - "Memory Adapter & Editable Records"
Cohesion: 0.10
Nodes (31): appendLogEntry(), cleanOrNull(), EditableBullet, editStateFile(), extractBullet(), firstParagraph(), inferStack(), listSessions() (+23 more)

### Community 4 - "Package & Dependencies"
Cohesion: 0.10
Nodes (21): ProjectCard, QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE, DeckView, FeedView(), InboxView(), MetricsView() (+13 more)

### Community 5 - "Metrics & Schedule API"
Cohesion: 0.08
Nodes (27): Adapter Pattern — Replace Tool Without Touching Domain/UI, app/api/projects/route.ts — Canonical Snapshot Endpoint, app/api/schedule/route.ts — Schedule Endpoint, app/components/CenterStage.tsx — Core Visual, Core Closed / Open to Extension Principle, config/projects.json — Project Registry Config, CONTEXT_MAP — Repo Module Map, graphify-out/ — Derived Technical Graph (+19 more)

### Community 6 - "ControlP Architecture Concepts"
Cohesion: 0.18
Nodes (10): app/api/ — frontera HTTP, app/components/panels/ — paneles del dashboard, app/components/vault-core/ — escena 3D (CORE, no tocar salvo bugfix), app/components/voice/ — captura y router de voz, app/ — rutas, CONTEXT_MAP — mapa del repo para sesiones de IA, lib/ — dominio y adaptadores (server-side), Módulos (+2 more)

### Community 7 - "Panel Modules & Command Deck"
Cohesion: 0.17
Nodes (10): formatDate(), obsidianUrl(), tone(), ProjectRecord(), ProjectPage(), goTo(), ProjectNode(), projectPath() (+2 more)

### Community 8 - "Evidence & Git Adapter"
Cohesion: 0.40
Nodes (4): Closing Barrier, ControlP Agent Contract, Rules, Startup

### Community 9 - "ControlP Orchestrator"
Cohesion: 0.13
Nodes (28): GET(), POST(), answerKnowledgeQuery(), AssistantEvidence, AssistantResponse, compactVoiceText(), findProject(), isHomeNavigation() (+20 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.14
Nodes (17): app/api/intents/route.ts — Intent Queue Endpoint, app/api/stt/route.ts — STT Proxy Endpoint, lib/intents.ts — Intent Queue JSONL, PTT Voice Capture Flow, runtime/intents.jsonl — Append-only Intent Log, stt/server.py — FastAPI Whisper Sidecar, vault-core/ProjectNodes.tsx — Project Orbs 3D, vault-core/ParticleCore.tsx — Equalizer Sphere Shader (+9 more)

### Community 11 - "Intents, STT & LLM Extension Points"
Cohesion: 0.22
Nodes (11): GET(), POST(), appendIntent(), Intent, IntentSource, IntentStatus, QUEUE_FILE, QueueReading (+3 more)

### Community 16 - "3D Geometry Layer"
Cohesion: 0.40
Nodes (3): Sidecar STT local de ControlP — faster-whisper (V1.4.2).  Transcripción en españ, transcribe(), UploadFile

### Community 17 - "App Layout"
Cohesion: 0.08
Nodes (34): useReducedMotion(), createLinkSegments(), createParticleField(), createRandom(), ParticleField, GOLD, PALE, ParticleCore() (+26 more)

### Community 19 - "Architecture Rules"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

### Community 20 - "Community 20"
Cohesion: 0.23
Nodes (8): CenterStage(), VaultCore, Clock(), Home(), getProjects(), leftPanels, rightPanels, GET()

### Community 21 - "STT Sidecar Dependencies"
Cohesion: 0.67
Nodes (3): FastAPI, python-multipart, Uvicorn

### Community 22 - "Community 22"
Cohesion: 0.50
Nodes (3): assistantUrl, controlp, root

## Knowledge Gaps
- **136 isolated node(s):** `VaultCore`, `VIEW_COMMANDS`, `QUEUE_COMMANDS`, `VIEW_TITLE`, `TrendData` (+131 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `loadRegistry()` connect `Vault Core Visual Layer` to `Memory Adapter & Editable Records`, `Community 20`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `PanelProps` connect `Package & Dependencies` to `App Layout`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `getProjects()` connect `Community 20` to `Vault Core Visual Layer`, `ControlP Orchestrator`, `Panel Modules & Command Deck`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `VaultCore`, `VIEW_COMMANDS`, `QUEUE_COMMANDS` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vault Core Visual Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.10953058321479374 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Core Dashboard & Panel Registry` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._