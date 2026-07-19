import { createHash, randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

export type IntentSource = "deck" | "voice";
export type IntentStatus = "proposed" | "queued" | "running" | "done" | "failed" | "cancelled";
export type IntentRisk = "low" | "medium" | "high";

export interface IntentActor {
  id: "owner";
  kind: "local-user";
}

export interface Intent {
  id: string;
  command: string;
  action: string;
  at: string;
  updatedAt: string;
  expiresAt: string;
  status: IntentStatus;
  source: IntentSource;
  actor: IntentActor;
  preview: string;
  previewHash: string;
  risk: IntentRisk;
  idempotencyKey?: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

interface IntentDefinition {
  action: string;
  preview: string;
  risk: IntentRisk;
}

const INTENT_CATALOG: Readonly<Record<string, IntentDefinition>> = {
  "AM Report": {
    action: "report.morning.prepare",
    preview: "Preparar un borrador del reporte matutino. No enviar ni escribir fuera de ControlP.",
    risk: "low",
  },
  "GH Trending": {
    action: "github.trending.inspect",
    preview: "Consultar tendencias públicas de GitHub. No modificar repositorios.",
    risk: "low",
  },
  "Vault Clean": {
    action: "vault.clean.propose",
    preview: "Analizar candidatos de limpieza en la bóveda. No borrar ni modificar archivos.",
    risk: "high",
  },
  "WK Review": {
    action: "review.weekly.prepare",
    preview: "Preparar un borrador de revisión semanal. No publicar ni modificar fuentes.",
    risk: "low",
  },
};

const QUEUE_FILE = path.join(process.cwd(), "runtime", "intents.jsonl");
const LOCK_DIR = path.join(process.cwd(), "runtime", ".intents.lock");
const PROPOSAL_TTL_MS = 10 * 60 * 1000;

export interface QueueReading {
  items: Intent[];
  corrupted: number;
}

function digestPreview(intent: Pick<Intent, "action" | "actor" | "command" | "expiresAt" | "preview" | "risk" | "source">) {
  return createHash("sha256").update(JSON.stringify(intent)).digest("hex");
}

function isIntent(value: unknown): value is Intent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Intent>;
  return Boolean(
    typeof item.id === "string" &&
      typeof item.command === "string" &&
      typeof item.action === "string" &&
      typeof item.at === "string" &&
      typeof item.updatedAt === "string" &&
      typeof item.expiresAt === "string" &&
      typeof item.preview === "string" &&
      typeof item.previewHash === "string" &&
      (item.source === "deck" || item.source === "voice") &&
      ["proposed", "queued", "running", "done", "failed", "cancelled"].includes(item.status ?? "") &&
      item.actor?.kind === "local-user" &&
      item.actor.id === "owner",
  );
}

async function readUnlocked(): Promise<QueueReading> {
  let raw: string;
  try {
    raw = await fs.readFile(QUEUE_FILE, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return { corrupted: 0, items: [] };
    throw error;
  }

  const latest = new Map<string, Intent>();
  let corrupted = 0;
  for (const line of raw.split("\n")) {
    if (!line.trim()) continue;
    try {
      const parsed: unknown = JSON.parse(line);
      if (!isIntent(parsed)) {
        corrupted += 1;
        continue;
      }
      latest.set(parsed.id, parsed);
    } catch {
      corrupted += 1;
    }
  }
  return { corrupted, items: [...latest.values()].sort((a, b) => a.at.localeCompare(b.at)) };
}

async function withQueueLock<T>(operation: () => Promise<T>): Promise<T> {
  await fs.mkdir(path.dirname(QUEUE_FILE), { recursive: true });
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      await fs.mkdir(LOCK_DIR);
      try {
        return await operation();
      } finally {
        await fs.rm(LOCK_DIR, { recursive: true, force: true });
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }
  throw new Error("intent queue lock timeout");
}

async function appendSnapshot(intent: Intent) {
  await fs.appendFile(QUEUE_FILE, `${JSON.stringify(intent)}\n`, "utf8");
}

export function listIntentCommands(): string[] {
  return Object.keys(INTENT_CATALOG);
}

export async function readIntentQueue(): Promise<QueueReading> {
  return readUnlocked();
}

export async function proposeIntent(
  command: string,
  source: IntentSource,
  idempotencyKey?: string,
): Promise<Intent> {
  const definition = INTENT_CATALOG[command] ?? (source === "voice"
    ? {
        action: "inbox.capture.propose",
        preview: `Proponer guardar en el inbox: “${command}”. No escribir hasta que exista un ejecutor autorizado.`,
        risk: "medium" as const,
      }
    : undefined);
  if (!definition) throw new Error("intent command not allowed");

  return withQueueLock(async () => {
    const current = await readUnlocked();
    if (idempotencyKey) {
      const existing = current.items.find(
        (item) => item.actor.id === "owner" && item.idempotencyKey === idempotencyKey,
      );
      if (existing) return existing;
    }

    const at = new Date().toISOString();
    const intent: Intent = {
      action: definition.action,
      actor: { id: "owner", kind: "local-user" },
      at,
      command,
      expiresAt: new Date(Date.now() + PROPOSAL_TTL_MS).toISOString(),
      id: randomUUID(),
      idempotencyKey,
      preview: definition.preview,
      previewHash: "",
      risk: definition.risk,
      source,
      status: "proposed",
      updatedAt: at,
    };
    intent.previewHash = digestPreview(intent);
    await appendSnapshot(intent);
    return intent;
  });
}

export async function confirmIntent(id: string, previewHash: string): Promise<Intent> {
  return withQueueLock(async () => {
    const { items } = await readUnlocked();
    const intent = items.find((item) => item.id === id);
    if (!intent) throw new Error("intent not found");
    if (intent.previewHash !== previewHash) throw new Error("preview mismatch");
    if (intent.status === "queued") return intent;
    if (intent.status !== "proposed") throw new Error("intent is not confirmable");
    if (Date.parse(intent.expiresAt) <= Date.now()) throw new Error("intent proposal expired");

    const now = new Date().toISOString();
    const confirmed = { ...intent, confirmedAt: now, status: "queued" as const, updatedAt: now };
    await appendSnapshot(confirmed);
    return confirmed;
  });
}

export async function cancelIntent(id: string, previewHash: string): Promise<Intent> {
  return withQueueLock(async () => {
    const { items } = await readUnlocked();
    const intent = items.find((item) => item.id === id);
    if (!intent) throw new Error("intent not found");
    if (intent.previewHash !== previewHash) throw new Error("preview mismatch");
    if (intent.status === "cancelled") return intent;
    if (intent.status !== "proposed") throw new Error("intent is not cancellable");

    const now = new Date().toISOString();
    const cancelled = { ...intent, cancelledAt: now, status: "cancelled" as const, updatedAt: now };
    await appendSnapshot(cancelled);
    return cancelled;
  });
}
