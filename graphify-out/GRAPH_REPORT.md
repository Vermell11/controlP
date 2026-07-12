# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-12)

## Corpus Check
- 8 files · ~7,346 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 252 nodes · 346 edges · 27 communities (19 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.71)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Vault Core Geometry
- Package & Dependencies
- Panel Modules
- Evidence/Git Adapter
- ControlP Orchestrator
- TypeScript Config
- CSS Build Tools
- Memory/Obsidian Adapter
- Core Page & Project Routes
- Registry & Config
- Next.js Type Declarations
- Intents API
- App Layout
- Architecture Concepts
- CenterStage
- Role Adapters Layer
- Quality Gates
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
5. `DataIssue` - 8 edges
6. `buildCard()` - 7 edges
7. `include` - 6 edges
8. `readEvidence()` - 6 edges
9. `loadRegistry()` - 6 edges
10. `scripts` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Home()` --calls--> `getProjects()`  [EXTRACTED]
  app/(core)/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `ProjectPage()` --calls--> `getProjects()`  [EXTRACTED]
  app/p/[slug]/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `getProjects()` --calls--> `buildCard()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/lib/controlp.ts → lib/controlp.ts
- `getProjects()` --calls--> `loadRegistry()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/lib/controlp.ts → lib/registry.ts
- `GET()` --calls--> `getProjects()`  [INFERRED]
  /private/tmp/controlp-graph-src/app/api/projects/route.ts → /private/tmp/controlp-graph-src/lib/controlp.ts

## Import Cycles
- None detected.

## Communities (27 total, 8 thin omitted)

### Community 0 - "Vault Core Geometry"
Cohesion: 0.14
Nodes (20): createLinkSegments(), createParticleField(), createRandom(), ParticleField, GOLD, PALE, ParticleCore(), goTo() (+12 more)

### Community 1 - "Package & Dependencies"
Cohesion: 0.08
Nodes (24): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+16 more)

### Community 2 - "Panel Modules"
Cohesion: 0.13
Nodes (13): CommandDeckPanel(), COMMANDS, DirectivesPanel(), DocumentsPanel(), leftPanels, PanelEntry, rightPanels, SchedulePanel() (+5 more)

### Community 3 - "Evidence/Git Adapter"
Cohesion: 0.19
Nodes (19): emptyEvidence(), EvidenceReading, execFileAsync, exists(), git(), readEvidence(), emptyGraph(), GraphReading (+11 more)

### Community 4 - "ControlP Orchestrator"
Cohesion: 0.19
Nodes (21): clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet(), extractLatestSession() (+13 more)

### Community 5 - "TypeScript Config"
Cohesion: 0.09
Nodes (22): ./*, dom, dom.iterable, esnext, compilerOptions, allowJs, baseUrl, esModuleInterop (+14 more)

### Community 6 - "CSS Build Tools"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 7 - "Memory/Obsidian Adapter"
Cohesion: 0.24
Nodes (13): cleanOrNull(), extractBullet(), firstParagraph(), inferStack(), listSessions(), MemoryReading, normalizeMarkdown(), readIfExists() (+5 more)

### Community 8 - "Core Page & Project Routes"
Cohesion: 0.16
Nodes (5): Home(), ProjectPage(), Home(), getProjects(), GET()

### Community 9 - "Registry & Config"
Cohesion: 0.36
Nodes (8): dedupe(), discoverFromVault(), isValidEntry(), loadRegistry(), REGISTRY_FILE, RegistryEntry, resolveRepoPath(), slugify()

### Community 10 - "Next.js Type Declarations"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 11 - "Intents API"
Cohesion: 0.47
Nodes (5): GET(), Intent, POST(), QUEUE_FILE, readQueue()

### Community 12 - "App Layout"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

### Community 14 - "Architecture Concepts"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

### Community 17 - "Role Adapters Layer"
Cohesion: 0.67
Nodes (3): Post-Close Context Reconciliation, Quality Gates npm run check, Registry id/slug Uniqueness Enforcement

## Knowledge Gaps
- **76 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `GOLD`, `PALE` (+71 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Core Page & Project Routes` to `Registry & Config`, `Evidence/Git Adapter`, `ControlP Orchestrator`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `CSS Build Tools` to `Package & Dependencies`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getProjects()` (e.g. with `Home()` and `GET()`) actually correct?**
  _`getProjects()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `config`, `ProjectCard`, `projectsDir` to the rest of the system?**
  _81 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vault Core Geometry` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Package & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Panel Modules` be split into smaller, more focused modules?**
  _Cohesion score 0.13438735177865613 - nodes in this community are weakly interconnected._