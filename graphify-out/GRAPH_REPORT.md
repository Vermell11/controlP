# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-13)

## Corpus Check
- 15 files · ~11,780 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 315 nodes · 441 edges · 31 communities (20 shown, 11 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `046b74e8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- Project Registry
- Interactive 3D Formations
- Core Dashboard Page
- V1.3 Operational Concepts
- Vault Core Geometry
- UI Utilities
- Architecture Concepts
- VaultCore Renderer
- Adapter Config
- Next.js Config
- Env Declarations
- PostCSS Config
- README Concepts
- Tailwind Config
- Trazabilidad Contract
- Trazabilidad Contract

## God Nodes (most connected - your core abstractions)
1. `private_tmp_controlp_graph_src_lib_controlp_ts` - 24 edges
2. `lib_adapters_memory_obsidian` - 24 edges
3. `tsconfig_compileroptions` - 17 edges
4. `lib_controlp_readproject` - 17 edges
5. `app_components_panels_deckviews` - 17 edges
6. `lib_controlp` - 14 edges
7. `lib_schema` - 13 edges
8. `lib_adapters_memory_obsidian_readmemory` - 13 edges
9. `app_components_panels_commanddeckpanel` - 13 edges
10. `package_devdependencies` - 11 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (31 total, 11 thin omitted)

### Community 0 - "Metrics API & Project Records"
Cohesion: 0.09
Nodes (27): GET(), leftPanels, PanelEntry, rightPanels, Home(), ProjectPage(), emptyEvidence(), EvidenceReading (+19 more)

### Community 1 - "TypeScript Config"
Cohesion: 0.10
Nodes (21): fillStyle(), Vital(), GOLD, PALE, ParticleCore(), goTo(), gridPosition(), healthPosition() (+13 more)

### Community 2 - "Package & Dependencies"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 3 - "Editable Records & Server Actions"
Cohesion: 0.12
Nodes (17): QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE, daysSince(), DeckView, FeedView(), formatHours(), InboxView() (+9 more)

### Community 4 - "Vault Core 3D Particles"
Cohesion: 0.16
Nodes (22): EditableText(), BULLET_BY_FIELD, EditableField, updateProjectField(), UpdateResult, VALID_FIELDS, cleanOrNull(), EditableBullet (+14 more)

### Community 5 - "ControlP Orchestrator"
Cohesion: 0.16
Nodes (24): buildAlerts(), buildCard(), clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists() (+16 more)

### Community 6 - "CSS Build Tools & ESLint"
Cohesion: 0.08
Nodes (24): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+16 more)

### Community 7 - "Panel Modules"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 8 - "Intents API & Queue"
Cohesion: 0.22
Nodes (11): GET(), POST(), QueuePage(), STATUS_LABEL, appendIntent(), Intent, IntentSource, IntentStatus (+3 more)

### Community 9 - "Command Deck Views"
Cohesion: 0.42
Nodes (8): GET(), POST(), appendLogEntry(), DayPlan, planFile(), readDayPlan(), setDayItem(), today()

### Community 10 - "Project Registry"
Cohesion: 0.36
Nodes (8): dedupe(), discoverFromVault(), isValidEntry(), loadRegistry(), REGISTRY_FILE, RegistryEntry, resolveRepoPath(), slugify()

### Community 11 - "Interactive 3D Formations"
Cohesion: 0.32
Nodes (8): Auto-Sized Grid Formation, CSS Morph Transition, CameraDirector, Command Deck Views, Fish-Eye Lens Effect, Health Diagnostic Formation, Interactive 3D Formations, Vitals with Progress Bars

### Community 13 - "V1.3 Operational Concepts"
Cohesion: 0.50
Nodes (3): createParticleField(), createRandom(), ParticleField

### Community 14 - "Vault Core Geometry"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

### Community 16 - "UI Utilities"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

## Knowledge Gaps
- **93 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `ParticleField`, `vaultSignals` (+88 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.