import { appendLogEntryOnce, updateNextStep, updateStateBullet, type EditableBullet } from "./adapters/memory-obsidian.ts";
import { sqliteIntentStore } from "./adapters/intent-store-sqlite.ts";
import type { Intent } from "./intents.ts";
import { loadRegistry } from "./registry.ts";
import { setDayItem } from "./schedule.ts";

type Handler = (intent: Intent) => Promise<string>;

const project = async (slug: string) => {
  const { entries } = await loadRegistry();
  const entry = entries.find((candidate) => candidate.slug === slug);
  if (!entry) throw new Error("proyecto desconocido");
  return entry;
};

const handlers: Readonly<Record<string, Handler>> = {
  "schedule.item.set": async ({ id, input }) => {
    const slug = String(input?.slug ?? "");
    const done = input?.done === true;
    const entry = await project(slug);
    const action = done ? "avance del día confirmado" : "avance del día reabierto";
    const issue = await appendLogEntryOnce(entry.sources.obsidianFolder,
      `${new Date().toISOString()} — ${action} desde ControlP: ${String(input?.note ?? "")}`, id);
    if (issue) throw new Error(issue.detail ?? issue.field);
    await setDayItem(slug, done);
    return action;
  },
  "project.field.update": async ({ id, input }) => {
    const slug = String(input?.slug ?? "");
    const field = String(input?.field ?? "");
    const value = String(input?.value ?? "").replace(/\s+/g, " ").trim();
    if (!(["reto", "validacion", "estado", "siguiente"].includes(field)) || value.length < 3 || value.length > 600)
      throw new Error("campo o valor inválido");
    const entry = await project(slug);
    const issue = field === "siguiente"
      ? await updateNextStep(entry.sources.obsidianFolder, value)
      : await updateStateBullet(entry.sources.obsidianFolder,
        ({ reto: "Reto", validacion: "Validación", estado: "Estado" } as Record<string, EditableBullet>)[field], value);
    if (issue) throw new Error(issue.detail ?? issue.field);
    await appendLogEntryOnce(entry.sources.obsidianFolder,
      `${new Date().toISOString()} — campo "${field}" editado desde ControlP`, id);
    return `campo ${field} actualizado`;
  },
};

export const isRunnableIntent = (action: string) => action in handlers;

export async function runIntent(id: string): Promise<Intent> {
  const claimed = sqliteIntentStore.claim(id, 30_000);
  if (!claimed) {
    const existing = sqliteIntentStore.read().items.find((item) => item.id === id);
    if (existing?.status === "done") return existing;
    throw new Error("intent no ejecutable");
  }
  const handler = handlers[claimed.action];
  if (!handler) return sqliteIntentStore.finish(id, "failed", "handler no autorizado");
  try {
    return sqliteIntentStore.finish(id, "done", await handler(claimed));
  } catch (error) {
    return sqliteIntentStore.finish(id, "failed", (error as Error).message);
  }
}
