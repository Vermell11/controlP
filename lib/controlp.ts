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
  const health = scoreHealth({
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
    health,
    id: entry.id,
    issues,
    latestSession: memory.latestSession ?? "Sin sesiones",
    name: entry.displayName,
    nextStep,
    obsidianFolder: entry.sources.obsidianFolder,
    openSession: memory.openSession,
    purpose: memory.purpose ?? "Sin propósito documentado.",
    resolved,
    slug: entry.slug,
    stack: memory.stack ?? "No especificado",
    status: memory.status ?? (memory.openSession ? "activo" : "sin estado"),
    validation,
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

function scoreHealth(input: {
  resolved: boolean;
  git: ProjectEvidence;
  graphify: ProjectGraph;
  openSession: boolean;
  validation: string;
  nextStep: string;
}): number {
  let score = 100;
  if (!input.resolved) score -= 20;
  if (input.resolved && !input.git.present) score -= 15;
  if (input.git.dirty) score -= 15;
  if (input.git.present && !input.git.latestTag) score -= 10;
  if (!input.graphify.present) score -= 15;
  if (/sin validación|no existe suite/i.test(input.validation)) score -= 10;
  if (/sin siguiente paso/i.test(input.nextStep)) score -= 10;
  if (input.openSession) score += 5;
  return Math.max(0, Math.min(100, score));
}
