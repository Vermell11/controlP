import { promises as fs } from "node:fs";
import path from "node:path";
import { adapterConfig } from "../config";
import { validateMemory, type DataIssue, type ProjectMemory } from "../schema";

/**
 * Adaptador del rol MEMORIA sobre Obsidian (reemplazable).
 * Lee la cápsula del proyecto (Resumen.md, Estado actual.md, Sesiones/) y la
 * traduce al esquema canónico con parsing tolerante: lo que no se encuentra
 * queda como null + issue "missing", nunca inventado.
 */
export interface MemoryReading {
  memory: ProjectMemory;
  latestSessionFile: string | null;
  issues: DataIssue[];
}

export async function readMemory(obsidianFolder: string): Promise<MemoryReading> {
  const base = path.join(adapterConfig.vaultRoot, "Proyectos", obsidianFolder);
  const issues: DataIssue[] = [];

  const [summary, state, sessions] = await Promise.all([
    readIfExists(path.join(base, "Resumen.md")),
    readIfExists(path.join(base, "Estado actual.md")),
    listSessions(path.join(base, "Sesiones")),
  ]);

  if (summary === null) issues.push({ field: "Resumen.md", level: "missing", source: "memory" });
  if (state === null) issues.push({ field: "Estado actual.md", level: "missing", source: "memory" });

  const summaryText = normalizeMarkdown(summary ?? "");
  const stateText = normalizeMarkdown(state ?? "");
  const openSession = sessions.some(
    (file) => path.basename(file).toLowerCase() === "en curso.md",
  );

  const memory: ProjectMemory = {
    currentChallenge: cleanOrNull(extractBullet(stateText, "Reto")),
    latestSession: cleanOrNull(
      extractBullet(stateText, "Última sesión") ??
        extractBullet(stateText, "Sesion en curso") ??
        sessions.at(-1) ??
        null,
    ),
    nextStep: cleanOrNull(section(stateText, "Siguiente paso")),
    openSession,
    purpose: cleanOrNull(section(summaryText, "Propósito") ?? firstParagraph(summaryText)),
    stack: cleanOrNull(extractBullet(stateText, "Stack") ?? inferStack(stateText)),
    status: cleanOrNull(extractBullet(stateText, "Estado")),
    validation: cleanOrNull(extractBullet(stateText, "Validación")),
  };

  issues.push(...validateMemory(memory));
  return { issues, latestSessionFile: sessions.at(-1) ?? null, memory };
}

async function readIfExists(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function listSessions(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir);
    return entries.filter((entry) => entry.endsWith(".md")).sort();
  } catch {
    return [];
  }
}

function extractBullet(markdown: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^-\\s*${escaped}:\\s*(.+)$`, "im"));
  return match?.[1] ?? null;
}

function section(markdown: string, title: string): string | null {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(
    new RegExp(`^##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "im"),
  );
  return match?.[1]?.trim() ?? null;
}

function firstParagraph(markdown: string): string | null {
  return (
    markdown
      .split(/\n\s*\n/)
      .map((block) => block.replace(/^#{1,6}\s+.+$/gm, "").trim())
      .find((block) => block && !block.startsWith("#")) ?? null
  );
}

function normalizeMarkdown(markdown: string): string {
  return markdown
    .replace(/\n\s{2,}(?![-#])/g, " ")
    .replace(/([^\n])\n(?!\n|[-#])/g, "$1 ");
}

function inferStack(state: string): string | null {
  if (/Astro/i.test(state)) return "Astro";
  if (/Python/i.test(state)) return "Python";
  if (/Next|React/i.test(state)) return "Next/React";
  return null;
}

function cleanOrNull(value: string | null): string | null {
  if (value === null) return null;
  const cleaned = value
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, target: string, alias: string) => alias || target)
    .replace(/^>\s*/gm, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
}
