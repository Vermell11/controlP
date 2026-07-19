import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

async function withIntentModule(run) {
  const originalCwd = process.cwd();
  const temporary = await mkdtemp(path.join(os.tmpdir(), "controlp-intents-"));
  try {
    process.chdir(temporary);
    process.env.CONTROLP_VAULT_ROOT = path.join(temporary, "vault");
    const moduleUrl = pathToFileURL(path.join(originalCwd, "lib/intents.ts"));
    moduleUrl.searchParams.set("test", `${Date.now()}-${Math.random()}`);
    await run(await import(moduleUrl.href));
  } finally {
    delete process.env.CONTROLP_VAULT_ROOT;
    process.chdir(originalCwd);
    await rm(temporary, { force: true, recursive: true });
  }
}

test("an intent requires its exact preview before entering the queue", async () => {
  await withIntentModule(async ({ confirmIntent, proposeIntent, readIntentQueue }) => {
    const proposal = await proposeIntent("Plan Today", "deck").catch((error) => error);
    assert.equal(proposal.message, "intent command not allowed");

    const allowed = await proposeIntent("WK Review", "deck", "request-1");
    assert.equal(allowed.status, "proposed");
    assert.equal(allowed.actor.id, "owner");
    await assert.rejects(() => confirmIntent(allowed.id, "changed-preview"), /preview mismatch/);

    const confirmed = await confirmIntent(allowed.id, allowed.previewHash);
    assert.equal(confirmed.status, "queued");
    assert.ok(confirmed.confirmedAt);

    const reading = await readIntentQueue();
    assert.equal(reading.items.length, 1);
    assert.equal(reading.items[0].status, "queued");
  });
});

test("idempotency and locking prevent duplicate concurrent proposals", async () => {
  await withIntentModule(async ({ proposeIntent, readIntentQueue }) => {
    const proposals = await Promise.all(
      Array.from({ length: 8 }, () => proposeIntent("AM Report", "deck", "same-request")),
    );
    assert.equal(new Set(proposals.map((item) => item.id)).size, 1);
    assert.equal((await readIntentQueue()).items.length, 1);
  });
});

test("voice notes become proposals and corrupt lines remain isolated", async () => {
  await withIntentModule(async ({ cancelIntent, proposeIntent, readIntentQueue }) => {
    await mkdir("runtime", { recursive: true });
    await writeFile("runtime/intents.jsonl", "not-json\n", "utf8");
    const proposal = await proposeIntent("anota revisar el contrato", "voice");
    assert.equal(proposal.action, "inbox.capture.propose");
    assert.match(proposal.preview, /No escribir/);

    const cancelled = await cancelIntent(proposal.id, proposal.previewHash);
    assert.equal(cancelled.status, "cancelled");

    const reading = await readIntentQueue();
    assert.equal(reading.corrupted, 1);
    assert.equal(reading.items.length, 1);
  });
});

test("the runner claims once, completes, and rejects unregistered handlers", async () => {
  await withIntentModule(async ({ confirmIntent, proposeProjectFieldIntent, proposeIntent, readIntentQueue }) => {
    const runnerUrl = new URL("../lib/intent-runner.ts", import.meta.url);
    runnerUrl.searchParams.set("test", `${Date.now()}-${Math.random()}`);
    const { runIntent } = await import(runnerUrl.href);

    const unknown = await proposeIntent("AM Report", "deck");
    await confirmIntent(unknown.id, unknown.previewHash);
    const failed = await runIntent(unknown.id);
    assert.equal(failed.status, "failed");
    assert.match(failed.error, /handler no autorizado/);

    const proposal = await proposeProjectFieldIntent("missing-project", "estado", "valor válido");
    await confirmIntent(proposal.id, proposal.previewHash);
    const [first, second] = await Promise.all([runIntent(proposal.id), runIntent(proposal.id).catch((error) => error)]);
    assert.equal(first.status, "failed");
    assert.match(first.error, /proyecto desconocido/);
    assert.match(second.message, /no ejecutable/);
    assert.equal((await readIntentQueue()).items.filter((item) => item.id === proposal.id).length, 1);
  });
});

test("a confirmed project edit executes end-to-end once with an auditable marker", async () => {
  await withIntentModule(async ({ confirmIntent, proposeProjectFieldIntent }) => {
    await mkdir("config", { recursive: true });
    await mkdir("vault/Proyectos/Demo", { recursive: true });
    await writeFile("config/projects.json", JSON.stringify({ projects: [{ id: "demo", slug: "demo",
      displayName: "Demo", sources: { obsidianFolder: "Demo", repoPath: null } }] }));
    await writeFile("vault/Proyectos/Demo/Estado actual.md", "# Demo\n\n- Estado: anterior\n");
    const runnerUrl = new URL("../lib/intent-runner.ts", import.meta.url);
    runnerUrl.searchParams.set("e2e", `${Date.now()}-${Math.random()}`);
    const { runIntent } = await import(runnerUrl.href);
    const proposal = await proposeProjectFieldIntent("demo", "estado", "nuevo estado");
    await confirmIntent(proposal.id, proposal.previewHash);
    assert.equal((await runIntent(proposal.id)).status, "done");
    assert.equal((await runIntent(proposal.id)).status, "done");
    assert.match(await readFile("vault/Proyectos/Demo/Estado actual.md", "utf8"), /Estado: nuevo estado/);
    const log = await readFile("vault/Proyectos/Demo/Bitácora.md", "utf8");
    assert.equal(log.match(new RegExp(`intent:${proposal.id}`, "g"))?.length, 1);
  });
});
