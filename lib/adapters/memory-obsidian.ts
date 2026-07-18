import { promises as fs } from "node:fs";
import path from "node:path";
import { adapterConfig } from "../config";
import { validateMemory, type DataIssue, type ProjectMemory } from "../schema";
import type { ProjectSkill } from "../assistant";

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
  const sessionStats = await readSessionStats(path.join(base, "Sesiones"), sessions);

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
    sessionCount: sessionStats.count,
    stack: cleanOrNull(extractBullet(stateText, "Stack") ?? inferStack(stateText)),
    status: cleanOrNull(extractBullet(stateText, "Estado")),
    totalSessionMinutes: sessionStats.minutes,
    validation: cleanOrNull(extractBullet(stateText, "Validación")),
  };

  issues.push(...validateMemory(memory));
  return { issues, latestSessionFile: sessions.at(-1) ?? null, memory };
}

/** Lectura estructurada y de solo lectura del contrato Skills.md del proyecto. */
export async function readProjectSkills(obsidianFolder: string): Promise<ProjectSkill[]> {
  const file = path.join(adapterConfig.vaultRoot, "Proyectos", obsidianFolder, "Skills.md");
  const markdown = await readIfExists(file);
  if (!markdown) return [];

  const rows = markdown
    .split("\n")
    .filter((line) => /^\|.+\|$/.test(line.trim()))
    .slice(2)
    .map((line) => line.split("|").slice(1, -1).map((cell) => cleanOrNull(cell) ?? ""))
    .filter((cells) => cells.length >= 3 && cells[0]);

  const tableSkills = rows.map(([name, type, usage]) => ({ name, type, usage }));
  let sectionName = "";
  const bulletSkills = markdown.split("\n").flatMap((line) => {
    const heading = line.match(/^##\s+(.+)$/);
    if (heading) sectionName = heading[1];
    const match = line.match(/^- \[\[([^\]]+)\]\]\s+—\s+(.+)$/);
    if (!match) return [];
    const type = /predeterminadas? globales?/i.test(sectionName) ? "Predeterminada global" : sectionName || "Skill";
    return [{ name: match[1], type, usage: match[2] }];
  });

  return [...bulletSkills, ...tableSkills];
}

/** Fuentes canónicas autorizadas para recomendaciones; nunca conceden instalación. */
export async function readSkillBankKnowledge(): Promise<Array<{ label: string; content: string }>> {
  const dir = path.join(adapterConfig.vaultRoot, "Herramientas", "Banco de Skills");
  const files = ["Índice.md", "Inventario de skills instaladas.md", "Catálogo evaluado.md"];
  const contents = await Promise.all(files.map((file) => readIfExists(path.join(dir, file))));
  return files.flatMap((file, index) =>
    contents[index] ? [{ content: contents[index]!, label: file.replace(/\.md$/, "") }] : [],
  );
}

/**
 * Escritura de traza: agrega una línea a la Bitácora del proyecto.
 * Primera escritura del rol memoria — append-only, nunca reescribe historia.
 */
export async function appendLogEntry(
  obsidianFolder: string,
  line: string,
): Promise<DataIssue | null> {
  // Una entrada = una línea: sin saltos ni whitespace raro que rompa el md.
  const sanitized = line.replace(/\s+/g, " ").trim();
  const file = path.join(
    adapterConfig.vaultRoot,
    "Proyectos",
    obsidianFolder,
    "Bitácora.md",
  );
  try {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, `# Bitácora de ${obsidianFolder}\n\n`, "utf8");
    }
    await fs.appendFile(file, `- ${sanitized}\n`, "utf8");
    return null;
  } catch (error) {
    return {
      detail: (error as Error).message.split("\n")[0],
      field: "Bitácora.md",
      level: "broken",
      source: "memory",
    };
  }
}

/** Campos editables de la cápsula (bullets de Estado actual.md). */
export type EditableBullet = "Reto" | "Validación" | "Estado";

/**
 * Actualiza un bullet de Estado actual.md preservando el resto del documento.
 * Reemplaza la línea del campo y sus continuaciones indentadas; si el campo
 * no existe, lo agrega al final del bloque inicial de bullets.
 */
export async function updateStateBullet(
  obsidianFolder: string,
  field: EditableBullet,
  value: string,
): Promise<DataIssue | null> {
  return editStateFile(obsidianFolder, (content) => {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const bullet = `- ${field}: ${value}`;
    const pattern = new RegExp(`^-\\s*${escaped}:.*(?:\\n(?![-#\\n]).*)*`, "m");
    if (pattern.test(content)) return content.replace(pattern, bullet);
    const sectionStart = content.search(/\n##\s/);
    if (sectionStart === -1) return `${content.trimEnd()}\n${bullet}\n`;
    return `${content.slice(0, sectionStart).trimEnd()}\n${bullet}\n${content.slice(sectionStart)}`;
  });
}

/** Reemplaza el contenido de la sección "## Siguiente paso". */
export async function updateNextStep(
  obsidianFolder: string,
  value: string,
): Promise<DataIssue | null> {
  return editStateFile(obsidianFolder, (content) => {
    const pattern = /^##\s+Siguiente paso\s*\n[\s\S]*?(?=\n##\s|$)/m;
    const section = `## Siguiente paso\n\n${value}\n`;
    if (pattern.test(content)) return content.replace(pattern, section);
    return `${content.trimEnd()}\n\n${section}`;
  });
}

async function editStateFile(
  obsidianFolder: string,
  transform: (content: string) => string,
): Promise<DataIssue | null> {
  const file = path.join(
    adapterConfig.vaultRoot,
    "Proyectos",
    obsidianFolder,
    "Estado actual.md",
  );
  try {
    const content = await fs.readFile(file, "utf8");
    await fs.writeFile(file, transform(content), "utf8");
    return null;
  } catch (error) {
    return {
      detail: (error as Error).message.split("\n")[0],
      field: "Estado actual.md",
      level: "broken",
      source: "memory",
    };
  }
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

async function readSessionStats(dir: string, sessions: string[]): Promise<{ count: number; minutes: number }> {
  const closed = sessions.filter((entry) => entry.toLowerCase() !== "en curso.md");
  const contents = await Promise.all(
    closed.map((entry) => readIfExists(path.join(dir, entry))),
  );
  return {
    count: closed.length,
    minutes: contents.reduce((total, content) => total + extractMinutes(content ?? ""), 0),
  };
}

function extractMinutes(markdown: string): number {
  const match = markdown.match(/Duración activa:\s*`?(\d+)\s*(minutos?|h|horas?)`?/i);
  if (!match) return 0;
  const value = Number(match[1]);
  return /h|hora/i.test(match[2] ?? "") ? value * 60 : value;
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
