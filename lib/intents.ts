import { createHash, randomUUID } from "node:crypto";
import { sqliteIntentStore } from "./adapters/intent-store-sqlite.ts";

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

const PROPOSAL_TTL_MS = 10 * 60 * 1000;

export interface QueueReading {
  items: Intent[];
  corrupted: number;
}

function digestPreview(intent: Pick<Intent, "action" | "actor" | "command" | "expiresAt" | "preview" | "risk" | "source">) {
  return createHash("sha256").update(JSON.stringify(intent)).digest("hex");
}

export function listIntentCommands(): string[] {
  return Object.keys(INTENT_CATALOG);
}

export async function readIntentQueue(): Promise<QueueReading> {
  return sqliteIntentStore.read();
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

  {
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
    return sqliteIntentStore.propose(intent);
  }
}

export async function confirmIntent(id: string, previewHash: string): Promise<Intent> {
  return sqliteIntentStore.decide(id, previewHash, "confirm");
}

export async function cancelIntent(id: string, previewHash: string): Promise<Intent> {
  return sqliteIntentStore.decide(id, previewHash, "cancel");
}
