import { readEvidence } from "./adapters/evidence-git";
import { readGraph } from "./adapters/graph-graphify";
import { readMemory } from "./adapters/memory-obsidian";
import { loadRegistry, type RegistryEntry } from "./registry";
import {
  SCHEMA_VERSION,
  type DataIssue,
  type ProjectCard,
  type ProjectEvidence,
  type ProjectGraph,
} from "./schema";

export type { ProjectCard } from "./schema";

/**
 * Orquestador: registry → adaptadores de rol → instantánea canónica.
 * No parsea formatos de proveedores (eso es de los adaptadores) ni conoce
 * rutas de máquina (eso es de lib/config.ts y config/projects.json).
 */
export async function getProjects(): Promise<ProjectCard[]> {
  const { entries, issues: registryIssues } = await loadRegistry();
  const projects = await Promise.all(
    entries.map((entry) => buildCard(entry, registryIssues)),
  );

  return projects.sort((a, b) => b.health - a.health || a.name.localeCompare(b.name));
}

async function buildCard(entry: RegistryEntry, registryIssues: DataIssue[]): Promise<ProjectCard> {
  const repoPath = entry.sources.repoPath;
  const [memoryReading, evidenceReading, graphReading] = await Promise.all([
    readMemory(entry.sources.obsidianFolder),
    readEvidence(repoPath),
    readGraph(repoPath),
  ]);

  const { memory } = memoryReading;
  const issues = [...registryIssues, ...memoryReading.issues, ...evidenceReading.issues, ...graphReading.issues];
  const resolved = Boolean(repoPath);
  const validation = memory.validation ?? "Sin validación reciente.";
  const nextStep = memory.nextStep ?? "Sin siguiente paso documentado.";

  const alerts = buildAlerts({
    git: evidenceReading.git,
    graphify: graphReading.graphify,
    issues,
    openSession: memory.openSession,
    resolved,
    validation,
  });
  const health = calculateHealth({
    git: evidenceReading.git,
    graphify: graphReading.graphify,
    nextStep,
    openSession: memory.openSession,
    resolved,
    validation,
  });

  return {
    alerts,
    currentChallenge: memory.currentChallenge ?? "Sin reto activo documentado.",
    schemaVersion: SCHEMA_VERSION,
    git: evidenceReading.git,
    graphify: graphReading.graphify,
    health: health.score,
    healthReasons: health.reasons,
    id: entry.id,
    issues,
    latestSession: memory.latestSession ?? "Sin sesiones",
    name: entry.displayName,
    nextStep,
    obsidianFolder: entry.sources.obsidianFolder,
    openSession: memory.openSession,
    purpose: memory.purpose ?? "Sin propósito documentado.",
    resolved,
    sessionCount: memory.sessionCount,
    slug: entry.slug,
    stack: memory.stack ?? "No especificado",
    status: memory.status ?? (memory.openSession ? "activo" : "sin estado"),
    totalSessionMinutes: memory.totalSessionMinutes,
    validation,
  };
}

function calculateHealth(input: {
  resolved: boolean;
  git: ProjectEvidence;
  graphify: ProjectGraph;
  openSession: boolean;
  validation: string;
  nextStep: string;
}): { reasons: string[]; score: number } {
  const factors: Array<[boolean, number, string]> = [
    [!input.resolved, -20, "ruta local no resuelta"],
    [input.resolved && !input.git.present, -15, "Git local no detectado"],
    [input.git.dirty, -15, "cambios sin commit"],
    [input.git.present && !input.git.latestTag, -10, "sin tag o versión"],
    [!input.graphify.present, -15, "Graphify no detectado"],
    [/sin validación|no existe suite/i.test(input.validation), -10, "validación débil"],
    [/sin siguiente paso/i.test(input.nextStep), -10, "siguiente paso no documentado"],
    [input.openSession, 5, "sesión abierta"],
  ];
  const applied = factors.filter(([condition]) => condition);
  const score = applied.reduce((total, [, points]) => total + points, 100);
  return {
    reasons: applied.map(([, points, label]) => `${label}: ${points > 0 ? "+" : ""}${points}`),
    score: Math.max(0, Math.min(100, score)),
  };
}

function buildAlerts(input: {
  resolved: boolean;
  git: ProjectEvidence;
  graphify: ProjectGraph;
  openSession: boolean;
  validation: string;
  issues: DataIssue[];
}): string[] {
  const alerts: string[] = [];
  if (!input.resolved) alerts.push("Ruta local no resuelta");
  if (input.resolved && !input.git.present) alerts.push("Sin Git local");
  if (input.git.dirty) alerts.push("Cambios sin commit");
  if (input.git.present && !input.git.latestTag) alerts.push("Sin tag/version detectada");
  if (!input.graphify.present) alerts.push("Graphify no detectado");
  if (/sin validación|no existe suite/i.test(input.validation)) alerts.push("Validación débil");
  if (input.openSession) alerts.push("Sesión abierta");

  // Errores de lectura reales ("broken") se muestran, no se silencian.
  for (const issue of input.issues) {
    if (issue.level === "broken") alerts.push(`Fuente rota: ${issue.source}/${issue.field}`);
  }
  return alerts;
}
