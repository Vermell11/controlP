# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-11)

## Corpus Check
- 20 files · ~4,079 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 159 nodes · 206 edges · 15 communities (10 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Vault Core 3D Engine
- ControlP Data Layer
- TypeScript Config
- CSS Build Tools
- Dashboard UI Components
- Next.js Dependencies
- Next.js Type Declarations
- Package Metadata
- Project Concepts
- Agent Contract
- App Layout
- Next.js Config
- Env Declarations
- PostCSS Config
- Tailwind Config

## God Nodes (most connected - your core abstractions)
1. `readProject()` - 17 edges
2. `compilerOptions` - 17 edges
3. `include` - 6 edges
4. `Home()` - 5 edges
5. `readGit()` - 5 edges
6. `ParticleCore()` - 5 edges
7. `StageNode` - 5 edges
8. `tone()` - 5 edges
9. `readGraphify()` - 4 edges
10. `exists()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `ControlP` --semantically_similar_to--> `ControlP Local-First OS`  [INFERRED] [semantically similar]
  PROJECT_CONTEXT.md → README.md
- `ProjectNode()` --calls--> `tone()`  [EXTRACTED]
  app/components/vault-core/ProjectNodes.tsx → lib/ui.ts
- `Home()` --calls--> `formatDate()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/app/page.tsx → lib/ui.ts
- `Home()` --calls--> `tone()`  [EXTRACTED]
  /private/tmp/controlp-graph-src/app/page.tsx → lib/ui.ts
- `ControlP Agent Contract` --references--> `Sistema de Trazabilidad`  [EXTRACTED]
  AGENTS.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Vault Core Subsystem** — project_context_3d_particle_core, project_context_vault_signals, project_context_vault_dashboard [INFERRED 0.85]

## Communities (15 total, 5 thin omitted)

### Community 0 - "Vault Core 3D Engine"
Cohesion: 0.13
Nodes (20): VaultCore, createLinkSegments(), createParticleField(), createRandom(), ParticleField, GOLD, PALE, ParticleCore() (+12 more)

### Community 1 - "ControlP Data Layer"
Cohesion: 0.17
Nodes (23): buildAlerts(), clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet() (+15 more)

### Community 2 - "TypeScript Config"
Cohesion: 0.09
Nodes (22): ./*, dom, dom.iterable, esnext, compilerOptions, allowJs, baseUrl, esModuleInterop (+14 more)

### Community 3 - "CSS Build Tools"
Cohesion: 0.12
Nodes (17): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+9 more)

### Community 4 - "Dashboard UI Components"
Cohesion: 0.20
Nodes (9): CenterStage(), Fact(), Home(), PanelTitle(), Vitals(), getProjects(), formatDate(), tone() (+1 more)

### Community 5 - "Next.js Dependencies"
Cohesion: 0.13
Nodes (15): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+7 more)

### Community 6 - "Next.js Type Declarations"
Cohesion: 0.22
Nodes (8): .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules, **/*.ts, **/*.tsx, exclude, include

### Community 7 - "Package Metadata"
Cohesion: 0.25
Nodes (7): name, private, scripts, build, dev, lint, version

### Community 8 - "Project Concepts"
Cohesion: 0.33
Nodes (6): 3D Particle Core, ControlP, V.A.U.L.T Dashboard, vaultSignals, ControlP Local-First OS, Read-Only Design Philosophy

### Community 9 - "Agent Contract"
Cohesion: 0.50
Nodes (4): ControlP Agent Contract, Closing Barrier, Startup Protocol, Sistema de Trazabilidad

## Knowledge Gaps
- **62 isolated node(s):** `metadata`, `config`, `ProjectCard`, `projectsDir`, `VaultCore` (+57 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Dashboard UI Components` to `ControlP Data Layer`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `tone()` connect `Dashboard UI Components` to `Vault Core 3D Engine`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **What connects `metadata`, `config`, `ProjectCard` to the rest of the system?**
  _65 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Vault Core 3D Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.12962962962962962 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `CSS Build Tools` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Next.js Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._