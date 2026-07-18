# Graph Report - ControlP  (2026-07-18)

## Corpus Check
- 75 files · ~23,925 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 448 nodes · 781 edges · 39 communities (21 shown, 18 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `143ea1fd`
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
1. `normalizeVoiceText()` - 18 edges
2. `compilerOptions` - 17 edges
3. `routeCommand()` - 15 edges
4. `loadRegistry()` - 14 edges
5. `readMemory()` - 13 edges
6. `getProjects()` - 13 edges
7. `PanelProps` - 12 edges
8. `POST()` - 9 edges
9. `DataIssue` - 9 edges
10. `vaultSignals` - 8 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `loadRegistry()`  [EXTRACTED]
  app/api/metrics/route.ts → lib/registry.ts
- `GET()` --calls--> `getProjects()`  [INFERRED]
  app/api/projects/route.ts → lib/controlp.ts
- `Notion Ledger — Session Close Connector` --conceptually_related_to--> `Adapter Pattern — Replace Tool Without Touching Domain/UI`  [INFERRED]
  PROJECT_CONTEXT.md → CONTEXT_MAP.md
- `Home()` --calls--> `getProjects()`  [EXTRACTED]
  app/(core)/page.tsx → lib/controlp.ts
- `GET()` --calls--> `readVoiceAliases()`  [EXTRACTED]
  app/api/assistant/aliases/route.ts → lib/voice-aliases.ts

## Import Cycles
- None detected.

## Communities (39 total, 18 thin omitted)

### Community 0 - "Vault Core Visual Layer"
Cohesion: 0.08
Nodes (42): emptyEvidence(), EvidenceReading, execFileAsync, exists(), git(), readCommitActivity(), readEvidence(), emptyGraph() (+34 more)

### Community 1 - "TypeScript Config"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 2 - "Core Dashboard & Panel Registry"
Cohesion: 0.07
Nodes (29): dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three, @types/three (+21 more)

### Community 3 - "Memory Adapter & Editable Records"
Cohesion: 0.12
Nodes (26): appendLogEntry(), EditableBullet, editStateFile(), updateNextStep(), updateStateBullet(), dedupe(), discoverFromVault(), isValidEntry() (+18 more)

### Community 4 - "Package & Dependencies"
Cohesion: 0.08
Nodes (27): Clock(), ProjectCard, formatDate(), obsidianUrl(), tone(), QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE (+19 more)

### Community 5 - "Metrics & Schedule API"
Cohesion: 0.08
Nodes (27): Adapter Pattern — Replace Tool Without Touching Domain/UI, app/api/projects/route.ts — Canonical Snapshot Endpoint, app/api/schedule/route.ts — Schedule Endpoint, app/components/CenterStage.tsx — Core Visual, Core Closed / Open to Extension Principle, config/projects.json — Project Registry Config, CONTEXT_MAP — Repo Module Map, graphify-out/ — Derived Technical Graph (+19 more)

### Community 6 - "ControlP Architecture Concepts"
Cohesion: 0.18
Nodes (10): app/api/ — frontera HTTP, app/components/panels/ — paneles del dashboard, app/components/vault-core/ — escena 3D (CORE, no tocar salvo bugfix), app/components/voice/ — captura y router de voz, app/ — rutas, CONTEXT_MAP — mapa del repo para sesiones de IA, lib/ — dominio y adaptadores (server-side), Módulos (+2 more)

### Community 7 - "Panel Modules & Command Deck"
Cohesion: 0.52
Nodes (6): DELETE(), GET(), globalStt, localRequest(), POST(), running()

### Community 8 - "Evidence & Git Adapter"
Cohesion: 0.40
Nodes (4): Closing Barrier, ControlP Agent Contract, Rules, Startup

### Community 9 - "ControlP Orchestrator"
Cohesion: 0.10
Nodes (43): GET(), POST(), answerKnowledgeQuery(), AssistantEvidence, AssistantResponse, compactVoiceText(), continueProjectQuery(), deckViewCommand (+35 more)

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
Cohesion: 0.06
Nodes (41): CenterStage(), VaultCore, useReducedMotion(), fillStyle(), Vital(), createLinkSegments(), createParticleField(), createRandom() (+33 more)

### Community 19 - "Architecture Rules"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

### Community 20 - "Community 20"
Cohesion: 0.20
Nodes (14): askOllama(), buildSemanticPrompt(), buildSemanticRepairPrompt(), compact(), expandTerms(), KnowledgeChunk, requireSkillConfirmation(), retrieveKnowledge() (+6 more)

### Community 21 - "STT Sidecar Dependencies"
Cohesion: 0.67
Nodes (3): FastAPI, python-multipart, Uvicorn

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): assistantUrl, controlp, healthyNotion, ragUrl, root

## Knowledge Gaps
- **140 isolated node(s):** `globalStt`, `VaultCore`, `VIEW_COMMANDS`, `QUEUE_COMMANDS`, `VIEW_TITLE` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PanelProps` connect `Package & Dependencies` to `App Layout`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `loadRegistry()` connect `Memory Adapter & Editable Records` to `Vault Core Visual Layer`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `ProjectCard` connect `Package & Dependencies` to `Vault Core Visual Layer`, `ControlP Orchestrator`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `globalStt`, `VaultCore`, `VIEW_COMMANDS` to the rest of the system?**
  _144 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vault Core Visual Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.08235294117647059 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._
- **Should `Core Dashboard & Panel Registry` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._