# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-12)

## Corpus Check
- 17 files · ~7,069 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 244 nodes · 354 edges · 24 communities (17 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Role Adapters & Data Layer
- Vault Core Geometry
- Panel Modules
- Package & Dependencies
- ControlP Orchestrator
- TypeScript Config
- CSS Build Tools
- Core Page & Project Routes
- Registry & Config
- Next.js Type Declarations
- Architecture Concepts
- Intents API
- App Layout
- CenterStage
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
4. `getProjects()` - 10 edges
5. `DataIssue` - 9 edges
6. `PanelProps` - 7 edges
7. `buildCard()` - 7 edges
8. `include` - 6 edges
9. `readEvidence()` - 6 edges
10. `readGit()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Explicit Project Registry` --semantically_similar_to--> `Canonical Data Schema Ownership`  [INFERRED] [semantically similar]
  PROJECT_CONTEXT.md → AGENTS.md
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
- **V1.2.1 Truth Protocol Layer** — agents_canonical_schema_rule, agents_role_adapters_rule, project_context_project_registry, project_context_truth_protocol [INFERRED 0.90]

## Communities (24 total, 7 thin omitted)

### Community 0 - "Role Adapters & Data Layer"
Cohesion: 0.12
Nodes (31): emptyEvidence(), EvidenceReading, execFileAsync, exists(), git(), readEvidence(), emptyGraph(), GraphReading (+23 more)

### Community 1 - "Vault Core Geometry"
Cohesion: 0.14
Nodes (20): createLinkSegments(), createParticleField(), createRandom(), ParticleField, GOLD, PALE, ParticleCore(), goTo() (+12 more)

### Community 2 - "Panel Modules"
Cohesion: 0.17
Nodes (13): CommandDeckPanel(), COMMANDS, DirectivesPanel(), DocumentsPanel(), leftPanels, PanelEntry, rightPanels, SchedulePanel() (+5 more)

### Community 3 - "Package & Dependencies"
Cohesion: 0.09
Nodes (22): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+14 more)

### Community 4 - "ControlP Orchestrator"
Cohesion: 0.19
Nodes (21): clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet(), extractLatestSession() (+13 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.09
Nodes (22): ./*, dom, dom.iterable, esnext, compilerOptions, allowJs, baseUrl, esModuleInterop (+14 more)

### Community 6 - "CSS Build Tools"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+9 more)

### Community 7 - "Core Page & Project Routes"
Cohesion: 0.16
Nodes (5): Home(), ProjectPage(), Home(), getProjects(), GET()

### Community 8 - "Registry & Config"
Cohesion: 0.31
Nodes (8): adapterConfig, discoverFromVault(), isValidEntry(), loadRegistry(), REGISTRY_FILE, RegistryEntry, resolveRepoPath(), slugify()

### Community 9 - "Next.js Type Declarations"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 10 - "Architecture Concepts"
Cohesion: 0.33
Nodes (7): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern, Explicit Project Registry, Sprint 2 — Operational Panels V1.3, Tolerant Per-Line Intent Queue, Truth Protocol V1.2.1

### Community 11 - "Intents API"
Cohesion: 0.47
Nodes (5): GET(), Intent, POST(), QUEUE_FILE, readQueue()

### Community 12 - "App Layout"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

## Knowledge Gaps
- **72 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `GOLD`, `PALE` (+67 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Core Page & Project Routes` to `Role Adapters & Data Layer`, `Registry & Config`, `ControlP Orchestrator`?**
  _High betweenness centrality (0.038) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `CSS Build Tools` to `Package & Dependencies`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getProjects()` (e.g. with `Home()` and `GET()`) actually correct?**
  _`getProjects()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `ProjectCard`, `projectsDir` to the rest of the system?**
  _75 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Role Adapters & Data Layer` be split into smaller, more focused modules?**
  _Cohesion score 0.12222222222222222 - nodes in this community are weakly interconnected._
- **Should `Vault Core Geometry` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Package & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._