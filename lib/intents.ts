import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Cola local de intents — punto de extensión oficial del core.
 * Productores: Command Deck (hoy), voz (Sprint 3/4). Consumidor futuro: runner.
 * Persistencia JSONL append-only con lectura tolerante por línea.
 * Nota: el endurecimiento (lock, auth, origin) es requisito del Sprint 3/4,
 * antes de que algo ejecute desde aquí.
 */
export type IntentSource = "deck" | "voice";
export type IntentStatus = "queued" | "running" | "done" | "failed";

export interface Intent {
  command: string;
  at: string;
  status: IntentStatus;
  source: IntentSource;
}

const QUEUE_FILE = path.join(process.cwd(), "runtime", "intents.jsonl");

export interface QueueReading {
  items: Intent[];
  corrupted: number;
}

/** Lectura tolerante: una línea corrupta se cuenta, no invalida la cola. */
export async function readIntentQueue(): Promise<QueueReading> {
  let raw: string;
  try {
    raw = await fs.readFile(QUEUE_FILE, "utf8");
  } catch {
    return { corrupted: 0, items: [] };
  }

  const items: Intent[] = [];
  let corrupted = 0;
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed = JSON.parse(line) as Intent;
      if (typeof parsed.command === "string" && typeof parsed.at === "string") {
        items.push(parsed);
      } else {
        corrupted += 1;
      }
    } catch {
      corrupted += 1;
    }
  }
  return { corrupted, items };
}

export async function appendIntent(command: string, source: IntentSource): Promise<Intent> {
  const intent: Intent = {
    at: new Date().toISOString(),
    command,
    source,
    status: "queued",
  };
  await fs.mkdir(path.dirname(QUEUE_FILE), { recursive: true });
  await fs.appendFile(QUEUE_FILE, `${JSON.stringify(intent)}\n`, "utf8");
  return intent;
}
