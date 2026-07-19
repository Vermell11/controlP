import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import type { Intent } from "../intents.ts";
import type { IntentStore, IntentStoreReading } from "../ports/intent-store.ts";

function files() {
  const runtime = path.join(process.cwd(), "runtime");
  return { db: path.join(runtime, "controlp.sqlite"), jsonl: path.join(runtime, "intents.jsonl"), runtime };
}

function open() {
  const location = files();
  mkdirSync(location.runtime, { recursive: true });
  const db = new DatabaseSync(location.db);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS intents (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      idempotency_key TEXT,
      updated_at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS intents_idempotency
      ON intents(actor_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
    CREATE TABLE IF NOT EXISTS intent_events (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      intent_id TEXT NOT NULL,
      status TEXT NOT NULL,
      at TEXT NOT NULL,
      payload TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS intent_meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `);
  migrateJsonl(db, location.jsonl);
  return db;
}

function valid(value: unknown): value is Intent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Intent>;
  return typeof item.id === "string" && typeof item.status === "string" &&
    typeof item.previewHash === "string" && item.actor?.id === "owner";
}

function write(db: DatabaseSync, intent: Intent) {
  const payload = JSON.stringify(intent);
  db.prepare(`INSERT INTO intents(id,status,actor_id,idempotency_key,updated_at,payload)
    VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET status=excluded.status,
    updated_at=excluded.updated_at,payload=excluded.payload`)
    .run(intent.id, intent.status, intent.actor.id, intent.idempotencyKey ?? null, intent.updatedAt, payload);
  db.prepare("INSERT INTO intent_events(intent_id,status,at,payload) VALUES(?,?,?,?)")
    .run(intent.id, intent.status, intent.updatedAt, payload);
}

function migrateJsonl(db: DatabaseSync, jsonl: string) {
  if (db.prepare("SELECT value FROM intent_meta WHERE key='jsonl_migrated'").get()) return;
  let corrupted = 0;
  const latest = new Map<string, Intent>();
  if (existsSync(jsonl)) {
    for (const line of readFileSync(jsonl, "utf8").split("\n")) {
      if (!line.trim()) continue;
      try {
        const item: unknown = JSON.parse(line);
        if (valid(item)) latest.set(item.id, item); else corrupted += 1;
      } catch { corrupted += 1; }
    }
  }
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const intent of latest.values()) write(db, intent);
    db.prepare("INSERT INTO intent_meta(key,value) VALUES('jsonl_corrupted',?)").run(String(corrupted));
    db.prepare("INSERT INTO intent_meta(key,value) VALUES('jsonl_migrated',?)").run(new Date().toISOString());
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function parse(row: unknown): Intent {
  return JSON.parse((row as { payload: string }).payload) as Intent;
}

export const sqliteIntentStore: IntentStore = {
  read(): IntentStoreReading {
    const db = open();
    try {
      const items = db.prepare("SELECT payload FROM intents ORDER BY json_extract(payload,'$.at')").all().map(parse);
      const meta = db.prepare("SELECT value FROM intent_meta WHERE key='jsonl_corrupted'").get() as { value?: string } | undefined;
      return { corrupted: Number(meta?.value ?? 0), items };
    } finally { db.close(); }
  },

  propose(intent) {
    const db = open();
    try {
      db.exec("BEGIN IMMEDIATE");
      if (intent.idempotencyKey) {
        const existing = db.prepare("SELECT payload FROM intents WHERE actor_id=? AND idempotency_key=?")
          .get(intent.actor.id, intent.idempotencyKey);
        if (existing) { db.exec("COMMIT"); return parse(existing); }
      }
      write(db, intent);
      db.exec("COMMIT");
      return intent;
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    finally { db.close(); }
  },

  decide(id, previewHash, decision) {
    const db = open();
    try {
      db.exec("BEGIN IMMEDIATE");
      const row = db.prepare("SELECT payload FROM intents WHERE id=?").get(id);
      if (!row) throw new Error("intent not found");
      const intent = parse(row);
      if (intent.previewHash !== previewHash) throw new Error("preview mismatch");
      const target = decision === "confirm" ? "queued" : "cancelled";
      if (intent.status === target) { db.exec("COMMIT"); return intent; }
      if (intent.status !== "proposed") throw new Error(`intent is not ${decision === "confirm" ? "confirmable" : "cancellable"}`);
      if (decision === "confirm" && Date.parse(intent.expiresAt) <= Date.now()) throw new Error("intent proposal expired");
      const now = new Date().toISOString();
      const next: Intent = { ...intent, status: target, updatedAt: now,
        ...(decision === "confirm" ? { confirmedAt: now } : { cancelledAt: now }) };
      write(db, next);
      db.exec("COMMIT");
      return next;
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    finally { db.close(); }
  },

  claim(id, leaseMs) {
    const db = open();
    try {
      db.exec("BEGIN IMMEDIATE");
      const row = db.prepare("SELECT payload FROM intents WHERE id=?").get(id);
      if (!row) throw new Error("intent not found");
      const intent = parse(row);
      const now = new Date();
      if (intent.status !== "queued" && !(intent.status === "running" &&
        intent.leaseUntil && Date.parse(intent.leaseUntil) <= now.getTime())) {
        db.exec("COMMIT");
        return null;
      }
      const next: Intent = { ...intent, leaseUntil: new Date(now.getTime() + leaseMs).toISOString(),
        status: "running", updatedAt: now.toISOString() };
      write(db, next);
      db.exec("COMMIT");
      return next;
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    finally { db.close(); }
  },

  finish(id, status, detail) {
    const db = open();
    try {
      db.exec("BEGIN IMMEDIATE");
      const row = db.prepare("SELECT payload FROM intents WHERE id=?").get(id);
      if (!row) throw new Error("intent not found");
      const intent = parse(row);
      if (intent.status === status) { db.exec("COMMIT"); return intent; }
      if (intent.status !== "running") throw new Error("intent is not running");
      const next: Intent = { ...intent, leaseUntil: undefined, status,
        updatedAt: new Date().toISOString(), ...(status === "done" ? { result: detail } : { error: detail }) };
      write(db, next);
      db.exec("COMMIT");
      return next;
    } catch (error) { db.exec("ROLLBACK"); throw error; }
    finally { db.close(); }
  },
};
