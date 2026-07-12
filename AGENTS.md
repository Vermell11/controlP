# ControlP Agent Contract

ControlP follows the canonical traceability contract:

`/Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/Brain/Cerebro/Plantillas/Contrato base - Sistema de Trazabilidad.md`

## Startup

1. Read this file and `PROJECT_CONTEXT.md`.
2. Read `Proyectos/ControlP/Sesiones/En curso.md` only when it exists.
3. Query Graphify before code: `graphify query "<task>" --budget 600`.
4. Open at most three extra sources unless evidence is missing.

## Rules

- Obsidian is human memory.
- Git is implementation evidence.
- Graphify is derived technical context.
- Notion is the transactional ledger and must use the central connector only.
- Never copy or expose secrets.
- Use Ponytail for code: reuse existing flow, prefer native/stdlib, and make the minimum correct change.
- ControlP owns its canonical data schema (`lib/schema.ts`). Registry tools are
  replaceable adapters behind role interfaces (`lib/adapters/`): Obsidian
  implements memory, Notion implements the ledger. Only Git is permanent
  infrastructure. Swapping a tool = writing one adapter, never touching the
  domain or the UI.
- Local-first with a web-ready boundary: all data access is server-side through
  adapters; the canonical schema is pure JSON (future API wire format); machine
  paths live only in `lib/config.ts` and `config/projects.json`, never in the
  schema or the UI.
- Core closed to modification, open to extension: the core is the main dashboard
  (`app/(core)/page.tsx`, `app/components/vault-core/`,
  `app/components/CenterStage.tsx`, `app/components/core/`, `vaultSignals`).
  Every new feature is a self-contained module — own route, own components, own
  API route — consuming shared adapters (`lib/`) and declared extension points:
  the panel registry (`app/components/panels/registry.ts`) and the intent queue
  (`/api/intents`). Do not modify the core except for bugfixes or a justified
  new extension point.

## Closing Barrier

Do not close, tag, publish, or register in Notion just because the task is done. Show the full close draft and ask for explicit confirmation before `close-project finalize`.
