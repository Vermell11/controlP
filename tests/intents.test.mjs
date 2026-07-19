import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

async function withIntentModule(run) {
  const originalCwd = process.cwd();
  const temporary = await mkdtemp(path.join(os.tmpdir(), "controlp-intents-"));
  try {
    process.chdir(temporary);
    const moduleUrl = pathToFileURL(path.join(originalCwd, "lib/intents.ts"));
    moduleUrl.searchParams.set("test", `${Date.now()}-${Math.random()}`);
    await run(await import(moduleUrl.href));
  } finally {
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
    const proposal = await proposeIntent("anota revisar el contrato", "voice");
    assert.equal(proposal.action, "inbox.capture.propose");
    assert.match(proposal.preview, /No escribir/);

    const cancelled = await cancelIntent(proposal.id, proposal.previewHash);
    assert.equal(cancelled.status, "cancelled");

    await mkdir("runtime", { recursive: true });
    await writeFile("runtime/intents.jsonl", "not-json\n", { encoding: "utf8", flag: "a" });
    const reading = await readIntentQueue();
    assert.equal(reading.corrupted, 1);
    assert.equal(reading.items.length, 1);
  });
});
