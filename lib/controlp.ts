import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const config = {
  vaultRoot:
    "/Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code/Brain/Cerebro",
  projectRoots: [
    "/Users/andresortegacorpus/Library/Mobile Documents/com~apple~CloudDocs/code",
  ],
};

export type ProjectCard = {
  name: string;
  obsidianPath: string;
  repoPath: string | null;
  status: string;
  purpose: string;
  stack: string;
  currentChallenge: string;
  validation: string;
  nextStep: string;
  latestSession: string;
  openSession: boolean;
  graphify: {
    present: boolean;
    nodes: number | null;
    edges: number | null;
    updated: string | null;
  };
  git: {
    present: boolean;
    branch: string | null;
    dirty: boolean;
    latestCommit: string | null;
    latestCommitDate: string | null;
    latestTag: string | null;
  };
  health: number;
  alerts: string[];
};

const projectsDir = path.join(config.vaultRoot, "Proyectos");

export async function getProjects(): Promise<ProjectCard[]> {
  const entries = await fs.readdir(projectsDir, { withFileTypes: true });
  const projectDirs = entries.filter((entry) => entry.isDirectory());
  const projects = await Promise.all(
    projectDirs.map((entry) => readProject(entry.name)),
  );

  return projects.sort((a, b) => b.health - a.health || a.name.localeCompare(b.name));
}

async function readProject(name: string): Promise<ProjectCard> {
  const obsidianPath = path.join(projectsDir, name);
  const [summary, state, sessions, repoPath] = await Promise.all([
    readIfExists(path.join(obsidianPath, "Resumen.md")),
    readIfExists(path.join(obsidianPath, "Estado actual.md")),
    listSessions(path.join(obsidianPath, "Sesiones")),
    resolveRepoPath(name),
  ]);
  const summaryText = normalizeMarkdown(summary);
  const stateText = normalizeMarkdown(state);

  const [git, graphify] = await Promise.all([
    repoPath ? readGit(repoPath) : emptyGit(),
    repoPath ? readGraphify(repoPath) : emptyGraphify(),
  ]);

  const openSession = sessions.some((file) =>
    path.basename(file).toLowerCase() === "en curso.md",
  );
  const latestSession = extractLatestSession(stateText) ?? sessions.at(-1) ?? "Sin sesiones";
  const status = extractBullet(stateText, "Estado") ?? (openSession ? "activo" : "sin estado");
  const purpose = section(summaryText, "Propósito") ?? firstParagraph(summaryText) ?? "Sin propósito documentado.";
  const stack = extractBullet(stateText, "Stack") ?? inferStack(stateText);
  const currentChallenge = extractBullet(stateText, "Reto") ?? "Sin reto activo documentado.";
  const validation = extractBullet(stateText, "Validación") ?? "Sin validación reciente.";
  const nextStep = section(stateText, "Siguiente paso") ?? "Sin siguiente paso documentado.";
  const alerts = buildAlerts({ repoPath, git, graphify, openSession, validation });
  const health = scoreHealth({ repoPath, git, graphify, openSession, validation, nextStep });

  return {
    name,
    obsidianPath,
    repoPath,
    status,
    purpose: clean(purpose),
    stack: clean(stack),
    currentChallenge: clean(currentChallenge),
    validation: clean(validation),
    nextStep: clean(nextStep),
    latestSession: clean(latestSession),
    openSession,
    graphify,
    git,
    health,
    alerts,
  };
}

async function resolveRepoPath(name: string): Promise<string | null> {
  for (const root of config.projectRoots) {
    const direct = path.join(root, name);
    if (await exists(direct)) return direct;
  }
  return null;
}

async function readGit(repoPath: string): Promise<ProjectCard["git"]> {
  if (!(await exists(path.join(repoPath, ".git")))) return emptyGit();

  const [branch, status, commit, date, tag] = await Promise.all([
    git(repoPath, ["rev-parse", "--abbrev-ref", "HEAD"]),
    git(repoPath, ["status", "--porcelain"]),
    git(repoPath, ["log", "-1", "--pretty=%h %s"]),
    git(repoPath, ["log", "-1", "--pretty=%cI"]),
    git(repoPath, ["describe", "--tags", "--abbrev=0"]),
  ]);

  return {
    present: true,
    branch,
    dirty: Boolean(status),
    latestCommit: commit,
    latestCommitDate: date,
    latestTag: tag,
  };
}

async function readGraphify(repoPath: string): Promise<ProjectCard["graphify"]> {
  const out = path.join(repoPath, "graphify-out");
  const graphPath = path.join(out, "graph.json");
  if (!(await exists(graphPath))) return emptyGraphify();

  try {
    const [raw, stat] = await Promise.all([fs.readFile(graphPath, "utf8"), fs.stat(graphPath)]);
    const graph = JSON.parse(raw) as { nodes?: unknown[]; edges?: unknown[] };
    const edges = graph.edges ?? (graph as { links?: unknown[] }).links;
    return {
      present: true,
      nodes: graph.nodes?.length ?? null,
      edges: edges?.length ?? null,
      updated: stat.mtime.toISOString(),
    };
  } catch {
    return { present: true, nodes: null, edges: null, updated: null };
  }
}

async function git(cwd: string, args: string[]): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("git", args, { cwd });
    return stdout.trim() || null;
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

async function readIfExists(file: string): Promise<string> {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return "";
  }
}

async function exists(file: string): Promise<boolean> {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function emptyGit(): ProjectCard["git"] {
  return {
    present: false,
    branch: null,
    dirty: false,
    latestCommit: null,
    latestCommitDate: null,
    latestTag: null,
  };
}

function emptyGraphify(): ProjectCard["graphify"] {
  return { present: false, nodes: null, edges: null, updated: null };
}

function extractBullet(markdown: string, label: string): string | null {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^-\\s*${escaped}:\\s*(.+)$`, "im"));
  return match?.[1] ?? null;
}

function extractLatestSession(markdown: string): string | null {
  return extractBullet(markdown, "Última sesión") ?? extractBullet(markdown, "Sesion en curso");
}

function section(markdown: string, title: string): string | null {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markdown.match(new RegExp(`^##\\s+${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, "im"));
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

function inferStack(state: string): string {
  if (/Astro/i.test(state)) return "Astro";
  if (/Python/i.test(state)) return "Python";
  if (/Next|React/i.test(state)) return "Next/React";
  return "No especificado";
}

function buildAlerts(input: {
  repoPath: string | null;
  git: ProjectCard["git"];
  graphify: ProjectCard["graphify"];
  openSession: boolean;
  validation: string;
}): string[] {
  const alerts = [];
  if (!input.repoPath) alerts.push("Ruta local no resuelta");
  if (input.repoPath && !input.git.present) alerts.push("Sin Git local");
  if (input.git.dirty) alerts.push("Cambios sin commit");
  if (input.git.present && !input.git.latestTag) alerts.push("Sin tag/version detectada");
  if (!input.graphify.present) alerts.push("Graphify no detectado");
  if (/sin validación|no existe suite/i.test(input.validation)) alerts.push("Validación débil");
  if (input.openSession) alerts.push("Sesión abierta");
  return alerts;
}

function scoreHealth(input: {
  repoPath: string | null;
  git: ProjectCard["git"];
  graphify: ProjectCard["graphify"];
  openSession: boolean;
  validation: string;
  nextStep: string;
}): number {
  let score = 100;
  if (!input.repoPath) score -= 20;
  if (input.repoPath && !input.git.present) score -= 15;
  if (input.git.dirty) score -= 15;
  if (input.git.present && !input.git.latestTag) score -= 10;
  if (!input.graphify.present) score -= 15;
  if (/sin validación|no existe suite/i.test(input.validation)) score -= 10;
  if (/sin siguiente paso/i.test(input.nextStep)) score -= 10;
  if (input.openSession) score += 5;
  return Math.max(0, Math.min(100, score));
}

function clean(value: string): string {
  return value
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, target: string, alias: string) => alias || target)
    .replace(/^>\s*/gm, "")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
