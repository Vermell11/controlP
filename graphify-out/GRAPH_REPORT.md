# Graph Report - .  (2026-07-13)

## Corpus Check
- 11 files · ~15,572 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 374 nodes · 597 edges · 27 communities (19 shown, 8 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Panel Modules & Command Deck
- Vault Core Visual Layer
- TypeScript Config
- Project Context & STT Architecture
- Memory Adapter & Editable Records
- Package & Dependencies
- Metrics & Schedule API
- Evidence & Git Adapter
- ControlP Orchestrator
- Dev Dependencies
- Core Dashboard & Panel Registry
- Voice Command Router
- Intents API & Queue
- Web Speech Provider
- 3D Geometry Layer
- App Layout
- STT Sidecar Server
- Architecture Rules
- ESLint Config
- Next.js Config
- Env Declarations
- PostCSS Config
- README Concepts
- STT Run Script
- Tailwind Config
- Trazabilidad Contract

## God Nodes (most connected - your core abstractions)
1. `readProject()` - 17 edges
2. `compilerOptions` - 17 edges
3. `ControlP` - 15 edges
4. `readMemory()` - 13 edges
5. `getProjects()` - 12 edges
6. `loadRegistry()` - 12 edges
7. `PanelProps` - 11 edges
8. `DataIssue` - 9 edges
9. `STT Sidecar (FastAPI + faster-whisper)` - 9 edges
10. `updateProjectField()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getProjects()`  [EXTRACTED]
  app/api/projects/route.ts → /private/tmp/controlp-graph-src/lib/controlp.ts
- `Home()` --calls--> `getProjects()`  [EXTRACTED]
  app/(core)/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `ProjectPage()` --calls--> `getProjects()`  [EXTRACTED]
  app/p/[slug]/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `getProjects()` --calls--> `buildCard()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/lib/controlp.ts → lib/controlp.ts
- `getProjects()` --calls--> `loadRegistry()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/lib/controlp.ts → lib/registry.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **STT Pipeline: Whisper Sidecar → /api/stt Proxy → Browser** — project_context_stt_sidecar, project_context_api_stt_proxy, project_context_local_whisper_stt, project_context_stt_url_env [EXTRACTED 0.95]
- **Voice Capture → Command Router → Intent Queue** — project_context_push_to_talk, project_context_command_router, project_context_intent_queue, project_context_local_whisper_stt [EXTRACTED 0.95]
- **STT Sidecar Runtime Stack (FastAPI + Uvicorn + faster-whisper + python-multipart)** — stt_requirements_fastapi, stt_requirements_uvicorn, stt_requirements_faster_whisper, stt_requirements_python_multipart [EXTRACTED 1.00]

## Communities (27 total, 8 thin omitted)

### Community 0 - "Panel Modules & Command Deck"
Cohesion: 0.09
Nodes (27): QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE, daysSince(), DeckView, FeedView(), formatHours(), InboxView() (+19 more)

### Community 1 - "Vault Core Visual Layer"
Cohesion: 0.09
Nodes (24): CenterStage(), VaultCore, fillStyle(), Vital(), GOLD, PALE, ParticleCore(), goTo() (+16 more)

### Community 2 - "TypeScript Config"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 3 - "Project Context & STT Architecture"
Cohesion: 0.08
Nodes (30): ControlP, /api/stt Proxy Endpoint, CameraDirector, Cerebro Obsidian Vault, Rule-Based Command Router, HUD Panels, iCloud Folder next build Hang (Environmental Debt), Intent Queue (+22 more)

### Community 4 - "Memory Adapter & Editable Records"
Cohesion: 0.15
Nodes (24): EditableText(), BULLET_BY_FIELD, EditableField, updateProjectField(), UpdateResult, VALID_FIELDS, cleanOrNull(), EditableBullet (+16 more)

### Community 5 - "Package & Dependencies"
Cohesion: 0.08
Nodes (24): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+16 more)

### Community 6 - "Metrics & Schedule API"
Cohesion: 0.16
Nodes (19): GET(), GET(), POST(), readCommitActivity(), appendLogEntry(), adapterConfig, dedupe(), discoverFromVault() (+11 more)

### Community 7 - "Evidence & Git Adapter"
Cohesion: 0.19
Nodes (18): emptyEvidence(), EvidenceReading, execFileAsync, exists(), git(), readEvidence(), emptyGraph(), GraphReading (+10 more)

### Community 8 - "ControlP Orchestrator"
Cohesion: 0.19
Nodes (21): clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet(), extractLatestSession() (+13 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 10 - "Core Dashboard & Panel Registry"
Cohesion: 0.13
Nodes (8): GET(), Clock(), leftPanels, rightPanels, Home(), Home(), getProjects(), GET()

### Community 11 - "Voice Command Router"
Cohesion: 0.18
Nodes (13): compact(), normalize(), NOTE_PREFIXES, routeCommand(), VoiceAction, VoiceProject, MicStatus, useMicLevel() (+5 more)

### Community 12 - "Intents API & Queue"
Cohesion: 0.22
Nodes (11): GET(), POST(), QueuePage(), STATUS_LABEL, appendIntent(), Intent, IntentSource, IntentStatus (+3 more)

### Community 13 - "Web Speech Provider"
Cohesion: 0.33
Nodes (6): getRecognition(), RecognitionConstructor, SpeechRecognitionEventLike, SpeechRecognitionLike, SpeechRecognitionResultLike, useSpeech()

### Community 14 - "3D Geometry Layer"
Cohesion: 0.50
Nodes (3): createParticleField(), createRandom(), ParticleField

### Community 15 - "App Layout"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

### Community 16 - "STT Sidecar Server"
Cohesion: 0.40
Nodes (3): Sidecar STT local de ControlP — faster-whisper (V1.4.2).  Transcripción en españ, transcribe(), UploadFile

### Community 17 - "Architecture Rules"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

## Knowledge Gaps
- **114 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `ControlP Local-First OS`, `Sistema de Trazabilidad` (+109 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Core Dashboard & Panel Registry` to `Panel Modules & Command Deck`, `ControlP Orchestrator`, `Metrics & Schedule API`, `Evidence & Git Adapter`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `loadRegistry()` connect `Metrics & Schedule API` to `Core Dashboard & Panel Registry`, `Memory Adapter & Editable Records`, `Evidence & Git Adapter`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getProjects()` (e.g. with `Home()` and `GET()`) actually correct?**
  _`getProjects()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `ProjectCard`, `projectsDir` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Panel Modules & Command Deck` be split into smaller, more focused modules?**
  _Cohesion score 0.09494949494949495 - nodes in this community are weakly interconnected._
- **Should `Vault Core Visual Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.0907563025210084 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._