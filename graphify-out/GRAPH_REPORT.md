# Graph Report - .  (2026-07-11)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 37 nodes · 59 edges · 7 communities (5 shown, 2 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]

## God Nodes (most connected - your core abstractions)
1. `readProject()` - 17 edges
2. `readGit()` - 5 edges
3. `readGraphify()` - 4 edges
4. `exists()` - 4 edges
5. `getProjects()` - 3 edges
6. `resolveRepoPath()` - 3 edges
7. `git()` - 3 edges
8. `emptyGit()` - 3 edges
9. `emptyGraphify()` - 3 edges
10. `extractBullet()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `GET()` --calls--> `getProjects()`  [INFERRED]
  /private/tmp/controlp-graph-src/app/api/projects/route.ts → /private/tmp/controlp-graph-src/lib/controlp.ts
- `Home()` --calls--> `getProjects()`  [INFERRED]
  /private/tmp/controlp-graph-src/app/page.tsx → /private/tmp/controlp-graph-src/lib/controlp.ts

## Import Cycles
- None detected.

## Communities (7 total, 2 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.20
Nodes (3): Home(), getProjects(), GET()

### Community 1 - "Community 1"
Cohesion: 0.29
Nodes (6): buildAlerts(), clean(), config, ProjectCard, projectsDir, section()

### Community 2 - "Community 2"
Cohesion: 0.29
Nodes (7): firstParagraph(), inferStack(), listSessions(), normalizeMarkdown(), readIfExists(), readProject(), scoreHealth()

### Community 3 - "Community 3"
Cohesion: 0.50
Nodes (4): emptyGit(), execFileAsync, git(), readGit()

### Community 4 - "Community 4"
Cohesion: 0.50
Nodes (4): emptyGraphify(), exists(), readGraphify(), resolveRepoPath()

## Knowledge Gaps
- **4 isolated node(s):** `metadata`, `config`, `ProjectCard`, `projectsDir`
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getProjects()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.365) - this node is a cross-community bridge._
- **Why does `readProject()` connect `Community 2` to `Community 1`, `Community 3`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `getProjects()` (e.g. with `Home()` and `GET()`) actually correct?**
  _`getProjects()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `metadata`, `config`, `ProjectCard` to the rest of the system?**
  _4 weakly-connected nodes found - possible documentation gaps or missing edges._