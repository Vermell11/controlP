import { promises as fs } from "node:fs";
import path from "node:path";
export interface VoiceAlias {
  alias: string;
  createdAt: string;
  target: string;
}

const ALIASES_FILE = path.join(process.cwd(), "runtime", "voice-aliases.jsonl");

export async function readVoiceAliases(): Promise<VoiceAlias[]> {
  try {
    const content = await fs.readFile(ALIASES_FILE, "utf8");
    const latest = new Map<string, VoiceAlias>();
    for (const line of content.split("\n").filter(Boolean)) {
      try {
        const item = JSON.parse(line) as VoiceAlias;
        if (isAlias(item)) latest.set(compactVoiceText(item.alias), item);
      } catch {
        // Registro append-only: una línea corrupta no oculta las demás.
      }
    }
    return [...latest.values()];
  } catch {
    return [];
  }
}

export async function appendVoiceAlias(alias: string, target: string): Promise<VoiceAlias> {
  const item = { alias: normalizeVoiceText(alias), createdAt: new Date().toISOString(), target };
  await fs.mkdir(path.dirname(ALIASES_FILE), { recursive: true });
  await fs.appendFile(ALIASES_FILE, `${JSON.stringify(item)}\n`, "utf8");
  return item;
}

export function applyVoiceAliases(text: string, aliases: VoiceAlias[]): string {
  let normalized = normalizeVoiceText(text);
  for (const item of aliases) {
    const escaped = normalizeVoiceText(item.alias).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    normalized = normalized.replace(new RegExp(`\\b${escaped}\\b`, "g"), item.target);
  }
  return normalized;
}

function isAlias(value: VoiceAlias): boolean {
  return Boolean(value && typeof value.alias === "string" && typeof value.target === "string");
}

function normalizeVoiceText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function compactVoiceText(text: string): string {
  return normalizeVoiceText(text).replace(/[^a-z0-9]+/g, "");
}
