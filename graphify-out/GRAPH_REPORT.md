# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-12)

## Corpus Check
- 7 files · ~4,735 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 171 nodes · 222 edges · 17 communities (10 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Vault Core 3D Engine
- ControlP Data Layer
- Command Deck Module
- TypeScript Config
- CSS Build Tools
- Next.js Dependencies
- Next.js Type Declarations
- Package Metadata
- Intents API
- Architecture Concepts
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
3. `Home()` - 6 edges
4. `include` - 6 edges
5. `readGit()` - 5 edges
6. `ParticleCore()` - 5 edges
7. `StageNode` - 5 edges
8. `tone()` - 5 edges
9. `readGraphify()` - 4 edges
10. `exists()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Intent Queue Extension Point` --semantically_similar_to--> `Local Intent Queue API`  [INFERRED] [semantically similar]
  AGENTS.md → PROJECT_CONTEXT.md
- `ProjectNode()` --calls--> `tone()`  [EXTRACTED]
  app/components/vault-core/ProjectNodes.tsx → lib/ui.ts
- `Core Closed / Open to Extension` --rationale_for--> `Interactive HUD Panels`  [INFERRED]
  AGENTS.md → PROJECT_CONTEXT.md
- `Home()` --calls--> `formatDate()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/app/page.tsx → lib/ui.ts
- `Home()` --calls--> `obsidianUrl()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/app/page.tsx → lib/ui.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **V1.1 Interactive Layer** — project_context_hud_panels, project_context_intents_api, agents_intent_queue [INFERRED 0.85]

## Communities (17 total, 7 thin omitted)

### Community 0 - "Vault Core 3D Engine"
Cohesion: 0.12
Nodes (20): VaultCore, createLinkSegments(), createParticleField(), createRandom(), ParticleField, GOLD, PALE, ParticleCore() (+12 more)

### Community 1 - "ControlP Data Layer"
Cohesion: 0.17
Nodes (23): buildAlerts(), clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet() (+15 more)

### Community 2 - "Command Deck Module"
Cohesion: 0.14
Nodes (14): CommandDeck(), COMMANDS, ScheduleItem, SchedulePanel(), storageKey(), Fact(), Home(), PanelTitle() (+6 more)

### Community 3 - "TypeScript Config"
Cohesion: 0.09
Nodes (22): ./*, dom, dom.iterable, esnext, compilerOptions, allowJs, baseUrl, esModuleInterop (+14 more)

### Community 4 - "CSS Build Tools"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+9 more)

### Community 5 - "Next.js Dependencies"
Cohesion: 0.13
Nodes (15): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+7 more)

### Community 6 - "Next.js Type Declarations"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 7 - "Package Metadata"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, lint, version

### Community 8 - "Intents API"
Cohesion: 0.47
Nodes (5): GET(), Intent, POST(), QUEUE_FILE, readQueue()

### Community 9 - "Architecture Concepts"
Cohesion: 0.50
Nodes (5): Core Closed / Open to Extension, Intent Queue Extension Point, Interactive HUD Panels, Local Intent Queue API, Sprint 1 — Scalable Foundations V1.2

## Knowledge Gaps
- **65 isolated node(s):** `metadata`, `config`, `ProjectCard`, `projectsDir`, `VaultCore` (+60 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Command Deck Module` to `ControlP Data Layer`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `tone()` connect `Command Deck Module` to `Vault Core 3D Engine`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **What connects `metadata`, `config`, `ProjectCard` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vault Core 3D Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.12315270935960591 - nodes in this community are weakly interconnected._
- **Should `Command Deck Module` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `CSS Build Tools` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._