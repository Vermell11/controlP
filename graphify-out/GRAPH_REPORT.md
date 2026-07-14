# Graph Report - .  (2026-07-13)

## Corpus Check
- 8 files · ~17,079 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 395 nodes · 596 edges · 40 communities (24 shown, 16 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Vault Core Visual Layer
- TypeScript Config
- Core Dashboard & Panel Registry
- Memory Adapter & Editable Records
- Package & Dependencies
- Metrics & Schedule API
- ControlP Architecture Concepts
- Panel Modules & Command Deck
- Evidence & Git Adapter
- ControlP Orchestrator
- Dev Dependencies
- Intents, STT & LLM Extension Points
- Intents API & Queue
- Core Page & Projects API
- Voice Command Router
- Web Speech Provider
- 3D Geometry Layer
- App Layout
- STT Sidecar Server
- Architecture Rules
- Mic Level Hook
- STT Sidecar Dependencies
- Command Deck Views
- ESLint Config
- Next.js Config
- Env Declarations
- PostCSS Config
- README Concepts
- STT Run Script
- Tailwind Config
- Trazabilidad Contract
- Metrics API Concept
- Schedule Lib Concept
- UI Lib Concept
- Vault Core Geometry Concept
- Voice Visualizer Concept
- faster-whisper Dependency

## God Nodes (most connected - your core abstractions)
1. `readProject()` - 17 edges
2. `compilerOptions` - 17 edges
3. `readMemory()` - 13 edges
4. `getProjects()` - 12 edges
5. `loadRegistry()` - 12 edges
6. `PanelProps` - 9 edges
7. `DataIssue` - 9 edges
8. `updateProjectField()` - 8 edges
9. `buildCard()` - 7 edges
10. `vaultSignals — Frame-read Mutable Animation State` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Notion Ledger — Session Close Connector` --conceptually_related_to--> `Adapter Pattern — Replace Tool Without Touching Domain/UI`  [INFERRED]
  PROJECT_CONTEXT.md → CONTEXT_MAP.md
- `GET()` --calls--> `getProjects()`  [EXTRACTED]
  app/api/projects/route.ts → /private/tmp/controlp-graph-src/lib/controlp.ts
- `Home()` --calls--> `getProjects()`  [EXTRACTED]
  app/(core)/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `ProjectPage()` --calls--> `getProjects()`  [EXTRACTED]
  app/p/[slug]/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `getProjects()` --calls--> `buildCard()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/lib/controlp.ts → lib/controlp.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Voice STT Pipeline: PTT → Whisper/WebSpeech → routeCommand → VoiceAction** — controlp_voice_panel, controlp_voice_usewhisper, controlp_voice_usespeech, controlp_voice_commands, controlp_api_stt, controlp_stt_server [EXTRACTED 1.00]
- **Data Adapter Triad: Memory + Evidence + Graph feeding Orchestrator** — controlp_lib_controlp, controlp_lib_adapter_memory, controlp_lib_adapter_evidence, controlp_lib_adapter_graph [EXTRACTED 1.00]
- **Extension Seams: panels/registry + voice/commands + lib/adapters** — controlp_panels_registry, controlp_voice_commands, controlp_lib_adapter_memory, controlp_lib_adapter_evidence, controlp_lib_adapter_graph [INFERRED 0.85]
- **STT Sidecar Runtime Stack (FastAPI + Uvicorn + faster-whisper + python-multipart)** — stt_requirements_fastapi, stt_requirements_uvicorn, stt_requirements_faster_whisper, stt_requirements_python_multipart [EXTRACTED 1.00]

## Communities (40 total, 16 thin omitted)

### Community 0 - "Vault Core Visual Layer"
Cohesion: 0.10
Nodes (22): CenterStage(), VaultCore, GOLD, PALE, ParticleCore(), goTo(), gridPosition(), healthPosition() (+14 more)

### Community 1 - "TypeScript Config"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 2 - "Core Dashboard & Panel Registry"
Cohesion: 0.15
Nodes (15): Clock(), DocumentsPanel(), leftPanels, PanelEntry, rightPanels, PanelProps, fillStyle(), Vital() (+7 more)

### Community 3 - "Memory Adapter & Editable Records"
Cohesion: 0.15
Nodes (24): EditableText(), BULLET_BY_FIELD, EditableField, updateProjectField(), UpdateResult, VALID_FIELDS, cleanOrNull(), EditableBullet (+16 more)

### Community 4 - "Package & Dependencies"
Cohesion: 0.08
Nodes (24): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+16 more)

### Community 5 - "Metrics & Schedule API"
Cohesion: 0.16
Nodes (19): GET(), GET(), POST(), readCommitActivity(), appendLogEntry(), adapterConfig, dedupe(), discoverFromVault() (+11 more)

### Community 6 - "ControlP Architecture Concepts"
Cohesion: 0.10
Nodes (24): Adapter Pattern — Replace Tool Without Touching Domain/UI, app/api/projects/route.ts — Canonical Snapshot Endpoint, app/api/schedule/route.ts — Schedule Endpoint, app/components/CenterStage.tsx — Core Visual, Core Closed / Open to Extension Principle, config/projects.json — Project Registry Config, CONTEXT_MAP — Repo Module Map, graphify-out/ — Derived Technical Graph (+16 more)

### Community 7 - "Panel Modules & Command Deck"
Cohesion: 0.13
Nodes (17): QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE, daysSince(), DeckView, FeedView(), formatHours(), InboxView() (+9 more)

### Community 8 - "Evidence & Git Adapter"
Cohesion: 0.19
Nodes (18): emptyEvidence(), EvidenceReading, execFileAsync, exists(), git(), readEvidence(), emptyGraph(), GraphReading (+10 more)

### Community 9 - "ControlP Orchestrator"
Cohesion: 0.19
Nodes (21): clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet(), extractLatestSession() (+13 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 11 - "Intents, STT & LLM Extension Points"
Cohesion: 0.14
Nodes (17): app/api/intents/route.ts — Intent Queue Endpoint, app/api/stt/route.ts — STT Proxy Endpoint, lib/intents.ts — Intent Queue JSONL, PTT Voice Capture Flow, runtime/intents.jsonl — Append-only Intent Log, stt/server.py — FastAPI Whisper Sidecar, vault-core/ProjectNodes.tsx — Project Orbs 3D, vault-core/ParticleCore.tsx — Equalizer Sphere Shader (+9 more)

### Community 12 - "Intents API & Queue"
Cohesion: 0.22
Nodes (11): GET(), POST(), QueuePage(), STATUS_LABEL, appendIntent(), Intent, IntentSource, IntentStatus (+3 more)

### Community 13 - "Core Page & Projects API"
Cohesion: 0.17
Nodes (5): GET(), Home(), Home(), getProjects(), GET()

### Community 14 - "Voice Command Router"
Cohesion: 0.29
Nodes (9): compact(), normalize(), NOTE_PREFIXES, routeCommand(), VoiceAction, VoiceProject, STATUS_TEXT, SttProvider (+1 more)

### Community 15 - "Web Speech Provider"
Cohesion: 0.33
Nodes (6): getRecognition(), RecognitionConstructor, SpeechRecognitionEventLike, SpeechRecognitionLike, SpeechRecognitionResultLike, useSpeech()

### Community 16 - "3D Geometry Layer"
Cohesion: 0.50
Nodes (3): createParticleField(), createRandom(), ParticleField

### Community 17 - "App Layout"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

### Community 18 - "STT Sidecar Server"
Cohesion: 0.40
Nodes (3): Sidecar STT local de ControlP — faster-whisper (V1.4.2).  Transcripción en españ, transcribe(), UploadFile

### Community 19 - "Architecture Rules"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

### Community 21 - "STT Sidecar Dependencies"
Cohesion: 0.67
Nodes (3): FastAPI, python-multipart, Uvicorn

## Knowledge Gaps
- **120 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `ControlP Local-First OS`, `Sistema de Trazabilidad` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Core Page & Projects API` to `Evidence & Git Adapter`, `ControlP Orchestrator`, `Core Dashboard & Panel Registry`, `Metrics & Schedule API`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `loadRegistry()` connect `Metrics & Schedule API` to `Evidence & Git Adapter`, `Memory Adapter & Editable Records`, `Core Page & Projects API`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getProjects()` (e.g. with `Home()` and `GET()`) actually correct?**
  _`getProjects()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `ProjectCard`, `projectsDir` to the rest of the system?**
  _125 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vault Core Visual Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.0989247311827957 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Core Dashboard & Panel Registry` be split into smaller, more focused modules?**
  _Cohesion score 0.14532019704433496 - nodes in this community are weakly interconnected._