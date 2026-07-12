# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-12)

## Corpus Check
- 20 files · ~5,560 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 200 nodes · 260 edges · 22 communities (16 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- ControlP Data Layer
- Package & Dependencies
- TypeScript Config
- Panel Modules
- Vault Core Geometry
- CSS Build Tools
- Core Page
- CenterStage & Clock
- Next.js Type Declarations
- Architecture Concepts
- ProjectNodes 3D
- Intents API
- App Layout
- Next.js Config
- Env Declarations
- PostCSS Config
- README Concepts
- Tailwind Config
- Trazabilidad Contract

## God Nodes (most connected - your core abstractions)
1. `readProject()` - 17 edges
2. `compilerOptions` - 17 edges
3. `PanelProps` - 9 edges
4. `include` - 6 edges
5. `PanelTitle()` - 6 edges
6. `readGit()` - 5 edges
7. `Sprint 1 Foundations Complete` - 5 edges
8. `readGraphify()` - 4 edges
9. `exists()` - 4 edges
10. `ParticleCore()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Sprint 1 Foundations Complete` --references--> `Panel Registry Extension Point`  [EXTRACTED]
  PROJECT_CONTEXT.md → AGENTS.md
- `GET()` --calls--> `getProjects()`  [INFERRED]
  /private/tmp/controlp-graph-src/app/api/projects/route.ts → /private/tmp/controlp-graph-src/lib/controlp.ts
- `Home()` --calls--> `getProjects()`  [INFERRED]
  /private/tmp/controlp-graph-src/app/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts
- `PanelEntry` --references--> `PanelProps`  [EXTRACTED]
  app/components/panels/registry.ts → app/components/panels/types.ts
- `ParticleCore()` --calls--> `createLinkSegments()`  [EXTRACTED]
  app/components/vault-core/ParticleCore.tsx → app/components/vault-core/geometry.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **V1.2 Modular Architecture** — agents_panel_registry_ext, agents_core_modules, project_context_css_splitting, project_context_project_records [INFERRED 0.90]

## Communities (22 total, 6 thin omitted)

### Community 0 - "ControlP Data Layer"
Cohesion: 0.17
Nodes (23): buildAlerts(), clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet() (+15 more)

### Community 1 - "Package & Dependencies"
Cohesion: 0.09
Nodes (22): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+14 more)

### Community 2 - "TypeScript Config"
Cohesion: 0.09
Nodes (22): ./*, dom, dom.iterable, esnext, compilerOptions, allowJs, baseUrl, esModuleInterop (+14 more)

### Community 3 - "Panel Modules"
Cohesion: 0.24
Nodes (11): CommandDeckPanel(), COMMANDS, DirectivesPanel(), DocumentsPanel(), PanelEntry, SchedulePanel(), storageKey(), PanelProps (+3 more)

### Community 4 - "Vault Core Geometry"
Cohesion: 0.19
Nodes (14): createLinkSegments(), createParticleField(), createRandom(), ParticleField, GOLD, PALE, ParticleCore(), useVaultSignals() (+6 more)

### Community 5 - "CSS Build Tools"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+9 more)

### Community 6 - "Core Page"
Cohesion: 0.20
Nodes (3): Home(), getProjects(), GET()

### Community 7 - "CenterStage & Clock"
Cohesion: 0.28
Nodes (5): CenterStage(), VaultCore, Clock(), leftPanels, rightPanels

### Community 8 - "Next.js Type Declarations"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 9 - "Architecture Concepts"
Cohesion: 0.29
Nodes (7): Core Module Boundary, Panel Registry Extension Point, Per-Component CSS Code Splitting, Mobile Responsive Experience, Project Record Pages /p/[project], Sprint 1 Foundations Complete, Sprint 2 — Operational Panels V1.3

### Community 10 - "ProjectNodes 3D"
Cohesion: 0.48
Nodes (6): goTo(), nodePosition(), ProjectNode(), ProjectNodes(), projectPath(), TONE_COLORS

### Community 11 - "Intents API"
Cohesion: 0.47
Nodes (5): GET(), Intent, POST(), QUEUE_FILE, readQueue()

### Community 13 - "App Layout"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

## Knowledge Gaps
- **68 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `GOLD`, `PALE` (+63 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `CSS Build Tools` to `Package & Dependencies`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `compilerOptions` connect `TypeScript Config` to `Next.js Type Declarations`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `config`, `ProjectCard`, `projectsDir` to the rest of the system?**
  _71 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Package & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `CSS Build Tools` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._