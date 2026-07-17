# Graph Report - .  (2026-07-17)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 380 nodes · 563 edges · 42 communities (25 shown, 17 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Corpus snapshot commit: `9853ed5f` (`V1.4.4`).
- A later reconciliation-only commit may differ from this value without changing the
  indexed corpus; use `graphify check-update .` as the freshness check.
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
- [[_COMMUNITY_STT Sidecar Server|STT Sidecar Server]]
- [[_COMMUNITY_Architecture Rules|Architecture Rules]]
- [[_COMMUNITY_Mic Level Hook|Mic Level Hook]]
- [[_COMMUNITY_STT Sidecar Dependencies|STT Sidecar Dependencies]]
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
1. `readProject()` - 17 edges
2. `compilerOptions` - 17 edges
3. `readMemory()` - 13 edges
4. `loadRegistry()` - 12 edges
5. `getProjects()` - 11 edges
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
- `getProjects()` --calls--> `loadRegistry()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/lib/controlp.ts → lib/registry.ts
- `GET()` --calls--> `readIntentQueue()`  [EXTRACTED]
  app/api/intents/route.ts → lib/intents.ts
- `GET()` --calls--> `loadRegistry()`  [EXTRACTED]
  app/api/metrics/route.ts → lib/registry.ts

## Import Cycles
- None detected.

## Communities (42 total, 17 thin omitted)

### Community 0 - "Vault Core Visual Layer"
Cohesion: 0.08
Nodes (27): GET(), GET(), ProjectPage(), Home(), emptyEvidence(), EvidenceReading, execFileAsync, exists() (+19 more)

### Community 1 - "TypeScript Config"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 2 - "Core Dashboard & Panel Registry"
Cohesion: 0.07
Nodes (29): dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three, @types/three (+21 more)

### Community 3 - "Memory Adapter & Editable Records"
Cohesion: 0.16
Nodes (22): EditableText(), BULLET_BY_FIELD, EditableField, updateProjectField(), UpdateResult, VALID_FIELDS, cleanOrNull(), EditableBullet (+14 more)

### Community 4 - "Package & Dependencies"
Cohesion: 0.17
Nodes (13): DocumentsPanel(), leftPanels, PanelEntry, rightPanels, PanelProps, fillStyle(), Vital(), ProjectRecord() (+5 more)

### Community 5 - "Metrics & Schedule API"
Cohesion: 0.10
Nodes (24): Adapter Pattern — Replace Tool Without Touching Domain/UI, app/api/projects/route.ts — Canonical Snapshot Endpoint, app/api/schedule/route.ts — Schedule Endpoint, app/components/CenterStage.tsx — Core Visual, Core Closed / Open to Extension Principle, config/projects.json — Project Registry Config, CONTEXT_MAP — Repo Module Map, graphify-out/ — Derived Technical Graph (+16 more)

### Community 6 - "ControlP Architecture Concepts"
Cohesion: 0.13
Nodes (17): VaultCore, goTo(), gridPosition(), healthPosition(), orbitPosition(), ProjectNode(), ProjectNodes(), projectPath() (+9 more)

### Community 7 - "Panel Modules & Command Deck"
Cohesion: 0.13
Nodes (17): QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE, daysSince(), DeckView, FeedView(), formatHours(), InboxView() (+9 more)

### Community 8 - "Evidence & Git Adapter"
Cohesion: 0.19
Nodes (21): clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet(), extractLatestSession() (+13 more)

### Community 9 - "ControlP Orchestrator"
Cohesion: 0.18
Nodes (17): GET(), POST(), appendLogEntry(), adapterConfig, dedupe(), discoverFromVault(), isValidEntry(), loadRegistry() (+9 more)

### Community 10 - "Dev Dependencies"
Cohesion: 0.14
Nodes (17): app/api/intents/route.ts — Intent Queue Endpoint, app/api/stt/route.ts — STT Proxy Endpoint, lib/intents.ts — Intent Queue JSONL, PTT Voice Capture Flow, runtime/intents.jsonl — Append-only Intent Log, stt/server.py — FastAPI Whisper Sidecar, vault-core/ProjectNodes.tsx — Project Orbs 3D, vault-core/ParticleCore.tsx — Equalizer Sphere Shader (+9 more)

### Community 11 - "Intents, STT & LLM Extension Points"
Cohesion: 0.20
Nodes (10): GET(), POST(), appendIntent(), Intent, IntentSource, IntentStatus, QUEUE_FILE, QueueReading (+2 more)

### Community 12 - "Intents API & Queue"
Cohesion: 0.29
Nodes (9): compact(), normalize(), NOTE_PREFIXES, routeCommand(), VoiceAction, VoiceProject, STATUS_TEXT, SttProvider (+1 more)

### Community 13 - "Core Page & Projects API"
Cohesion: 0.33
Nodes (6): getRecognition(), RecognitionConstructor, SpeechRecognitionEventLike, SpeechRecognitionLike, SpeechRecognitionResultLike, useSpeech()

### Community 14 - "Voice Command Router"
Cohesion: 0.50
Nodes (3): createParticleField(), createRandom(), ParticleField

### Community 15 - "Web Speech Provider"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

### Community 16 - "3D Geometry Layer"
Cohesion: 0.40
Nodes (3): Sidecar STT local de ControlP — faster-whisper (V1.4.2).  Transcripción en españ, transcribe(), UploadFile

### Community 19 - "Architecture Rules"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

### Community 21 - "STT Sidecar Dependencies"
Cohesion: 0.67
Nodes (3): FastAPI, python-multipart, Uvicorn

## Knowledge Gaps
- **124 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `ControlP Local-First OS`, `Sistema de Trazabilidad` (+119 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Vault Core Visual Layer` to `Evidence & Git Adapter`, `ControlP Orchestrator`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `loadRegistry()` connect `ControlP Orchestrator` to `Vault Core Visual Layer`, `Memory Adapter & Editable Records`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getProjects()` (e.g. with `Home()` and `GET()`) actually correct?**
  _`getProjects()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `ProjectCard`, `projectsDir` to the rest of the system?**
  _128 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vault Core Visual Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.08305647840531562 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._
- **Should `Core Dashboard & Panel Registry` be split into smaller, more focused modules?**
  _Cohesion score 0.06666666666666667 - nodes in this community are weakly interconnected._
