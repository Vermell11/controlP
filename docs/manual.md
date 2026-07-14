# ControlP — manual esquemático

> Breve a propósito (V1.4.3): se reformulará en sprints futuros. La doctrina
> operativa vive en Obsidian (`Proyectos/ControlP/Arquitectura/`) y en
> `AGENTS.md`/`PROJECT_CONTEXT.md`.

## Arquitectura actual

- Next.js 16 + React 19 + Three.js/R3F. Local-first; todo acceso a datos es
  server-side vía adaptadores; el esquema canónico (`lib/schema.ts`,
  `SCHEMA_VERSION 2`) es JSON puro y será el formato de la API web.
- Core cerrado/abierto a extensión: dashboard (`app/(core)/page.tsx`,
  `vault-core/`, `CenterStage`) no se toca; las features entran por los
  puntos de extensión.

## Diagrama de conexiones

```
 voz (PTT) ─ useWhisper ──► /api/stt ──► sidecar stt/ (faster-whisper)
           └ useSpeech (Web Speech)
                 │ transcript
                 ▼
          routeCommand()  ◄─ reemplazable por LLM (Sprint 4, misma firma)
                 │ VoiceAction
     ┌───────────┼──────────────┐
 formation    navigate       enqueue
     │            │              │
 vaultSignals  /p/[slug]    /api/intents ──► runtime/intents.jsonl ──► /queue
 (escena 3D)

 UI (paneles) ◄─ registry (panels/registry.ts) ◄─ nuevos paneles se registran

 lib/controlp.ts (orquestador) ──► ProjectCard canónica ──► core + /api/projects
     │
     ├─ lib/adapters/memory-obsidian.ts   (rol memoria   → vault Cerebro)
     ├─ lib/adapters/evidence-git.ts      (rol evidencia → repos /code)
     └─ lib/adapters/graph-graphify.ts    (rol grafo     → graphify-out/)

 Ledger (Notion) ─ fuera del runtime: conector central `code/Notion`
 (cierres de sesión: prepare/finalize).
```

## Migración: sustituir Obsidian o Notion

Premisa (Arquitectura/Datos): ControlP es dueño del esquema; Obsidian y
Notion son adaptadores reemplazables. Solo Git es permanente. Graphify + la
data son las claves de continuidad.

La data a preservar:

| Dato | Hoy vive en | Forma |
| --- | --- | --- |
| Cápsulas (`PROJECT_CONTEXT.md`) | cada repo | markdown, viaja con Git |
| Memoria por proyecto (`Resumen`, `Estado actual`, `Bitácora`, sesiones) | vault Obsidian | markdown por carpeta de proyecto |
| Ledger (fila canónica, sesiones y actividades de cierre) | Notion | páginas vía conector `code/Notion` |
| Grafo técnico | `graphify-out/` por repo | derivado: se regenera, no se migra |
| Esquema canónico | `lib/schema.ts` (`SCHEMA_VERSION`) | contrato de todo lo anterior |

Procedimiento (igual para memoria o ledger):

1. Escribir el adaptador nuevo detrás del mismo rol
   (`lib/adapters/memory-*.ts` implementa memoria; el ledger se sustituye en
   el conector, no en este repo).
2. Migrar la data: leer con el adaptador viejo → volcar como JSON canónico
   (`SCHEMA_VERSION` vigente) → escribir con el nuevo. Los issues
   missing/broken del validador auditan qué quedó sin migrar.
3. Apuntar `config/projects.json` / `lib/config.ts` a las fuentes nuevas.
4. Regenerar Graphify (contexto derivado: no se migra).
5. Ni la UI ni el dominio (`lib/controlp.ts`, `lib/schema.ts`) se tocan; si
   un cambio los exige, la migración está mal planteada.

Notas por herramienta: sustituir Obsidian = reimplementar el parser de
cápsula/bitácora sobre el nuevo backend de notas (el formato markdown por
carpeta es la especificación). Sustituir Notion = reimplementar
`close-project prepare/finalize` (idempotencia y reconciliación incluidas)
contra el ledger nuevo; la doctrina está en `code/Notion/docs/session-close.md`.
