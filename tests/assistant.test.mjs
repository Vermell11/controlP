import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const assistantUrl = pathToFileURL(path.join(root, "lib/assistant.ts"));
const { answerKnowledgeQuery, continueProjectQuery, deckViewCommand, extractWakeCommand, isGlobalProjectQuery, isHealthFormationCommand, isHomeNavigation, isSocialQuery, isStructuredKnowledgeQuery, isVoiceArchitectureQuery, suggestProjectAlias } = await import(assistantUrl.href);
const ragUrl = pathToFileURL(path.join(root, "lib/assistant-rag.ts"));
const { buildSemanticPrompt, buildSemanticRepairPrompt, requireSkillConfirmation, retrieveKnowledge, validateSemanticDraft } = await import(ragUrl.href);

const controlp = {
  currentChallenge: "Construir V1.5.1",
  name: "ControlP",
  nextStep: "Validar la voz",
  obsidianFolder: "ControlP",
  slug: "controlp",
  status: "activo",
};

const healthyNotion = {
  ...controlp,
  git: { dirty: true, latestTag: "V1", present: true },
  graphify: { present: true },
  health: 85,
  healthReasons: ["cambios sin commit: -15"],
  name: "Notion",
  openSession: false,
  resolved: true,
  validation: "Pruebas aprobadas",
};

test("structured query returns visible, spoken and evidenced skills", async () => {
  const answer = await answerKnowledgeQuery("dime qué skills tiene ControlP", [controlp], async () => [
    { name: "Graphify", type: "Skill", usage: "Contexto técnico" },
    { name: "Ponytail", type: "Skill", usage: "Cambio mínimo" },
  ]);

  assert.match(answer.displayText, /Graphify, Ponytail/);
  assert.match(answer.speechText, /2 grupos/);
  assert.equal(answer.evidence[0].label, "ControlP/Skills.md");
  assert.equal(answer.evidence[0].kind, "canonical");
  assert.equal(answer.navigation, undefined);
});

test("a follow-up can reuse the previous project without requesting navigation", () => {
  assert.equal(continueProjectQuery("dime las otras skills", "MA-IA"), "dime las otras skills sobre MA-IA");
});

test("wake phrases arm voice without reaching the command router", () => {
  assert.equal(extractWakeCommand("oye baúl"), "");
  assert.equal(extractWakeCommand("Oye Vault, dime el estado de ControlP"), "dime el estado de controlp");
  assert.equal(extractWakeCommand("oye vau abre Maya"), "abre maya");
  assert.equal(extractWakeCommand("estado de ControlP"), undefined);
});

test("social phrases and Command Deck views do not require RAG evidence", () => {
  assert.equal(isSocialQuery("¿Cómo estás hoy?"), true);
  assert.equal(deckViewCommand("Muéstrame las métricas de mis proyectos"), "metrics");
  assert.equal(deckViewCommand("puedes utilizar command deck y abrir el inbox"), "inbox");
});

test("ControlP voice architecture is precise and deterministic", async () => {
  assert.equal(isVoiceArchitectureQuery("qué proveedores de voz usa ControlP y cómo se conectan"), true);
  const answer = await answerKnowledgeQuery(
    "qué proveedores de voz usa ControlP y cómo se conectan",
    [{ ...controlp, slug: "controlp" }],
    async () => [],
  );
  assert.match(answer.displayText, /Web Speech/);
  assert.match(answer.displayText, /faster-whisper/);
  assert.match(answer.displayText, /routeCommand/);
});

test("other skills exclude project-wide defaults", async () => {
  const answer = await answerKnowledgeQuery("dime las otras skills de ControlP", [controlp], async () => [
    { name: "Graphify", type: "Predeterminada global", usage: "Contexto técnico" },
    { name: "Ponytail", type: "Predeterminada global", usage: "Cambio mínimo" },
  ]);
  assert.match(answer.displayText, /no tiene otras skills/i);
  assert.equal(answer.navigation, undefined);
});

test("global skills use the classification read from Obsidian", async () => {
  const answer = await answerKnowledgeQuery("dime solo las skills globales de ControlP", [controlp], async () => [
    { name: "Graphify", type: "Predeterminada global", usage: "Contexto técnico" },
    { name: "Obsidian CLI", type: "Skill", usage: "Memoria" },
  ]);
  assert.match(answer.displayText, /Skills globales: Graphify/);
  assert.doesNotMatch(answer.displayText, /Obsidian CLI/);
});

test("health questions explain the canonical score instead of changing formation", async () => {
  assert.equal(isHealthFormationCommand("por qué la salud de Notion está en 85%"), false);
  assert.equal(isHealthFormationCommand("abre el diagnóstico de salud"), true);
  const answer = await answerKnowledgeQuery("por qué la salud de Notion está en 85%", [healthyNotion], async () => []);
  assert.match(answer.displayText, /85%/);
  assert.match(answer.displayText, /cambios sin commit: -15/);
});

test("project counts are deterministic", async () => {
  assert.equal(isGlobalProjectQuery("dime cuántos proyectos tengo en total"), true);
  const answer = await answerKnowledgeQuery("dime cuántos proyectos tengo en total", [controlp, healthyNotion], async () => []);
  assert.match(answer.displayText, /ControlP, Notion/);
  assert.match(answer.speechText, /2 proyectos/);
});

test("skill inventory stays deterministic while recommendations reach semantic routing", () => {
  assert.equal(isStructuredKnowledgeQuery("qué skills tiene ControlP"), true);
  assert.equal(isStructuredKnowledgeQuery("qué skills recomiendas para ControlP"), false);
});

test("RAG retrieves relevant canonical and derived evidence", () => {
  const chunks = [
    { content: "El siguiente paso es integrar Ollama", id: "memory:controlp", kind: "canonical", label: "ControlP" },
    { content: "God nodes: routeCommand", id: "graph:controlp", kind: "derived", label: "Graphify" },
    { content: "Proyecto distinto", id: "memory:juma", kind: "canonical", label: "JUMA" },
  ];
  const selected = retrieveKnowledge("¿Cómo se relacionan Ollama y routeCommand?", chunks);
  assert.deepEqual(selected.map(({ id }) => id), ["memory:controlp", "graph:controlp"]);
  assert.match(buildSemanticPrompt("pregunta", selected), /EXCLUSIVAMENTE/);
});

test("RAG excerpts the matching area instead of only the start of a long section", () => {
  const chunks = [{
    content: `${"configuración general ".repeat(100)}Web Speech y Whisper implementan la voz`,
    id: "graph:controlp:voice",
    kind: "derived",
    label: "ControlP · Graphify · Voz",
  }];
  assert.match(retrieveKnowledge("cómo funciona la voz", chunks)[0].content, /Web Speech y Whisper/);
});

test("RAG prioritizes an architectural section over an incidental content mention", () => {
  const chunks = [
    { content: "Motion Design se usa en estados de voz", id: "skills:controlp", kind: "canonical", label: "ControlP · Skills" },
    { content: "useSpeech usa Web Speech y useWhisper usa el sidecar STT", id: "graph:controlp:voice", kind: "derived", label: "ControlP · app/components/voice" },
    { content: "Estado activo", id: "memory:controlp", kind: "canonical", label: "ControlP · Estado" },
  ];
  assert.equal(retrieveKnowledge("cómo está construida la voz en ControlP", chunks)[0].id, "graph:controlp:voice");
});

test("RAG stays inside the explicitly named project", () => {
  const chunks = [
    { content: "ControlP avanza con voz", id: "memory:controlp", kind: "canonical", label: "ControlP · Estado" },
    { content: "routeCommand", id: "graph:controlp:0", kind: "derived", label: "ControlP · Graphify" },
    { content: "Notion tiene muchos nodos", id: "graph:notion:0", kind: "derived", label: "Notion · Graphify" },
  ];
  assert.deepEqual(
    retrieveKnowledge("háblame del avance de ControlP", chunks).map(({ id }) => id),
    ["memory:controlp", "graph:controlp:0"],
  );
});

test("semantic output rejects citations outside authorized context", () => {
  const chunks = [{ content: "Estado activo", id: "memory:controlp", kind: "canonical", label: "ControlP" }];
  assert.throws(
    () => validateSemanticDraft('{"answer":"Inventado","citations":["secret:file"]}', chunks),
    /cita fuera/,
  );
  assert.throws(
    () => validateSemanticDraft('{"answer":"ControlP está listo, pero no hay evidencia","citations":[]}', chunks),
    /sin evidencia/,
  );
  assert.deepEqual(
    validateSemanticDraft('{"answer":"ControlP está activo","citations":["memory:controlp"]}', chunks),
    { answer: "ControlP está activo", citations: ["memory:controlp"] },
  );
});

test("semantic repair keeps the authorized prompt and requests citations", () => {
  const repair = buildSemanticRepairPrompt("IDs permitidos: memory:controlp", '{"answer":"sin cita"}');
  assert.match(repair, /memory:controlp/);
  assert.match(repair, /cita al menos un ID permitido/);
});

test("skill recommendations always require confirmation", () => {
  assert.match(requireSkillConfirmation("¿Qué skill recomiendas?", "Recomiendo Graphify."), /sin confirmación/i);
  assert.equal(requireSkillConfirmation("¿Qué skills están instaladas?", "Graphify."), "Graphify.");
});

test("state query fails closed when project is unknown", async () => {
  const answer = await answerKnowledgeQuery("estado de un proyecto secreto", [controlp], async () => []);
  assert.match(answer.displayText, /No pude identificar/);
  assert.equal(answer.navigation, undefined);
});

test("a close transcription proposes maria as an alias for MA-IA", () => {
  const suggestion = suggestProjectAlias("abre el roadmap de María", [
    { name: "ControlP" },
    { name: "MA-IA" },
  ]);
  assert.equal(suggestion.alias, "maria");
  assert.equal(suggestion.project.name, "MA-IA");
});

test("natural conjugations can return to the main page", () => {
  assert.equal(isHomeNavigation("volvamos a la página principal"), true);
  assert.equal(isHomeNavigation("llévame de vuelta al inicio"), true);
  assert.equal(isHomeNavigation("regresemos a V.A.U.L.T."), true);
});

test("confirmed aliases persist as an append-only audit and apply before routing", async () => {
  const previous = process.cwd();
  const temporary = await mkdtemp(path.join(os.tmpdir(), "controlp-aliases-"));
  try {
    process.chdir(temporary);
    const aliasesUrl = pathToFileURL(path.join(root, "lib/voice-aliases.ts"));
    aliasesUrl.searchParams.set("test", String(Date.now()));
    const { appendVoiceAlias, applyVoiceAliases, readVoiceAliases } = await import(aliasesUrl.href);

    await appendVoiceAlias("maria", "MA-IA");
    const aliases = await readVoiceAliases();
    assert.equal(aliases.length, 1);
    assert.equal(applyVoiceAliases("abre maria", aliases), "abre MA-IA");
  } finally {
    process.chdir(previous);
    await rm(temporary, { force: true, recursive: true });
  }
});
