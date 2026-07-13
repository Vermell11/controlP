# Graph Report - /Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/ControlP  (2026-07-13)

## Corpus Check
- Corpus is ~16,489 words - fits in a single context window. You may not need a graph.

## Summary
- 337 nodes · 578 edges · 22 communities (15 shown, 7 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b4d6cbf7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Panel Modules & Command Deck
- Voice & Vault Core Visual Layer
- TypeScript Config
- Memory Adapter & Editable Records
- Package & Dependencies
- Project Registry & Schedule API
- ControlP Orchestrator
- Metrics API & Project Records
- Core Dashboard Page
- Dev Dependencies
- Intents API & Queue
- Vault Core Project Nodes
- Voice System & Signals
- App Layout
- Architecture Concepts
- ESLint Config
- Next.js Config
- Env Declarations
- PostCSS Config
- README Concepts
- Tailwind Config
- Trazabilidad Contract

## God Nodes (most connected - your core abstractions)
1. `lib_adapters_memory_obsidian` - 26 edges
2. `private_tmp_controlp_graph_src_lib_controlp_ts` - 24 edges
3. `lib_controlp` - 23 edges
4. `app_components_panels_deckviews` - 19 edges
5. `tsconfig_compileroptions` - 17 edges
6. `lib_controlp_readproject` - 17 edges
7. `lib_registry` - 16 edges
8. `app_components_vault_core_projectnodes` - 16 edges
9. `app_components_panels_commanddeckpanel` - 15 edges
10. `lib_schema` - 14 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (22 total, 7 thin omitted)

### Community 0 - "Panel Modules & Command Deck"
Cohesion: 0.09
Nodes (28): QUEUE_COMMANDS, VIEW_COMMANDS, VIEW_TITLE, daysSince(), DeckView, FeedView(), formatHours(), InboxView() (+20 more)

### Community 1 - "Voice & Vault Core Visual Layer"
Cohesion: 0.08
Nodes (31): createLinkSegments(), createParticleField(), createRandom(), ParticleField, GOLD, PALE, ParticleCore(), useVaultSignals() (+23 more)

### Community 2 - "TypeScript Config"
Cohesion: 0.06
Nodes (30): ./*, dom, dom.iterable, esnext, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+22 more)

### Community 3 - "Memory Adapter & Editable Records"
Cohesion: 0.15
Nodes (24): EditableText(), BULLET_BY_FIELD, EditableField, updateProjectField(), UpdateResult, VALID_FIELDS, cleanOrNull(), EditableBullet (+16 more)

### Community 4 - "Package & Dependencies"
Cohesion: 0.08
Nodes (24): next, dependencies, next, react, react-dom, @react-three/drei, @react-three/fiber, three (+16 more)

### Community 5 - "Project Registry & Schedule API"
Cohesion: 0.16
Nodes (19): GET(), GET(), POST(), readCommitActivity(), appendLogEntry(), adapterConfig, dedupe(), discoverFromVault() (+11 more)

### Community 6 - "ControlP Orchestrator"
Cohesion: 0.18
Nodes (22): clean(), config, emptyGit(), emptyGraphify(), execFileAsync, exists(), extractBullet(), extractLatestSession() (+14 more)

### Community 7 - "Metrics API & Project Records"
Cohesion: 0.19
Nodes (18): emptyEvidence(), EvidenceReading, execFileAsync, exists(), git(), readEvidence(), emptyGraph(), GraphReading (+10 more)

### Community 8 - "Core Dashboard Page"
Cohesion: 0.11
Nodes (10): GET(), CenterStage(), VaultCore, Clock(), leftPanels, rightPanels, Home(), Home() (+2 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.10
Nodes (21): autoprefixer, eslint, eslint-config-next, devDependencies, autoprefixer, eslint, eslint-config-next, postcss (+13 more)

### Community 10 - "Intents API & Queue"
Cohesion: 0.22
Nodes (11): GET(), POST(), QueuePage(), STATUS_LABEL, appendIntent(), Intent, IntentSource, IntentStatus (+3 more)

### Community 11 - "Vault Core Project Nodes"
Cohesion: 0.33
Nodes (9): goTo(), gridPosition(), healthPosition(), orbitPosition(), ProjectNode(), ProjectNodes(), projectPath(), TONE_COLORS (+1 more)

### Community 12 - "Voice System & Signals"
Cohesion: 0.25
Nodes (8): Audio I/O Panel, Orb Voice Glow, SCHEMA_VERSION 2, Spherical Equalizer, Voice Command Router, Voice Intent, useMicLevel hook, vaultSignals

### Community 13 - "App Layout"
Cohesion: 0.50
Nodes (3): metadata, RootLayout(), viewport

### Community 14 - "Architecture Concepts"
Cohesion: 0.67
Nodes (3): Canonical Data Schema Ownership, Local-First Web-Ready Boundary, Role Adapter Pattern

## Knowledge Gaps
- **96 isolated node(s):** `config`, `ProjectCard`, `projectsDir`, `ControlP Local-First OS`, `Sistema de Trazabilidad` (+91 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.