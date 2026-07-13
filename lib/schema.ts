/**
 * Esquema canónico de ControlP — el contrato de datos del sistema.
 *
 * Premisas (ver AGENTS.md):
 * - ControlP es dueño de este esquema; Obsidian/Notion son adaptadores
 *   reemplazables detrás de roles (memoria, ledger). Solo Git es permanente.
 * - Todo es JSON serializable: este esquema será el formato de la API cuando
 *   el frontend se despliegue en la web.
 * - Sin rutas absolutas de máquina: eso pertenece a lib/config.ts.
 */

/** Versión del contrato de datos. Sube cuando cambie la forma del esquema. */
export const SCHEMA_VERSION = 2;

export type IssueSource = "registry" | "memory" | "evidence" | "graph";

/** "missing" = dato ausente en la fuente; "broken" = la fuente falló al leerse. */
export type IssueLevel = "missing" | "broken";

export interface DataIssue {
  source: IssueSource;
  field: string;
  level: IssueLevel;
  detail?: string;
}

/** Memoria humana del proyecto (rol: memoria — hoy Obsidian). */
export interface ProjectMemory {
  status: string | null;
  purpose: string | null;
  stack: string | null;
  currentChallenge: string | null;
  validation: string | null;
  nextStep: string | null;
  latestSession: string | null;
  openSession: boolean;
  sessionCount: number;
  totalSessionMinutes: number;
}

/** Campos que la memoria debe documentar; su ausencia es un issue "missing". */
export const REQUIRED_MEMORY_FIELDS: ReadonlyArray<keyof ProjectMemory> = [
  "status",
  "purpose",
  "currentChallenge",
  "validation",
  "nextStep",
];

export function validateMemory(memory: ProjectMemory): DataIssue[] {
  return REQUIRED_MEMORY_FIELDS.filter((field) => memory[field] === null).map((field) => ({
    field,
    level: "missing" as const,
    source: "memory" as const,
  }));
}

/** Evidencia versionada (rol: evidencia — Git, permanente). */
export interface ProjectEvidence {
  present: boolean;
  branch: string | null;
  dirty: boolean;
  latestCommit: string | null;
  latestCommitDate: string | null;
  latestTag: string | null;
}

/** Contexto técnico derivado (rol: grafo — hoy Graphify). */
export interface ProjectGraph {
  present: boolean;
  nodes: number | null;
  edges: number | null;
  updated: string | null;
}

/**
 * Instantánea canónica por proyecto: lo que consume la UI y lo que expondrá
 * la API futura. Los campos de texto llegan con fallback aplicado; la verdad
 * sobre ausencias/errores vive en `issues`.
 */
export interface ProjectCard {
  schemaVersion: number;
  id: string;
  slug: string;
  name: string;
  /** Carpeta del proyecto dentro de la bóveda (para deep links obsidian://). */
  obsidianFolder: string;
  /** true si el registry resolvió un repositorio local. */
  resolved: boolean;
  status: string;
  purpose: string;
  stack: string;
  currentChallenge: string;
  validation: string;
  nextStep: string;
  latestSession: string;
  sessionCount: number;
  totalSessionMinutes: number;
  openSession: boolean;
  graphify: ProjectGraph;
  git: ProjectEvidence;
  health: number;
  alerts: string[];
  issues: DataIssue[];
}
