# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-12)

## Corpus Check
- 24 files · ~10,830 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 300 nodes · 417 edges · 30 communities (20 shown, 10 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.69)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Metrics API & Project Records
- TypeScript Config
- Package & Dependencies
- Editable Records & Server Actions
- Vault Core 3D Particles
- ControlP Orchestrator
- CSS Build Tools & ESLint
- Panel Modules
- Intents API & Queue
- Command Deck Views
- Schedule API
- Project Registry
- Core Dashboard Page
- V1.3 Operational Concepts
- Vault Core Geometry
- App Layout
- Architecture Concepts
- CenterStage
- ESLint Config
- Adapter Config
- Next.js Config
- Env Declarations
- PostCSS Config
- README Concepts
- Tailwind Config
- Trazabilidad Contract

## God Nodes (most connected - your core abstractions)
1. `readProject()` - 17 edges
2. `compilerOptions` - 17 edges
3. `readMemory()` - 12 edges
4. `getProjects()` - 9 edges
5. `DataIssue` - 8 edges
6. `updateProjectField()` - 7 edges
7. `include` - 6 edges
8. `scripts` - 6 edges
9. `readEvidence()` - 6 edges
10. `buildCard()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `getProjects()`  [INFERRED]
  /private/tmp/controlp-graph-src/app/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `Home()` --calls--> `getProjects()`  [EXTRACTED]
  app/(core)/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `ProjectPage()` --calls--> `getProjects()`  [EXTRACTED]
  app/p/[slug]/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `GET()` --calls--> `readIntentQueue()`  [EXTRACTED]
  app/api/intents/route.ts → lib/intents.ts
- `GET()` --calls--> `readDayPlan()`  [EXTRACTED]
  app/api/schedule/route.ts → lib/schedule.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **V1.3 Operational Layer** — project_context_transactional_writeback, project_context_deck_views, project_context_3d_formations, project_context_schema_version [INFERRED 0.90]

## Communities (30 total, 10 thin omitted)

### Community 0 - "Metrics API & Project Records"
Cohesion: 0.10
Nodes (27): GET(), Home(), ProjectPage(), emptyEvidence(), EvidenceReading, execFileAsync, exists(), git() (+19 more)

### Community 1 - "TypeScript Config"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 2 - "Package & Dependencies"
Cohesion: 0.08
Nodes (24): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+16 more)

### Community 3 - "Editable Records & Server Actions"
Cohesion: 0.17
Nodes (20): EditableText(), BULLET_BY_FIELD, EditableField, updateProjectField(), UpdateResult, VALID_FIELDS, cleanOrNull(), EditableBullet (+12 more)

### Community 4 - "Vault Core 3D Particles"
Cohesion: 0.14
Nodes (16): GOLD, PALE, goTo(), healthPosition(), orbitPosition(), ProjectNode(), ProjectNodes(), projectPath() (+8 more)

### Community 5 - "ControlP Orchestrator"
Cohesion: 0.19
Nodes (21): clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet(), extractLatestSession() (+13 more)

### Community 6 - "CSS Build Tools & ESLint"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 7 - "Panel Modules"
Cohesion: 0.16
Nodes (10): DirectivesPanel(), DocumentsPanel(), leftPanels, PanelEntry, rightPanels, SchedulePanel(), PanelProps, VitalsPanel() (+2 more)

### Community 8 - "Intents API & Queue"
Cohesion: 0.22
Nodes (11): GET(), POST(), QueuePage(), STATUS_LABEL, appendIntent(), Intent, IntentSource, IntentStatus (+3 more)

### Community 9 - "Command Deck Views"
Cohesion: 0.22
Nodes (10): CommandDeckPanel(), QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE, DeckView, InboxView(), MetricsView(), PlanView() (+2 more)

### Community 10 - "Schedule API"
Cohesion: 0.42
Nodes (8): GET(), POST(), appendLogEntry(), DayPlan, planFile(), readDayPlan(), setDayItem(), today()

### Community 11 - "Project Registry"
Cohesion: 0.36
Nodes (8): dedupe(), discoverFromVault(), isValidEntry(), loadRegistry(), REGISTRY_FILE, RegistryEntry, resolveRepoPath(), slugify()

### Community 13 - "V1.3 Operational Concepts"
Cohesion: 0.33
Nodes (6): 3D Node Formations Orbit/Health-Ranking, Command Deck Display Views, SCHEMA_VERSION Data Contract, Sprint 3 — Voice I, Transactional Write-Back (Bitácora-first), V1.3.1 Schedule as Operational Agenda

### Community 14 - "Vault Core Geometry"
Cohesion: 0.50
Nodes (3): createParticleField(), createRandom(), ParticleField

### Community 15 - "App Layout"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

### Community 17 - "Architecture Concepts"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

## Knowledge Gaps
- **92 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `ParticleField`, `vaultSignals` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Metrics API & Project Records` to `Core Dashboard Page`, `ControlP Orchestrator`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `CSS Build Tools & ESLint` to `Package & Dependencies`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `Home()` connect `Core Dashboard Page` to `Metrics API & Project Records`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getProjects()` (e.g. with `Home()` and `GET()`) actually correct?**
  _`getProjects()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `ProjectCard`, `projectsDir` to the rest of the system?**
  _96 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Metrics API & Project Records` be split into smaller, more focused modules?**
  _Cohesion score 0.09957325746799431 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06451612903225806 - nodes in this community are weakly interconnected._