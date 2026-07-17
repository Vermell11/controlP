import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";

test("intent queue appends valid JSONL and tolerates a corrupt line", async () => {
  const originalCwd = process.cwd();
  const temporary = await mkdtemp(path.join(os.tmpdir(), "controlp-intents-"));
  try {
    process.chdir(temporary);
    const moduleUrl = pathToFileURL(path.join(originalCwd, "lib/intents.ts"));
    moduleUrl.searchParams.set("test", String(Date.now()));
    const { appendIntent, readIntentQueue } = await import(moduleUrl.href);

    await appendIntent("Plan Today", "deck");
    await mkdir("runtime", { recursive: true });
    await writeFile("runtime/intents.jsonl", "not-json\n", { encoding: "utf8", flag: "a" });

    const reading = await readIntentQueue();
    assert.equal(reading.corrupted, 1);
    assert.equal(reading.items.length, 1);
    assert.equal(reading.items[0].command, "Plan Today");
    assert.equal(reading.items[0].status, "queued");
  } finally {
    process.chdir(originalCwd);
    await rm(temporary, { force: true, recursive: true });
  }
});
