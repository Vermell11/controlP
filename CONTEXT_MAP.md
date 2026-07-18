# CONTEXT_MAP — mapa del repo para sesiones de IA

Objetivo: implementar un cambio leyendo solo `PROJECT_CONTEXT.md` + este mapa
+ los archivos objetivo, sin explorar el repo. Se actualiza en cada cierre de
sesión si cambió la estructura (paso 7 de la doctrina de cierre). Insumo:
Graphify (`graphify-out/GRAPH_REPORT.md`).

Regla madre (AGENTS.md): core cerrado a modificación, abierto a extensión.
Core = `app/(core)/page.tsx`, `app/components/vault-core/`,
`app/components/CenterStage.tsx`, `app/components/core/`, `vaultSignals`.
Calidad: `npm run check` limpio siempre. `next build` se prueba en copia
limpia fuera de iCloud (cuelga en la carpeta sincronizada).

## Módulos

### lib/ — dominio y adaptadores (server-side)

Propósito: esquema canónico y orquestación de fuentes. Nunca importa React.

- `lib/schema.ts` — tipos canónicos (`ProjectCard`, `ProjectMemory`,
  `ProjectEvidence`, `ProjectGraph`, `DataIssue`), `SCHEMA_VERSION`,
  validador missing/broken.
- `lib/controlp.ts` — orquestador `getProjects()`: registry → adaptadores →
  `ProjectCard` con salud (`scoreHealth`) y alertas (`buildAlerts`).
- `lib/registry.ts` — identidad estable (`config/projects.json`): id, slug,
  displayName, sources; fallback a descubrimiento con issue.
- `lib/adapters/memory-obsidian.ts` (rol memoria: cápsulas, bitácora,
  sesiones), `evidence-git.ts` (rol evidencia), `graph-graphify.ts` (rol
  grafo). Reemplazar herramienta = escribir un adaptador, jamás tocar dominio/UI.
- `lib/config.ts` — ÚNICO lugar con rutas absolutas de máquina (+
  `config/projects.json`). Prohibido meterlas en esquema o UI.
- `lib/intents.ts` — cola JSONL append-only (`runtime/intents.jsonl`),
  lectura tolerante por línea. Punto de extensión oficial.
- `lib/assistant.ts` — contrato de respuesta visible/hablada/evidenciada,
  consultas estructuradas, contexto conversacional corto y resolución de nombres.
- `lib/assistant-knowledge.ts` — clasifica y recorta evidencia read-only autorizada.
- `lib/assistant-rag.ts` — construye el contexto RAG canónico/derivado y sus citas.
- `lib/assistant-semantic.ts` — contrato JSON del router semántico, reparación única
  y cierre seguro si el modelo no entrega una respuesta válida.
- `lib/adapters/llm-ollama.ts` — adaptador reemplazable de Ollama; el modelo recibe
  contexto ya acotado y nunca acceso directo al filesystem o credenciales.
- `lib/voice-aliases.ts` — registro JSONL append-only de alias confirmados;
  almacenamiento server-side, nunca accesible directamente desde el cliente.
- `lib/schedule.ts` — plan del día (`runtime/schedule-YYYY-MM-DD.json`).
- `lib/ui.ts` — helpers compartidos de presentación (tone, formatDate,
  obsidianUrl).

Invariantes: dato no encontrado = `null` + issue (nunca inventar); el esquema
es JSON puro (futuro formato de API web); acceso a datos solo server-side.

### app/api/ — frontera HTTP

- `projects/route.ts` — GET instantánea canónica (frontera web-ready; sin
  consumidor interno, es contrato).
- `intents/route.ts` — GET cola / POST encolar `{command, source}`.
- `schedule/route.ts` — GET plan / POST confirmar avance (escribe traza en
  Bitácora vía adaptador ANTES de responder ok; el cliente ya confirmó).
- `metrics/route.ts` — commits por día (14d) por proyecto, para Trend Scan.
- `stt/route.ts` — proxy POST audio → sidecar (`STT_URL`, default
  `127.0.0.1:8787/transcribe`). El navegador solo habla con ControlP.
- `assistant/query/route.ts` — POST de consultas read-only: reglas estructuradas
  primero y router semántico/RAG como fallback acotado.
- `assistant/aliases/route.ts` — GET de vocabulario y POST de alias con
  confirmación explícita y destino validado contra el registry.

Para un endpoint nuevo: carpeta propia en `app/api/`, lógica en `lib/`.

### app/components/vault-core/ — escena 3D (CORE, no tocar salvo bugfix)

- `types.ts` — `VaultSignals`, `CoreState`, `NodeFormation` (unión de
  formaciones), `STATE_PRESETS`, `SPECTRUM_BANDS`, `StageNode`.
- `signals.tsx` — `vaultSignals` mutable leído por frame (sin re-render).
  Escribir aquí es la forma de animar la escena desde fuera.
- `ParticleCore.tsx` — esfera ecualizador (shader con fase acumulada
  `uPhase`: nunca calcular `tiempo × velocidad` en el shader), lerps de
  presets, rotación y liberación de recursos GPU al desmontar.
- `ProjectNodes.tsx` — orbes por proyecto; funciones de posición por
  formación (`orbitPosition`, `gridPosition`, `healthPosition`) + lerp al
  target; brillo por voz (`vaultSignals.level`).
- `VaultCore.tsx` — Canvas, `CameraDirector` (formación ≠ orbit: cámara a
  home + controles bloqueados), wheel→`healthScroll`.
- `geometry.ts` — funciones puras deterministas (nube y enlaces).

Nueva formación: unión en `types.ts` → función de posición + rama target en
`ProjectNodes.tsx` → regla de voz en `voice/commands.ts`. (Receta completa en
Obsidian: `Arquitectura/Routers y extensión`.)

### app/components/voice/ — captura y router de voz

- `VoicePanel.tsx` — panel Audio I/O: PTT (pointer + tecla V), wake phrase Web Speech,
  historial completo con scroll, contexto conversacional y selección de
  proveedor persistida (`controlp.stt.provider`), `execute()` despacha
  `VoiceAction` (muta `vaultSignals`, navega o encola) y publica estados
  accesibles `idle/listening/transcribing/processing/speaking/success/error`.
- `commands.ts` — `routeCommand(transcript, projects, aliases, context)` aplica alias,
  reglas deterministas, navegación/Command Deck y consultas; sólo lo desconocido usa
  `/api/assistant/query`. Puede devolver `VoiceAction | Promise<VoiceAction>`.
- `useWhisper.ts` (graba y transcribe al soltar vía `/api/stt`),
  `useSpeech.ts` (Web Speech, interim y escucha continua de palabra de activación), `useMicLevel.ts` (nivel +
  espectro 16 bandas → `vaultSignals`), `useTts.ts` (respuesta Web Speech),
  `VoiceVisualizer.tsx` (sintetizador canvas del botón PTT).

Accesibilidad de movimiento: `app/components/useReducedMotion.ts` refleja
`prefers-reduced-motion`; Canvas, cámara, nodos y sintetizador lo consumen.
Los tokens CSS de motion y el fallback global viven en `app/globals.css`.

Invariantes: reglas tolerantes a Whisper (normalizar, `compact()`, variantes
fonéticas); prefijos de dictado ganan sobre toda regla; proveedor STT nuevo =
hook con contrato `onFinal`/`start`/`stop` + rama en VoicePanel.

### app/components/panels/ — paneles del dashboard

- `registry.ts` — PUNTO DE EXTENSIÓN: `leftPanels`/`rightPanels`
  `{id, Component}`. Agregar panel = crear componente con `PanelProps`
  (`types.ts`: `{ projects: ProjectCard[] }`) y registrarlo. El core no se
  edita.
- `CommandDeckPanel.tsx` + `DeckViews.tsx` — deck con vistas (metrics,
  trend, inbox, plan, schedule, feed) y escucha el evento de navegación por voz;
  vista nueva = export en DeckViews +
  tipo `DeckView`.
- `SchedulePanel.tsx` / `WirePanel.tsx` — solo exportan `ScheduleBody` /
  `WireBody` (consumidos por DeckViews; no tienen wrapper propio).
- `VitalsPanel.tsx`, `DirectivesPanel.tsx`, `DocumentsPanel.tsx`,
  `panels.css`.

### app/ — rutas

- `(core)/page.tsx` — dashboard (CORE): itera el registry y monta
  CenterStage. No se toca para agregar features.
- `components/CenterStage.tsx`, `components/core/Clock.tsx` — core visual.
- `p/[slug]/` — ficha de proyecto (page + `actions.ts` server actions con
  confirmación → adaptador memoria) + `components/records/`; reutiliza
  `VoicePanel` para mantener PTT y navegación de regreso.
- `queue/` — vista de la cola de intents.
- `layout.tsx`, `globals.css`, `core.css`.

### stt/ — sidecar Whisper (Python, fuera de Next)

- `server.py` (FastAPI + faster-whisper, es, VAD; modelo por
  `WHISPER_MODEL`), `run.sh` (arranque), `requirements.txt`.
- Se relocaliza con `STT_URL` sin tocar cliente. Proveedor STT server-side
  nuevo sigue este patrón: servicio propio + proxy en `app/api/`.

## Para modificar X toca solo Y

| Cambio | Archivos |
| --- | --- |
| Nuevo comando de voz | `voice/commands.ts` (+ `VoicePanel.tsx` solo si exige un tipo de `VoiceAction` nuevo) |
| Reemplazar modelo local | `lib/adapters/llm-ollama.ts` + configuración; no tocar dominio/UI |
| Cambiar recuperación semántica | `lib/assistant-knowledge.ts` + `lib/assistant-rag.ts` |
| Nuevo panel | `panels/MiPanel.tsx` + `panels/registry.ts` |
| Nueva vista del deck | `panels/DeckViews.tsx` (+ CSS) |
| Nueva formación 3D | `vault-core/types.ts` + `ProjectNodes.tsx` + regla en `voice/commands.ts` |
| Nuevo proveedor STT | hook en `voice/` + ramas en `VoicePanel.tsx` (+ `app/api/` si necesita servidor) |
| Cambiar herramienta de memoria/grafo | un adaptador en `lib/adapters/` (+ `config/projects.json`) |
| Heurística de salud/alertas | `lib/controlp.ts` (`scoreHealth`/`buildAlerts`) |
| Rutas de máquina | `lib/config.ts` / `config/projects.json` únicamente |
| Campo nuevo del esquema | `lib/schema.ts` + adaptador que lo llena + `SCHEMA_VERSION` si rompe |
| Endpoint nuevo | carpeta en `app/api/` + lógica en `lib/` |
