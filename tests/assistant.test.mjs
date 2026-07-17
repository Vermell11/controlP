import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const assistantUrl = pathToFileURL(path.join(root, "lib/assistant.ts"));
const { answerKnowledgeQuery, isHomeNavigation, suggestProjectAlias } = await import(assistantUrl.href);

const controlp = {
  currentChallenge: "Construir V1.5.1",
  name: "ControlP",
  nextStep: "Validar la voz",
  obsidianFolder: "ControlP",
  slug: "controlp",
  status: "activo",
};

test("structured query returns visible, spoken and evidenced skills", async () => {
  const answer = await answerKnowledgeQuery("dime qué skills tiene ControlP", [controlp], async () => [
    { name: "Graphify", type: "Skill", usage: "Contexto técnico" },
    { name: "Ponytail", type: "Skill", usage: "Cambio mínimo" },
  ]);

  assert.match(answer.displayText, /Graphify, Ponytail/);
  assert.match(answer.speechText, /2 grupos/);
  assert.equal(answer.evidence[0].label, "ControlP/Skills.md");
  assert.equal(answer.navigation.href, "/p/controlp");
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
